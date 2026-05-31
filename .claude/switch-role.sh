#!/bin/bash
# ============================================================
# 假装社区 — 角色会话切换器
# 用法: bash .claude/switch-role.sh [product|ui|dev|test]
#
# 每个角色运行在独立的 Claude Code 会话中，上下文完全隔离。
# ============================================================

set -e

ROLE="${1:-}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 颜色输出
BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
RESET="\033[0m"

print_usage() {
  echo ""
  echo -e "${BOLD}🏘️  假装社区 — 角色会话切换器${RESET}"
  echo ""
  echo "用法:"
  echo "  bash .claude/switch-role.sh <角色名>"
  echo ""
  echo "可用角色:"
  echo "  product  — 产品经理 (需求分析、PRD、用户故事)"
  echo "  ui       — UI 设计师 (页面设计、组件规范、交互方案)"
  echo "  dev      — 全栈开发 (功能实现、API、数据库)"
  echo "  test     — 测试工程 (测试策略、用例、Bug 报告)"
  echo ""
  echo "示例:"
  echo "  bash .claude/switch-role.sh product"
  echo ""
  echo "原理:"
  echo "  每个角色应该在自己独立的终端/VSCode 窗口中运行，"
  echo "  这样才能保证上下文完全隔离，互不污染。"
  echo ""
}

# 检查角色是否有效
case "$ROLE" in
  product|ui|dev|test)
    ;;
  *)
    print_usage
    exit 1
    ;;
esac

ROLE_FILE="$PROJECT_DIR/.claude/roles/${ROLE}.md"

if [ ! -f "$ROLE_FILE" ]; then
  echo "❌ 角色文件不存在: $ROLE_FILE"
  exit 1
fi

# 角色名称映射
case "$ROLE" in
  product) ROLE_NAME="产品经理" ;;
  ui)      ROLE_NAME="UI 设计师" ;;
  dev)     ROLE_NAME="全栈开发者" ;;
  test)    ROLE_NAME="测试工程师" ;;
esac

echo ""
echo -e "${GREEN}✅ 已选择角色: ${BOLD}${ROLE_NAME}${RESET}"
echo ""

# 将角色上下文复制到剪贴板
INIT_PROMPT="请严格按照 .claude/roles/${ROLE}.md 中的角色设定工作。
你是「假装社区」项目的${ROLE_NAME}。
先阅读角色文件内容，确认你理解了自己的职责范围和工作规范，然后告诉我你准备好了。"

if command -v pbcopy &>/dev/null; then
  echo "$INIT_PROMPT" | pbcopy
  echo -e "${GREEN}📋 启动提示词已复制到剪贴板${RESET}"
  echo ""
  echo -e "${BOLD}下一步操作:${RESET}"
  echo ""
  echo -e "  ${BLUE}方式 1 — VSCode (推荐)${RESET}"
  echo "    1. 打开新的 VSCode 窗口: Cmd+Shift+N"
  echo "    2. 打开假装社区项目"
  echo "    3. Cmd+Shift+P → 'Claude Code: New Chat' 开启新对话"
  echo "    4. Cmd+V 粘贴启动提示词"
  echo ""
  echo -e "  ${BLUE}方式 2 — 终端${RESET}"
  echo "    1. 打开新的终端标签页: Cmd+T"
  echo "    2. cd 假装社区"
  echo "    3. 输入 claude"
  echo "    4. Cmd+V 粘贴启动提示词"
  echo ""
elif command -v xclip &>/dev/null; then
  echo "$INIT_PROMPT" | xclip -selection clipboard
  echo -e "${GREEN}📋 启动提示词已复制到剪贴板${RESET}"
else
  echo -e "${YELLOW}📋 请复制以下启动提示词:${RESET}"
  echo ""
  echo "  -----------------------------------------------"
  echo "  $INIT_PROMPT"
  echo "  -----------------------------------------------"
fi

echo ""
echo -e "${YELLOW}⚠️  重要提醒: 每个角色必须在独立的对话中运行，"
echo "   不要在同一对话中反复切换角色，否则上下文会互相污染。${RESET}"
echo ""
echo -e "💡 产出物通过 ${BOLD}docs/ ${RESET}目录传递:"
echo "   产品 → docs/prd-*.md"
echo "   UI   → docs/ui-*.md"
echo "   开发 → 代码 (app/ components/ lib/)"
echo "   测试 → docs/test-*.md + tests/"
echo ""
