/**
 * 假装社区 — 内容翻译
 *
 * 将英文 title/summary 翻译为中文。
 * 使用 Google Translate 免费接口（无需 API Key）。
 */

/**
 * 翻译单段文本。自动检测是否需要翻译（纯中文/短文本跳过）。
 */
export async function translateToChinese(text: string): Promise<string> {
  if (!text || text.length < 3) return text

  // 如果中文占比 > 50%，跳过翻译
  const chineseChars = (text.match(/[一-鿿]/g) || []).length
  if (chineseChars > text.length * 0.5) return text

  try {
    const url = new URL("https://translate.googleapis.com/translate_a/single")
    url.searchParams.set("client", "gtx")
    url.searchParams.set("sl", "auto")
    url.searchParams.set("tl", "zh-CN")
    url.searchParams.set("dt", "t")
    url.searchParams.set("q", text.slice(0, 1500))

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    })

    const json = (await res.json()) as any
    const parts: string[] = []
    for (const block of json[0] ?? []) {
      if (block[0]) parts.push(block[0])
    }
    return parts.join("") || text
  } catch {
    return text
  }
}

/**
 * 翻译采集项的 title 和 summary。
 */
export async function translateItem(item: {
  title: string
  summary?: string
}): Promise<{ titleZh: string; summaryZh: string }> {
  const [titleZh, summaryZh] = await Promise.all([
    translateToChinese(item.title),
    item.summary ? translateToChinese(item.summary) : Promise.resolve(""),
  ])
  return { titleZh, summaryZh }
}
