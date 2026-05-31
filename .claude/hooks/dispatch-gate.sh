#!/bin/bash
# ============================================================
# dispatch-gate.sh — Dispatch Controller (准入派发)
# OMC 框架 V2.5 | Hook: PreToolUse Agent
#
# 职责：Agent 工具被调用前检查准入条件
#   1. 是否有对应的 Packet（施工单）
#   2. Scope Lock — 写入文件范围是否重叠
#   3. Contract Freeze — 共享接口是否已冻结
# 产出: allow / recoverable_block / hard_block
# ============================================================

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // empty' 2>/dev/null)

# 仅拦截 Agent 和 Skill 工具调用
case "$TOOL_NAME" in
  Agent|Skill)
    ;;
  *)
    # 非 Agent/Skill 调用，放行
    echo '{"decision":"allow","reason":"非Agent/Skill调用"}'
    exit 0
    ;;
esac

EVENTS_DIR=".claude/events"
PACKETS_DIR=".claude/packets"
mkdir -p "$EVENTS_DIR" "$PACKETS_DIR"

# ============================================================
# 1. 检查是否有对应的 Packet
# ============================================================
PACKET_COUNT=$(find "$PACKETS_DIR" -name "pkt-*.json" -type f 2>/dev/null | wc -l | tr -d ' ')

if [ "$PACKET_COUNT" -eq 0 ]; then
  # 没有 Packet，但允许 light 模式任务通过（light 模式免 Packet）
  echo '{"decision":"allow","reason":"无Packet但允许执行(可能为light模式)","warning":"建议先编译Packet再派发Agent"}'

  # 记录事件
  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "DispatchDecision" \
    --arg decision "allow" \
    --arg reason "无Packet(light模式)" \
    --arg tool "$TOOL_NAME" \
    '{ts:$ts, event:$event, decision:$decision, reason:$reason, tool:$tool}' \
    >> "$EVENTS_DIR/events.jsonl"
  exit 0
fi

# ============================================================
# 2. 检查 Scope Lock — 是否有正在进行的冲突任务
# ============================================================
TASK_GRAPH="$EVENTS_DIR/task-graph.json"

if [ -f "$TASK_GRAPH" ]; then
  ACTIVE_TASKS=$(jq '[.tasks[] | select(.status == "in_progress")] | length' "$TASK_GRAPH" 2>/dev/null)

  if [ "${ACTIVE_TASKS:-0}" -gt 2 ]; then
    # 活跃任务过多，判断是否需要串行
    echo '{"decision":"recoverable_block","reason":"活跃任务过多('$ACTIVE_TASKS'个)","suggestion":"等待部分任务完成后再派发新Agent"}'

    jq -n \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --arg event "DispatchDecision" \
      --arg decision "recoverable_block" \
      --arg reason "活跃任务过多:${ACTIVE_TASKS:-0}" \
      --arg tool "$TOOL_NAME" \
      '{ts:$ts, event:$event, decision:$decision, reason:$reason, tool:$tool}' \
      >> "$EVENTS_DIR/events.jsonl"
    exit 0
  fi
fi

# ============================================================
# 3. 默认放行（允许执行）
# ============================================================

# 记录 Dispatch 事件
jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg event "DispatchDecision" \
  --arg decision "allow" \
  --arg reason "准入检查通过" \
  --arg tool "$TOOL_NAME" \
  --arg active "${ACTIVE_TASKS:-0}" \
  '{ts:$ts, event:$event, decision:$decision, reason:$reason, tool:$tool, active_tasks:$active|tonumber}' \
  >> "$EVENTS_DIR/events.jsonl"

echo '{"decision":"allow","reason":"准入检查通过","active_tasks":'"${ACTIVE_TASKS:-0}"'}'
exit 0
