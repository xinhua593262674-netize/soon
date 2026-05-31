/**
 * GitHub 内容采集
 *
 * 通过 GitHub REST API 获取仓库最新 Release / 动态。
 * 可选 GITHUB_TOKEN 提高 API 限额 (未认证: 60次/h, 已认证: 5000次/h)
 */

import type { CrawledItem } from "../index"

interface GHSource {
  id: string
  name: string
  url: string
  isSeed: boolean
  followerCount: number
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ""

export async function crawlGitHub(sources: GHSource[]): Promise<CrawledItem[]> {
  const items: CrawledItem[] = []

  for (const source of sources) {
    const { owner, repo } = parseRepoUrl(source.url)
    if (!owner || !repo) {
      console.warn(`   ⚠️  无法解析 GitHub URL: ${source.url}`)
      continue
    }

    const headers: Record<string, string> = {
      "User-Agent": "JiazhuangCommunity/1.0",
      Accept: "application/vnd.github+json",
    }
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`
    }

    try {
      // 获取仓库信息
      const repoUrl = `https://api.github.com/repos/${owner}/${repo}`
      const repoRes = await fetch(repoUrl, { headers })
      const repoData = await repoRes.json() as any

      if (repoData.message === "Not Found") {
        console.warn(`   ⚠️  仓库不存在: ${owner}/${repo}`)
        continue
      }

      // 采集 1: 最新 Release
      try {
        const releaseUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=3`
        const releaseRes = await fetch(releaseUrl, { headers })
        const releases = await releaseRes.json() as any[]

        if (Array.isArray(releases)) {
          for (const r of releases) {
            items.push({
              title: `${repoData.full_name} ${r.tag_name}: ${r.name ?? ""}`,
              url: r.html_url ?? "",
              summary: (r.body ?? "").slice(0, 500),
              contentType: "REPOSITORY",
              platform: "GITHUB",
              publishedAt: new Date(r.published_at ?? r.created_at ?? Date.now()),
              sourceId: source.id,
              sourceIsSeed: source.isSeed,
              sourceFollowerCount: source.followerCount,
              tags: repoData.topics ?? [],
              starCount: repoData.stargazers_count ?? 0,
              likeCount: 0,
              commentCount: 0,
              metadata: {
                fullName: repoData.full_name,
                stars: repoData.stargazers_count ?? 0,
                forks: repoData.forks_count ?? 0,
                language: repoData.language ?? "",
                topics: repoData.topics ?? [],
                description: repoData.description ?? "",
              },
            })
          }
        }
      } catch {
        // release 获取失败不阻塞
      }

      // 采集 2: 仓库本身作为一条内容（如果它是热门/趋势仓库）
      items.push({
        title: `${repoData.full_name}: ${repoData.description ?? ""}`,
        url: repoData.html_url ?? `https://github.com/${owner}/${repo}`,
        summary: (repoData.description ?? "").slice(0, 500),
        contentType: "REPOSITORY",
        platform: "GITHUB",
        publishedAt: new Date(repoData.pushed_at ?? repoData.updated_at ?? Date.now()),
        sourceId: source.id,
        sourceIsSeed: source.isSeed,
        sourceFollowerCount: source.followerCount,
        tags: repoData.topics ?? [],
        starCount: repoData.stargazers_count ?? 0,
        likeCount: 0,
        commentCount: repoData.open_issues_count ?? 0,
        metadata: {
          fullName: repoData.full_name,
          stars: repoData.stargazers_count ?? 0,
          forks: repoData.forks_count ?? 0,
          language: repoData.language ?? "",
          topics: repoData.topics ?? [],
          openIssues: repoData.open_issues_count ?? 0,
        },
      })
    } catch (e) {
      console.warn(`   ⚠️  GitHub 采集失败 (${source.name}):`, e)
    }

    await sleep(300)
  }

  return items
}

function parseRepoUrl(url: string): { owner: string; repo: string } {
  // https://github.com/owner/repo
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  return m ? { owner: m[1] ?? "", repo: m[2] ?? "" } : { owner: "", repo: "" }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
