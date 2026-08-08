import { defaultConfig, type Sponsor } from '@explainer/config'

export type { Sponsor }

export const defaultSponsors: Sponsor[] = defaultConfig.sponsors

export const sponsorTierStyles: Record<Sponsor['tier'], string> = {
  gold: 'border-yellow-500/50 bg-yellow-500/5',
  silver: 'border-zinc-400/50 bg-zinc-400/5',
  bronze: 'border-orange-700/50 bg-orange-700/5',
}

export const sponsorBadgeStyles: Record<Sponsor['tier'], string> = {
  gold: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  silver: 'bg-zinc-400/15 text-zinc-600 dark:text-zinc-400',
  bronze: 'bg-orange-700/15 text-orange-800 dark:text-orange-400',
}

export function getSponsors(overrides?: Partial<Record<string, Sponsor>>): Sponsor[] {
  return defaultSponsors.map((sponsor) => ({
    ...sponsor,
    ...overrides?.[sponsor.id],
  }))
}
