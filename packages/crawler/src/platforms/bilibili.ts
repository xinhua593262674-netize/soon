/**
 * B站 内容采集
 *
 * 通过 B站 API 获取 UP 主的最新视频。
 * 使用 WBI 签名避免反爬拦截。
 */

import crypto from "crypto"
import type { CrawledItem } from "../index"

interface BiliSource {
  id: string
  name: string
  url: string
  isSeed: boolean
  followerCount: number
}

// WBI 混音表
const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
]

let wbiKeyCache = ""
let wbiKeyExpires = 0

function md5(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex")
}

function getMixinKey(imgKey: string, subKey: string): string {
  const s = imgKey + subKey
  let result = ""
  for (let i = 0; i < 32; i++) {
    const idx = MIXIN_KEY_ENC_TAB[i]!
    result += s[idx] ?? ""
  }
  return result.slice(0, 32)
}

async function fetchWbiKey(): Promise<string> {
  if (wbiKeyCache && Date.now() < wbiKeyExpires) return wbiKeyCache

  const res = await fetch("https://api.bilibili.com/x/web-interface/nav", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://www.bilibili.com",
    },
  })
  const json = await res.json() as any
  const imgUrl = json?.data?.wbi_img?.img_url ?? ""
  const subUrl = json?.data?.wbi_img?.sub_url ?? ""

  if (imgUrl && subUrl) {
    const imgKey = imgUrl.split("/").pop()?.split(".")[0] ?? ""
    const subKey = subUrl.split("/").pop()?.split(".")[0] ?? ""
    wbiKeyCache = getMixinKey(imgKey, subKey)
    wbiKeyExpires = Date.now() + 3600000
  }

  return wbiKeyCache
}

function signParams(params: Record<string, string | number>, key: string): string {
  const signed = { ...params, wts: Math.floor(Date.now() / 1000) }
  const sorted = Object.entries(signed)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&")
  const wRid = md5(sorted + key)
  return `${sorted}&w_rid=${wRid}`
}

export async function crawlBilibili(sources: BiliSource[]): Promise<CrawledItem[]> {
  const items: CrawledItem[] = []

  for (const source of sources) {
    const uid = extractUid(source.url)
    if (!uid) {
      console.warn(`   ⚠️  无法从 URL 提取 UID: ${source.url}`)
      continue
    }

    try {
      const wbiKey = await fetchWbiKey()
      if (!wbiKey) {
        console.warn(`   ⚠️  获取 WBI key 失败`)
        continue
      }

      const params = signParams({ mid: uid, ps: 10 }, wbiKey)

      const url = `https://api.bilibili.com/x/space/wbi/arc/search?${params}`
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Referer: "https://www.bilibili.com",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
      })

      const json = await res.json() as any
      const videos = json?.data?.list?.vlist ?? []

      for (const v of videos) {
        const title = v.title ?? ""
        const bvid = v.bvid ?? ""
        if (!title || !bvid) continue

        items.push({
          title,
          url: `https://www.bilibili.com/video/${bvid}`,
          summary: v.description ?? "",
          thumbnailUrl: v.pic ?? "",
          contentType: "VIDEO",
          platform: "BILIBILI",
          publishedAt: new Date((v.created ?? Date.now() / 1000) * 1000),
          sourceId: source.id,
          sourceIsSeed: source.isSeed,
          sourceFollowerCount: source.followerCount,
          tags: extractTags(title, v.description ?? ""),
          likeCount: 0,
          commentCount: v.comment ?? 0,
          viewCount: v.play ?? 0,
          metadata: { bvid, duration: v.length ?? "", play: v.play ?? 0, comment: v.comment ?? 0 },
        })
      }
    } catch (e) {
      console.warn(`   ⚠️  B站采集失败 (${source.name}):`, e)
    }

    await sleep(500)
  }

  return items
}

function extractUid(url: string): string | null {
  const m = url.match(/space\.bilibili\.com\/(\d+)/)
  return m ? (m[1] ?? null) : null
}

function extractTags(title: string, desc: string): string[] {
  const tags: string[] = []
  const hashtags = (title + " " + desc).match(/#([\w一-鿿]+)/g)
  if (hashtags) {
    for (const t of hashtags) tags.push(t.replace("#", "").trim())
  }
  return tags
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
