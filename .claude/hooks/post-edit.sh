#!/bin/bash
# ============================================================
# Post-Edit Hook - 在文件编辑/写入后运行
# OMC 框架 V2.5 | Hook: PostToolUse Edit|Write
#
# 职责: 自动格式化、变更事件记录、Scope 合规检查
# ============================================================

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

EVENTS_DIR=".claude/events"
mkdir -p "$EVENTS_DIR"

# ============================================================
# 记录编辑后事件
# ============================================================
jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg event "FileEdited" \
  --arg file "$FILE_PATH" \
  --arg phase "post" \
  '{ts:$ts, event:$event, file:$file, phase:$phase}' \
  >> "$EVENTS_DIR/events.jsonl" 2>/dev/null

# ============================================================
# 自动格式化（.ts/.tsx/.js/.jsx/.json/.css/.md）
# ============================================================
EXT="${FILE_PATH##*.}"
case "$EXT" in
  ts|tsx|js|jsx|json|css|md|mjs|cjs)
    if command -v npx &>/dev/null && [ -f "package.json" ]; then
      # 默认不启用自动格式化，取消注释即可启用
      # npx prettier --write "$FILE_PATH" 2>/dev/null || true
      true
    fi
    ;;
esac

exit 0
