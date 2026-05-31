#!/bin/bash
# ============================================================
# barrier-controller.sh — Barrier Controller (证据验收)
# OMC 框架 V2.5 | 由 Orchestrator 主动调用
#
# 职责：机器判断任务是否真的完成
#   1. 逐条检查 acceptance criteria 是否有证据支撑
#   2. 验证修改的文件在 scope 范围内
#   3. 产出: pass / fail / needs_more_evidence
# ============================================================

PACKET_ID="${1:-}"
REPORT_FILE="${2:-}"

# 用法提示
if [ -z "$PACKET_ID" ]; then
  echo "用法: bash .claude/hooks/barrier-controller.sh <packet_id> [report_file]"
  echo ""
  echo "Barrier Controller — OMC 框架的证据验收节点"
  echo ""
  echo "职责:"
  echo "  1. 逐条检查 acceptance criteria 是否有证据支撑"
  echo "  2. 验证修改的文件在 scope 范围内"
  echo "  3. 产出: pass / fail / needs_more_evidence"
  exit 1
fi

PACKETS_DIR=".claude/packets"
EVENTS_DIR=".claude/events"
mkdir -p "$EVENTS_DIR"

PACKET_FILE="$PACKETS_DIR/${PACKET_ID}.json"

# 如果未指定 report，自动查找
if [ -z "$REPORT_FILE" ]; then
  REPORT_FILE="$PACKETS_DIR/${PACKET_ID}-report.json"
fi

# ============================================================
# 1. 检查 Packet 是否存在
# ============================================================
if [ ! -f "$PACKET_FILE" ]; then
  echo '{"barrier_result":"fail","reason":"Packet文件不存在: '"$PACKET_FILE"'"}'

  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "BarrierResult" \
    --arg packet_id "$PACKET_ID" \
    --arg result "fail" \
    --arg reason "Packet文件不存在" \
    '{ts:$ts, event:$event, packet_id:$packet_id, result:$result, reason:$reason}' \
    >> "$EVENTS_DIR/events.jsonl"
  exit 1
fi

# ============================================================
# 2. 检查 Report 是否存在
# ============================================================
if [ ! -f "$REPORT_FILE" ]; then
  echo '{"barrier_result":"needs_more_evidence","reason":"Report文件不存在: '"$REPORT_FILE"'","action":"Agent需产出report.json"}'

  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "BarrierResult" \
    --arg packet_id "$PACKET_ID" \
    --arg result "needs_more_evidence" \
    --arg reason "Report文件不存在" \
    '{ts:$ts, event:$event, packet_id:$packet_id, result:$result, reason:$reason}' \
    >> "$EVENTS_DIR/events.jsonl"
  exit 1
fi

# ============================================================
# 3. 逐条验收 acceptance criteria
# ============================================================
SCORE=0
MAX_SCORE=0
AC_DETAILS=""

# 读取验收标准
AC_COUNT=$(jq '.acceptance | length' "$PACKET_FILE" 2>/dev/null)
if [ "${AC_COUNT:-0}" -eq 0 ]; then
  echo '{"barrier_result":"fail","reason":"Packet未定义acceptance criteria"}'
  exit 1
fi

# 读取 report 中的验证信息
REPORT_SUMMARY=$(jq -r '.summary // "无"' "$REPORT_FILE" 2>/dev/null)
REPORT_STATUS=$(jq -r '.status // "unknown"' "$REPORT_FILE" 2>/dev/null)
REPORT_TESTS=$(jq -r '.verification.tests_passed // false' "$REPORT_FILE" 2>/dev/null)
REPORT_FILES=$(jq -r '.files_changed | join(", ") // "无"' "$REPORT_FILE" 2>/dev/null)

# 逐条检查
for i in $(seq 0 $((AC_COUNT - 1))); do
  AC_ITEM=$(jq -r ".acceptance[$i]" "$PACKET_FILE" 2>/dev/null)
  MAX_SCORE=$((MAX_SCORE + 1))

  # 简单启发式检查：在 report summary 和 verification 中搜索关键词
  AC_KEYWORDS=$(echo "$AC_ITEM" | tr ' ' '|' | sed 's/[^a-zA-Z0-9|一-龥]//g')

  if echo "$REPORT_SUMMARY $(jq -r '.verification.manual_check // ""' "$REPORT_FILE" 2>/dev/null) $(jq -r '.details // ""' "$REPORT_FILE" 2>/dev/null)" | grep -qiE "$AC_KEYWORDS" 2>/dev/null; then
    # 报告提及了此验收条件
    if [ "$REPORT_TESTS" = "true" ]; then
      AC_DETAILS="$AC_DETAILS ✅ [$AC_ITEM] — 测试通过+报告覆盖\n"
      SCORE=$((SCORE + 1))
    else
      AC_DETAILS="$AC_DETAILS ⚠️ [$AC_ITEM] — 报告提及但测试未通过\n"
      SCORE=$((SCORE + 1))  # 仍计分但标记
    fi
  else
    AC_DETAILS="$AC_DETAILS ❌ [$AC_ITEM] — 无证据支撑\n"
  fi
done

# ============================================================
# 4. 检查 Scope 合规性
# ============================================================
SCOPE_FILES=$(jq -r '.scope.files | join(" ") // ""' "$PACKET_FILE" 2>/dev/null)
SCOPE_VIOLATION=false

for f in $(echo "$REPORT_FILES" | tr ',' ' '); do
  f=$(echo "$f" | xargs)  # trim
  if [ -n "$f" ] && ! echo "$SCOPE_FILES" | grep -qF "$f" 2>/dev/null; then
    SCOPE_VIOLATION=true
    AC_DETAILS="$AC_DETAILS 🚨 Scope违规: $f 不在允许修改列表中\n"
  fi
done

# ============================================================
# 5. 最终裁决
# ============================================================
PASS_RATE=$((SCORE * 100 / MAX_SCORE))

if [ "$SCOPE_VIOLATION" = true ]; then
  RESULT="fail"
  RESULT_REASON="Scope违规：修改了Packet范围外的文件"
elif [ $PASS_RATE -ge 80 ]; then
  RESULT="pass"
  RESULT_REASON="验收通过 (${PASS_RATE}% — $SCORE/$MAX_SCORE)"
elif [ $PASS_RATE -ge 50 ]; then
  RESULT="needs_more_evidence"
  RESULT_REASON="证据不足 (${PASS_RATE}% — $SCORE/$MAX_SCORE)，需要补充以下验收条件: $(echo -e "$AC_DETAILS" | grep '❌')"
else
  RESULT="fail"
  RESULT_REASON="验收失败 (${PASS_RATE}% — $SCORE/$MAX_SCORE)，大部分验收条件无证据支撑"
fi

# ============================================================
# 6. 记录 Barrier 事件 & 输出结果
# ============================================================
jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg event "BarrierResult" \
  --arg packet_id "$PACKET_ID" \
  --arg result "$RESULT" \
  --arg reason "$RESULT_REASON" \
  --arg pass_rate "$PASS_RATE" \
  --arg scope_violation "$SCOPE_VIOLATION" \
  '{ts:$ts, event:$event, packet_id:$packet_id, result:$result, reason:$reason, pass_rate:($pass_rate|tonumber), scope_violation:($scope_violation|test("true"))}' \
  >> "$EVENTS_DIR/events.jsonl"

# 输出验收结果
jq -n \
  --arg result "$RESULT" \
  --arg reason "$RESULT_REASON" \
  --arg pass_rate "$PASS_RATE%" \
  --arg score "$SCORE/$MAX_SCORE" \
  --arg scope_violation "$SCOPE_VIOLATION" \
  --arg details "$(echo -e "$AC_DETAILS")" \
  '{barrier_result:$result, reason:$reason, score:$score, pass_rate:$pass_rate, scope_violation:($scope_violation|test("true")), details:$details}'

# 非 pass 则退出非零
if [ "$RESULT" != "pass" ]; then
  exit 1
fi

exit 0
