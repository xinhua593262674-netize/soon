#!/bin/bash
# ============================================================
# agent-return-gate.sh — Return Controller (返回隔离)
# OMC 框架 V2.5 | Hook: PostToolUse Agent
#
# 职责：Agent 返回后验证证据完整性
#   1. 检查 Agent 是否产出了 report.json
#   2. 验证 report.json 包含必要字段
#   3. 不合规的返回 → 隔离（quarantine），不进入下游
# ============================================================

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
TOOL_RESULT=$(echo "$INPUT" | jq -r '.tool_result // empty' 2>/dev/null)

# 仅处理 Agent 和 Skill 返回
case "$TOOL_NAME" in
  Agent|Skill)
    ;;
  *)
    echo '{"status":"skipped","reason":"非Agent/Skill返回"}'
    exit 0
    ;;
esac

EVENTS_DIR=".claude/events"
PACKETS_DIR=".claude/packets"
mkdir -p "$EVENTS_DIR" "$PACKETS_DIR"

# ============================================================
# 1. 检查是否产出了 report.json
# ============================================================
# 查找最近修改的 report 文件
LATEST_REPORT=$(find "$PACKETS_DIR" -name "*-report.json" -type f -newer "$EVENTS_DIR/events.jsonl" 2>/dev/null | head -1)

if [ -z "$LATEST_REPORT" ]; then
  # 没有新 report，隔离返回
  echo '{"status":"quarantined","reason":"Agent返回但未产出report.json","action":"返回被隔离，请要求Agent补充report.json"}'

  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "AgentReturned" \
    --arg status "quarantined" \
    --arg reason "缺少report.json" \
    --arg tool "$TOOL_NAME" \
    '{ts:$ts, event:$event, status:$status, reason:$reason, tool:$tool}' \
    >> "$EVENTS_DIR/events.jsonl"
  exit 0
fi

# ============================================================
# 2. 验证 report.json 包含必要字段
# ============================================================
REQUIRED_FIELDS=("packet_id" "status" "files_changed" "summary" "verification")
MISSING_FIELDS=""

for field in "${REQUIRED_FIELDS[@]}"; do
  if ! jq -e ".$field" "$LATEST_REPORT" > /dev/null 2>&1; then
    MISSING_FIELDS="$MISSING_FIELDS $field"
  fi
done

if [ -n "$MISSING_FIELDS" ]; then
  echo '{"status":"quarantined","reason":"report.json缺少必要字段","missing_fields":"'"$MISSING_FIELDS"'","action":"补充缺失字段"}'

  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "AgentReturned" \
    --arg status "quarantined" \
    --arg reason "report不完整:${MISSING_FIELDS}" \
    --arg tool "$TOOL_NAME" \
    --arg report "$LATEST_REPORT" \
    '{ts:$ts, event:$event, status:$status, reason:$reason, tool:$tool, report:$report}' \
    >> "$EVENTS_DIR/events.jsonl"
  exit 0
fi

# ============================================================
# 3. 更新 task-graph 状态
# ============================================================
PACKET_ID=$(jq -r '.packet_id // empty' "$LATEST_REPORT" 2>/dev/null)
TASK_GRAPH="$EVENTS_DIR/task-graph.json"

if [ -f "$TASK_GRAPH" ] && [ -n "$PACKET_ID" ]; then
  # 标记任务为已完成
  jq --arg pid "$PACKET_ID" '.tasks = [.tasks[] | if .packet_id == $pid then .status = "completed" else . end]' \
    "$TASK_GRAPH" > "$TASK_GRAPH.tmp" 2>/dev/null && mv "$TASK_GRAPH.tmp" "$TASK_GRAPH"
fi

# ============================================================
# 4. 记录返回事件，放行
# ============================================================
STATUS=$(jq -r '.status // "unknown"' "$LATEST_REPORT" 2>/dev/null)
FILES_CHANGED=$(jq -r '.files_changed | length // 0' "$LATEST_REPORT" 2>/dev/null)

jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg event "AgentReturned" \
  --arg status "accepted" \
  --arg packet_id "$PACKET_ID" \
  --arg report "$LATEST_REPORT" \
  --argjson files "$FILES_CHANGED" \
  '{ts:$ts, event:$event, status:$status, packet_id:$packet_id, report:$report, files_changed:$files}' \
  >> "$EVENTS_DIR/events.jsonl"

echo '{"status":"accepted","packet_id":"'"$PACKET_ID"'","report":"'"$LATEST_REPORT"'","files_changed":'"$FILES_CHANGED"'}'
exit 0
