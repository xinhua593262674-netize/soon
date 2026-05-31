/**
 * B站 内容采集
 *
 * 通过 B站 API (无认证) 获取 UP 主的最新视频。
 * API: https://api.bilibili.com/x/space/wbi/arc/search?mid={uid}&ps=10
 */

import type { CrawledItem } from "../index"

interface BiliSource {
  id: string
  name: string
  url: string
  isSeed: boolean
  followerCount: number
}

export async function crawlBilibili(sources: BiliSource[]): Promise<CrawledItem[]> {
  const items: CrawledItem[] = []

  for (const source of sources) {
    // 从 URL 提取 UID
    const uid = extractUid(source.url)
    if (!uid) {
      console.warn(`   ⚠️  无法从 URL 提取 UID: ${source.url}`)
      continue
    }

    try {
      const url = `https://api.bilibili.com/x/space/wbi/arc/search?mid=${uid}&ps=5&order=pubdate`
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) JiazhuangCommunity/1.0",
          Referer: "https://www.bilibili.com",
        },
      })

      const json = await res.json() as any
      const videos = json?.data?.list?.vlist ?? json?.data?.list ?? []

      for (const v of videos) {
        const title = v.title ?? ""
        const bvid = v.bvid ?? ""
        if (!title || !bvid) continue

        items.push({
          title,
          url: `https://www.bilibili.com/video/${bvid}`,
          summary: v.description ?? "",
          thumbnailUrl: v.pic ?? `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
          contentType: "VIDEO",
          platform: "BILIBILI",
          publishedAt: new Date((v.created ?? v.pubdate ?? 0) * 1000),
          sourceId: source.id,
          sourceIsSeed: source.isSeed,
          sourceFollowerCount: source.followerCount,
          tags: extractTags(title, v.description ?? ""),
          likeCount: 0, // 需要额外 API 调用
          commentCount: v.comment ?? 0,
          viewCount: v.play ?? v.video_review ?? 0,
          metadata: {
            bvid,
            duration: v.length ?? "",
            play: v.play ?? 0,
            comment: v.comment ?? 0,
          },
        })
      }
    } catch (e) {
      console.warn(`   ⚠️  B站采集失败 (${source.name}):`, e)
    }

    // 避免请求过快
    await sleep(500)
  }

  return items
}

function extractUid(url: string): string | null {
  // https://space.bilibili.com/12345678
  const m = url.match(/space\.bilibili\.com\/(\d+)/)
  return m ? (m[1] ?? null) : null
}

function extractTags(title: string, desc: string): string[] {
  // 从标题和描述中提取 #标签
  const tags: string[] = []
  const hashtags = (title + " " + desc).match(/#([\w一-鿿]+)/g)
  if (hashtags) {
    for (const t of hashtags) {
      tags.push(t.replace("#", "").trim())
    }
  }
  return tags
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
