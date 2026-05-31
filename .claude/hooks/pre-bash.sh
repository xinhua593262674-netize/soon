#!/bin/bash
# ============================================================
# Pre-Bash Hook - 在 Bash 命令执行前运行
# OMC 框架 V2.5 | Hook: PreToolUse Bash
#
# 职责: 校验危险命令、记录操作日志、检查 main 分支保护
# ============================================================

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // empty')

# ============================================================
# 事件记录
# ============================================================
log_event() {
  local event_type="$1" detail="$2"
  local events_dir=".claude/events"
  mkdir -p "$events_dir"

  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "$event_type" \
    --arg command "${COMMAND:0:150}" \
    --arg detail "$detail" \
    '{ts:$ts, event:$event, command:$command, detail:$detail}' \
    >> "$events_dir/events.jsonl" 2>/dev/null
}

# ============================================================
# 危险命令黑名单检查
# ============================================================
DANGER_PATTERNS=(
  "rm -rf /"
  "git push --force origin main"
  "git push --force origin master"
  "DROP DATABASE"
  "DROP TABLE"
  "TRUNCATE"
  "> /dev/sda"
  "mkfs."
  "dd if="
  ":(){ :|:& };:"
)

for pattern in "${DANGER_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "⚠️  [Pre-Bash Hook] 检测到潜在危险命令: $COMMAND"
    echo "⚠️  匹配危险模式: $pattern"
    log_event "DangerDetected" "匹配模式: $pattern"
    # 不阻塞执行，仅告警。如需阻塞，返回非0退出码
  fi
done

# ============================================================
# main/master 分支保护
# ============================================================
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  if echo "$COMMAND" | grep -qiE "(git push --force|git reset --hard|git clean)"; then
    echo "🚨 [Pre-Bash Hook] 警告：你正在 main/master 分支上执行破坏性 Git 操作！"
    echo "🚨  命令: $COMMAND"
    log_event "Blocked" "main分支保护: 拒绝破坏性操作"
    exit 1
  fi
fi

exit 0
