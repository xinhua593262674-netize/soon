#!/bin/bash
# ============================================================
# On-Stop Hook - 在 AI 会话结束时运行
# OMC 框架 V2.5 | Hook: Stop
#
# 职责: 生成会话摘要 Projection、更新 task-graph、清理临时文件
# ============================================================

EVENTS_DIR=".claude/events"
mkdir -p "$EVENTS_DIR"

# ============================================================
# 1. 记录会话结束时间
# ============================================================
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Claude Code 会话结束" >> .claude/.session.log 2>/dev/null

# ============================================================
# 2. 生成会话摘要 Projection
# ============================================================
if [ -f "$EVENTS_DIR/events.jsonl" ]; then
  TOTAL_EVENTS=$(wc -l < "$EVENTS_DIR/events.jsonl" | tr -d ' ')
  GATE_EVENTS=$(grep -c '"GateResolved"' "$EVENTS_DIR/events.jsonl" 2>/dev/null || echo 0)
  DISPATCH_EVENTS=$(grep -c '"DispatchDecision"' "$EVENTS_DIR/events.jsonl" 2>/dev/null || echo 0)
  BARRIER_EVENTS=$(grep -c '"BarrierResult"' "$EVENTS_DIR/events.jsonl" 2>/dev/null || echo 0)
  FILE_EDITS=$(grep -c '"FileEdit\|FileEdited"' "$EVENTS_DIR/events.jsonl" 2>/dev/null || echo 0)

  # 更新 task-graph
  TASK_GRAPH="$EVENTS_DIR/task-graph.json"
  if [ -f "$TASK_GRAPH" ]; then
    COMPLETED=$(jq '[.tasks[] | select(.status == "completed")] | length' "$TASK_GRAPH" 2>/dev/null || echo 0)
    IN_PROGRESS=$(jq '[.tasks[] | select(.status == "in_progress")] | length' "$TASK_GRAPH" 2>/dev/null || echo 0)

    jq \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --argjson total_events "$TOTAL_EVENTS" \
      --argjson gate_routes "$GATE_EVENTS" \
      --argjson file_edits "$FILE_EDITS" \
      '.updated_at = $ts | .summary.total_events = $total_events | .summary.gate_routes = $gate_routes | .summary.file_edits = $file_edits' \
      "$TASK_GRAPH" > "$TASK_GRAPH.tmp" 2>/dev/null && mv "$TASK_GRAPH.tmp" "$TASK_GRAPH"
  fi

  # 记录会话结束事件
  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "SessionStopped" \
    --arg total_events "$TOTAL_EVENTS" \
    --arg gate_routes "${GATE_EVENTS:-0}" \
    --arg dispatch_decisions "${DISPATCH_EVENTS:-0}" \
    --arg barrier_results "${BARRIER_EVENTS:-0}" \
    --arg file_edits "${FILE_EDITS:-0}" \
    '{ts:$ts, event:$event, stats: {total_events:($total_events|tonumber), gate_routes:($gate_routes|tonumber), dispatch_decisions:($dispatch_decisions|tonumber), barrier_results:($barrier_results|tonumber), file_edits:($file_edits|tonumber)}}' \
    >> "$EVENTS_DIR/events.jsonl" 2>/dev/null
fi

# ============================================================
# 3. 清理临时文件
# ============================================================
rm -f /tmp/claude-temp-*.tmp 2>/dev/null

exit 0
