#!/bin/bash
# ============================================================
# Pre-Edit Hook - 在文件编辑/写入前运行
# OMC 框架 V2.5 | Hook: PreToolUse Edit|Write
#
# 职责: 检查文件状态、Scope Lock 验证、关键文件保护
# ============================================================

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

EVENTS_DIR=".claude/events"
mkdir -p "$EVENTS_DIR"

# ============================================================
# .claude/ 目录下的文件直接放行（框架自修改）
# ============================================================
if echo "$FILE_PATH" | grep -q ".claude/"; then
  exit 0
fi

# ============================================================
# Scope Lock 检查 — 是否有活跃 Packet 限制了文件修改范围
# ============================================================
PACKETS_DIR=".claude/packets"
if [ -d "$PACKETS_DIR" ]; then
  # 查找所有 active 状态的 packet
  for packet in "$PACKETS_DIR"/pkt-*.json; do
    [ -f "$packet" ] || continue

    # 跳过 report 文件
    [[ "$packet" == *-report.json ]] && continue

    PACKET_ID=$(basename "$packet" .json)
    SCOPE_FILES=$(jq -r '.scope.files[]' "$packet" 2>/dev/null)

    # 检查当前编辑的文件是否在 scope 内
    IN_SCOPE=false
    while IFS= read -r sf; do
      if echo "$FILE_PATH" | grep -qF "$sf" 2>/dev/null; then
        IN_SCOPE=true
        break
      fi
    done <<< "$SCOPE_FILES"

    if [ "$IN_SCOPE" = true ]; then
      # 记录变更事件（编辑前）
      jq -n \
        --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg event "FileEdit" \
        --arg file "$FILE_PATH" \
        --arg packet_id "$PACKET_ID" \
        --arg phase "pre" \
        '{ts:$ts, event:$event, file:$file, packet_id:$packet_id, phase:$phase}' \
        >> "$EVENTS_DIR/events.jsonl" 2>/dev/null
    fi
  done
fi

# ============================================================
# 关键配置文件保护提醒
# ============================================================
CRITICAL_FILES=(
  "package.json"
  "tsconfig.json"
  "next.config"
  "prisma/schema.prisma"
  ".env"
  ".env.local"
)

FILENAME=$(basename "$FILE_PATH")
for critical in "${CRITICAL_FILES[@]}"; do
  if [[ "$FILENAME" == "$critical" ]] || echo "$FILE_PATH" | grep -q "$critical"; then
    echo "📋 [Pre-Edit Hook] 正在修改关键配置文件: $FILE_PATH"
    echo "📋 请确保你了解此变更的影响"

    jq -n \
      --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      --arg event "CriticalFileEdit" \
      --arg file "$FILE_PATH" \
      '{ts:$ts, event:$event, file:$file}' \
      >> "$EVENTS_DIR/events.jsonl" 2>/dev/null
  fi
done

exit 0
