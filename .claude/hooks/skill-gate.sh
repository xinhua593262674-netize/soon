#!/bin/bash
# ============================================================
# skill-gate.sh — Gate Router (门禁路由)
# OMC 框架 V2.5 | Hook: UserPromptSubmit
#
# 职责：regex 粗筛用户消息 → 建议角色/技能路由 → 记录 GateResolved 事件
# 设计：双通道判断 — regex 保证不漏明显场景，LLM 精判保留上下文
# ============================================================

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)

if [ -z "$PROMPT" ]; then
  echo '{"route":"none","confidence":"low","reason":"empty prompt"}'
  exit 0
fi

# ============================================================
# Regex 粗筛规则表 — 按优先级排列
# 格式: "regex_pattern§role§confidence§reason"
# 分隔符用 § (section sign) 避免与正则中的 | 交替符冲突
# ============================================================
RULES=(
  # Product 产品经理触发词
  "PRD|产品需求|需求文档|需求分析|用户故事|user story|product requirement|竞品分析|功能优先级|产品定位|目标用户|用户旅程|P0|P1|P2§product§high§产品需求相关"

  # UI 设计师触发词
  "UI设计|UI 设计|界面设计|设计稿|wireframe|线框图|设计系统|色彩方案|字体|间距|圆角|断点|响应式|移动端适配|组件规范|hover|focus|transition|mobile first§ui§high§界面设计相关"

  # Test 测试工程师触发词
  "测试用例|test case|测试计划|单元测试|集成测试|E2E|e2e|playwright|vitest|bug报告|bug 报告|复现步骤|质量门禁|覆盖率|test plan§test§high§测试相关"

  # Dev 开发者触发词 (兜底 — 代码实现类)
  "实现|implement|开发|修改|fix|修复|重构|refactor|优化|代码|API|数据库|组件|component|页面|功能|feature§dev§medium§开发实现相关"
)

# Gate 事件记录函数
log_gate_event() {
  local route="$1" confidence="$2" reason="$3"
  local events_dir=".claude/events"
  mkdir -p "$events_dir"

  local event
  event=$(jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg event "GateResolved" \
    --arg route "$route" \
    --arg confidence "$confidence" \
    --arg reason "$reason" \
    --arg prompt "${PROMPT:0:100}" \
    '{ts:$ts, event:$event, route:$route, confidence:$confidence, reason:$reason, trigger:$prompt}')

  echo "$event" >> "$events_dir/events.jsonl"
}

# 遍历规则表，找到第一条匹配
ROUTED="none"
ROUTE_CONFIDENCE="low"
ROUTE_REASON="未匹配任何路由规则"

for rule in "${RULES[@]}"; do
  IFS='§' read -r pattern role confidence reason <<< "$rule"

  if echo "$PROMPT" | grep -qiE "$pattern"; then
    ROUTED="$role"
    ROUTE_CONFIDENCE="$confidence"
    ROUTE_REASON="$reason"
    break
  fi
done

# 特殊情况：明确的角色切换命令（如 /dev /product /test /ui）
case "$PROMPT" in
  */dev*|*"/dev"*)  ROUTED="dev"; ROUTE_CONFIDENCE="high"; ROUTE_REASON="显式角色命令 /dev" ;;
  */product*)       ROUTED="product"; ROUTE_CONFIDENCE="high"; ROUTE_REASON="显式角色命令 /product" ;;
  */test*|*/qa*)    ROUTED="test"; ROUTE_CONFIDENCE="high"; ROUTE_REASON="显式角色命令 /test" ;;
  */ui*)            ROUTED="ui"; ROUTE_CONFIDENCE="high"; ROUTE_REASON="显式角色命令 /ui" ;;
esac

# 记录 Gate 事件
log_gate_event "$ROUTED" "$ROUTE_CONFIDENCE" "$ROUTE_REASON"

# 输出 Gate 路由结果（给 Orchestrator 使用）
jq -n \
  --arg route "$ROUTED" \
  --arg confidence "$ROUTE_CONFIDENCE" \
  --arg reason "$ROUTE_REASON" \
  '{route:$route, confidence:$confidence, reason:$reason}'

exit 0
