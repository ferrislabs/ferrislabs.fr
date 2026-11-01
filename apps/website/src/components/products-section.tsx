import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { PixelSprite } from './pixel/pixel-sprite'
import { cometCrab, key, toolbox, type Sprite } from './pixel/sprites'

interface Product {
  id: string
  name: string
  kicker: string
  title: string
  body: string
  points: string[]
  site: { label: string; href: string }
  repo: string
  sprite: Sprite
  /** Teintes de la mosaïque, de la plus sombre à la plus claire. */
  tiles: string[]
}

const products: Product[] = [
  {
    id: 'ferriskey',
    name: 'Ferriskey',
    kicker: 'Identité et accès',
    title: "L'IAM open source sur lequel tout le reste s'appuie.",
    body: "Ferriskey gère les comptes, les connexions et les droits. Mestier et FerrisTrace s'authentifient dessus, et on le fait tourner nous-mêmes en production.",
    points: ['OpenID Connect et OAuth 2', 'Organisations, rôles et permissions', 'Identités scopées pour les agents IA'],
    site: { label: 'ferriskey.rs', href: 'https://ferriskey.rs' },
    repo: 'https://github.com/ferriskey/ferriskey',
    sprite: key,
    tiles: ['#7a2d06', '#a83e08', '#c2410c', '#f2670f', '#ff8c42', '#ffb547'],
  },
  {
    id: 'mestier',
    name: 'Mestier',
    kicker: "Gestion d'entreprise",
    title: "L'alternative open source à Google Workspace.",
    body: "Facturation, CRM et stocks fonctionnent aujourd'hui ; la communication d'équipe, les projets, le support et les RH suivent. Vous l'hébergez où vous voulez.",
    points: ['Modules indépendants, données partagées', 'Connexion via Ferriskey', 'Licence Apache 2.0'],
    site: { label: 'mestier.fr', href: 'https://mestier.fr' },
    repo: 'https://github.com/ferrislabs/mestier',
    sprite: toolbox,
    tiles: ['#134e4a', '#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#99f6e4'],
  },
  {
    id: 'ferristrace',
    name: 'FerrisTrace',
    kicker: 'Observabilité',
    title: 'Traces, logs, incidents et agents IA, au même endroit.',
    body: "Construit sur OpenTelemetry : on suit une requête d'un service à l'autre, on ouvre l'incident avec les preuves dedans, et les agents IA enquêtent avec des droits Ferriskey.",
    points: ['Traces, logs et métriques OpenTelemetry', 'Gestion des incidents', 'Coût et latence des appels LLM'],
    site: { label: 'ferristrace.dev', href: 'https://ferristrace.dev' },
    repo: 'https://github.com/ferrislabs/ferristrace',
    sprite: cometCrab,
    tiles: ['#1e1b4b', '#312e81', '#3730a3', '#4f46e5', '#6366f1', '#a5b4fc'],
  },
]

const COLS = 14
const ROWS = 9

/** Mosaïque déterministe : même dessin au serveur et au client. */
function mosaic(seed: number, tiles: string[]) {
  let s = seed
  const random = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const x = i % COLS
    const y = Math.floor(i / COLS)
    // Plus clair vers le haut à droite, comme une lumière rasante.
    const light = (x / COLS) * 0.5 + (1 - y / ROWS) * 0.5
    const index = Math.min(tiles.length - 1, Math.max(0, Math.round(light * (tiles.length - 1) + (random() - 0.5) * 2.2)))
    return tiles[index]
  })
}

export function ProductsSection() {
  const [activeId, setActiveId] = useState(products[0].id)
  const active = products.find((p) => p.id === activeId) ?? products[0]
  const cells = useMemo(() => mosaic(products.indexOf(active) + 7, active.tiles), [active])

  // Les personnages du hero pointent vers #ferriskey, #mestier, #ferristrace.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1)
      if (products.some((p) => p.id === id)) setActiveId(id)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  return (
    <section id="produits" aria-labelledby="produits-title" className="scroll-mt-12 border-b border-border">
      <div className="mx-auto max-w-6xl border-x border-border">
        <div className="px-5 py-20 text-center sm:py-24">
          <p className="font-pixel text-[11px] uppercase tracking-[0.08em] text-primary">Nos produits</p>
          <h2
            id="produits-title"
            className="mx-auto mt-4 max-w-3xl text-balance text-[clamp(2rem,4.5vw,3.5rem)] font-medium leading-[1.05] tracking-[-0.035em]"
          >
            Trois produits, un même socle. Tout est sur GitHub.
          </h2>
        </div>

        <div className="grid border-t border-border lg:grid-cols-[240px_minmax(0,1fr)]">
          <div
            role="tablist"
            aria-label="Produits"
            className="flex overflow-x-auto border-b border-border lg:flex-col lg:border-b-0 lg:border-r"
          >
            {products.map((p) => {
              const selected = p.id === active.id
              return (
                <button
                  key={p.id}
                  id={p.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="produit-panel"
                  onClick={() => setActiveId(p.id)}
                  className={[
                    'flex shrink-0 scroll-mt-24 cursor-pointer items-center gap-3 border-r border-border px-5 py-4 text-left transition-colors lg:border-b lg:border-r-0',
                    selected ? 'bg-card text-foreground' : 'text-muted-foreground hover:bg-foreground/[0.03]',
                  ].join(' ')}
                >
                  <PixelSprite sprite={p.sprite} className="h-5 w-6 shrink-0" />
                  <span>
                    <span className="block text-[15px] font-semibold">{p.name}</span>
                    <span className="block font-pixel text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {p.kicker}
                    </span>
                  </span>
                  {selected ? <Icon icon="lucide:arrow-right" className="ml-auto hidden size-4 lg:block" aria-hidden="true" /> : null}
                </button>
              )
            })}
          </div>

          <div
            id="produit-panel"
            role="tabpanel"
            aria-labelledby={active.id}
            key={active.id}
            className="product-panel grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
          >
            <div className="flex flex-col">
              <h3 className="text-balance text-2xl font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">{active.title}</h3>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">{active.body}</p>
              <ul className="mt-6 space-y-2.5">
                {active.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm">
                    <span className="pixel-dot text-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3 xl:mt-auto xl:pt-8">
                <a
                  href={active.site.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85"
                >
                  {active.site.label}
                  <Icon icon="lucide:arrow-up-right" className="size-4" aria-hidden="true" />
                </a>
                <a
                  href={active.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground/[0.04]"
                >
                  <Icon icon="mdi:github" className="size-4" aria-hidden="true" />
                  Le code
                </a>
              </div>
            </div>

            <div className="relative aspect-[14/9] overflow-hidden" aria-hidden="true">
              <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
                {cells.map((color, i) => (
                  <span key={i} className="mosaic-tile" style={{ background: color, animationDelay: `${(i % COLS) * 18 + Math.floor(i / COLS) * 12}ms` }} />
                ))}
              </div>
              {/* Le personnage du produit, sur un panneau sombre comme un écran. */}
              <div className="absolute inset-[16%] flex items-center justify-center border-4 border-black/30 bg-[#0e0c0b]/85">
                <PixelSprite sprite={active.sprite} className="product-sprite h-[46%] w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
