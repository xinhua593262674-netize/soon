/**
 * YouTube 内容采集
 *
 * 通过 YouTube Data API v3 获取频道最新视频。
 * 需要 YOUTUBE_API_KEY 环境变量。
 * API: https://www.googleapis.com/youtube/v3/search
 */

import type { CrawledItem } from "../index"

interface YTSource {
  id: string
  name: string
  url: string
  isSeed: boolean
  followerCount: number
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? ""

export async function crawlYouTube(sources: YTSource[]): Promise<CrawledItem[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn("   ⚠️  未设置 YOUTUBE_API_KEY，跳过 YouTube 采集")
    return []
  }

  const items: CrawledItem[] = []

  for (const source of sources) {
    // 从 URL 提取 channel ID 或使用 @handle
    const channelId = extractChannelId(source.url)
    if (!channelId) {
      console.warn(`   ⚠️  无法从 URL 提取 channelId: ${source.url}`)
      continue
    }

    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/search")
      url.searchParams.set("part", "snippet")
      url.searchParams.set("channelId", channelId)
      url.searchParams.set("order", "date")
      url.searchParams.set("maxResults", "5")
      url.searchParams.set("key", YOUTUBE_API_KEY)

      const res = await fetch(url.toString())
      const json = await res.json() as any

      const videos = json?.items ?? []
      for (const v of videos) {
        if (v.id?.kind !== "youtube#video") continue

        const videoId = v.id?.videoId ?? ""
        const snippet = v.snippet ?? {}

        items.push({
          title: snippet.title ?? "",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          summary: snippet.description?.slice(0, 500) ?? "",
          thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? "",
          contentType: "VIDEO",
          platform: "YOUTUBE",
          publishedAt: new Date(snippet.publishedAt ?? Date.now()),
          sourceId: source.id,
          sourceIsSeed: source.isSeed,
          sourceFollowerCount: source.followerCount,
          likeCount: 0, // 需要额外 API 调用获取 statistics
          commentCount: 0,
          viewCount: 0,
          metadata: {
            videoId,
            channelId: snippet.channelId ?? "",
            channelTitle: snippet.channelTitle ?? "",
          },
        })
      }
    } catch (e) {
      console.warn(`   ⚠️  YouTube 采集失败 (${source.name}):`, e)
    }

    await sleep(300)
  }

  return items
}

function extractChannelId(url: string): string | null {
  // https://www.youtube.com/@handle
  // https://www.youtube.com/channel/UCxxxxxx
  const channelMatch = url.match(/youtube\.com\/channel\/([\w-]+)/)
  if (channelMatch) return channelMatch[1] ?? null

  // @handle: 需要使用 API 查询，此处先跳过
  // TODO: 支持 @handle → channelId 转换
  console.warn(`   ⚠️  @handle 格式暂不支持，请使用 /channel/xxx 格式: ${url}`)
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
