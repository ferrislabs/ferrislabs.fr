import { fetchContributors } from '@explainer/ui/lib/contributors'

export interface ActivityContributor {
  login: string
  avatarUrl: string
  profileUrl: string
}

export interface RepoActivity {
  owner: string
  repo: string
  stars: number
  forks: number
  contributors: number
  commits30d: number
  /** 30 compartiments quotidiens, index 0 = il y a 29 jours, index 29 = aujourd'hui */
  daily: number[]
  release: { tag: string; date: string } | null
  /** Les premiers contributeurs, pour montrer des visages plutôt que des pseudos */
  topContributors: ActivityContributor[]
  /** Date du dernier commit, pour prouver que le projet est vivant sans jargon */
  lastCommitAt: string | null
  fetchedAt: string
  /** true si au moins un appel a échoué et qu'on affiche des valeurs de repli */
  stale: boolean
}

const DAYS = 30

/**
 * Valeurs de repli, relevées le 2026-08-18. Elles ne servent qu'à empêcher le
 * build de casser ou d'afficher des zéros si l'API GitHub est indisponible ou
 * si le quota anonyme (60 req/h) est atteint.
 */
const FALLBACK = {
  stars: 681,
  forks: 93,
  contributors: 47,
  commits30d: 63,
  release: { tag: 'v0.7.2', date: '2026-07-30T00:00:00Z' },
} as const

/**
 * Repli pour la rangée d'avatars. `github.com/<login>.png` est une redirection
 * publique stable : pas besoin de l'API pour résoudre l'image.
 */
const FALLBACK_CONTRIBUTORS: ActivityContributor[] = [
  'NathaelB',
  'LeadcodeDev',
  'leroyguillaume',
  'jorisvilardell',
  'TanzilIslam',
  'NobinKhan',
].map((login) => ({
  login,
  avatarUrl: `https://github.com/${login}.png?size=64`,
  profileUrl: `https://github.com/${login}`,
}))

function headers(token?: string): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function getJson<T>(url: string, token?: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: headers(token), signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      console.warn(`[repo-activity] ${res.status} ${res.statusText} — ${url}`)
      return null
    }
    return (await res.json()) as T
  } catch (error) {
    console.warn(`[repo-activity] échec — ${url}`, error)
    return null
  }
}

function startOfDayUtc(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export async function fetchRepoActivity(options: {
  owner: string
  repo: string
  token?: string
}): Promise<RepoActivity> {
  const { owner, repo, token } = options
  const base = `https://api.github.com/repos/${owner}/${repo}`
  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString()

  const [repoRes, contributorsRes, releaseRes, commitsRes] = await Promise.all([
    getJson<{ stargazers_count: number; forks_count: number }>(base, token),
    fetchContributors({ owner, repo, token }).catch(() => []),
    getJson<{ tag_name: string; published_at: string }>(`${base}/releases/latest`, token),
    getJson<
      Array<{
        html_url: string
        commit: { message: string; author: { name: string; date: string } }
        author: { login: string } | null
      }>
    >(`${base}/commits?since=${since}&per_page=100`, token),
  ])

  // Compartimente les commits par jour pour la sparkline
  const daily = new Array<number>(DAYS).fill(0)
  const today = startOfDayUtc(new Date())
  if (commitsRes) {
    for (const c of commitsRes) {
      const day = startOfDayUtc(new Date(c.commit.author.date))
      const offset = DAYS - 1 - Math.round((today - day) / 86_400_000)
      if (offset >= 0 && offset < DAYS) daily[offset] += 1
    }
  }

  const lastCommitAt = commitsRes?.[0]?.commit.author.date ?? null

  const topContributors: ActivityContributor[] = contributorsRes.length
    ? contributorsRes.slice(0, 8).map((c) => ({
        login: c.login,
        // ?s=64 : GitHub sert une miniature au lieu de l'image pleine taille
        avatarUrl: `${c.avatarUrl}${c.avatarUrl.includes('?') ? '&' : '?'}s=64`,
        profileUrl: c.profileUrl,
      }))
    : FALLBACK_CONTRIBUTORS

  return {
    owner,
    repo,
    stars: repoRes?.stargazers_count ?? FALLBACK.stars,
    forks: repoRes?.forks_count ?? FALLBACK.forks,
    contributors: contributorsRes.length || FALLBACK.contributors,
    commits30d: commitsRes?.length ?? FALLBACK.commits30d,
    daily,
    release: releaseRes
      ? { tag: releaseRes.tag_name, date: releaseRes.published_at }
      : FALLBACK.release,
    topContributors,
    lastCommitAt,
    fetchedAt: new Date().toISOString(),
    stale: !repoRes || !commitsRes,
  }
}
