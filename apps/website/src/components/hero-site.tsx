import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { PixelSprite } from './pixel/pixel-sprite'
import { cometCrab, crab, key, toolbox } from './pixel/sprites'

/**
 * Le chantier du hero. Deux grues pixel posent, un par un, les blocs et les
 * personnages des produits : le chariot glisse sur la flèche, le câble
 * descend avec sa charge, un peu de poussière à l'atterrissage, et le câble
 * remonte. Des immeubles lointains et les grues elles-mêmes, plus pâles,
 * donnent la profondeur ; la charge, au premier plan, est en couleur pleine.
 *
 * Toutes les cotes sont en unités de grille (--u, fixée en CSS sur la scène).
 * x part du bord de la scène côté grue : à gauche pour la grue de gauche, à
 * droite pour celle de droite.
 */
type Load = {
  id: string
  x: number
  bottom: number
  w: number
  h: number
  color?: string
  diamond?: boolean
  sprite?: { node: ReactNode; href: string; label: string; external?: boolean }
}

const JIB = 4.0 // hauteur de la flèche
const MAST = 1.62 // position du mât
const HOOK_REST = 0.35 // longueur du câble au repos

const sides: Array<{ side: 'left' | 'right'; loads: Load[] }> = [
  {
    side: 'left',
    loads: [
      { id: 'l1', x: 0, bottom: 0, w: 1, h: 1, color: '#f2670f' },
      { id: 'l2', x: 1.12, bottom: 0.11, w: 0.53, h: 0.53, color: '#d9480f', diamond: true },
      { id: 'l3', x: 0, bottom: 1, w: 1, h: 1, color: '#ffb547' },
      { id: 'l4', x: 1.9, bottom: 0, w: 0.5, h: 0.5, color: '#ffb547' },
      {
        id: 'l5',
        x: 2.6,
        bottom: 0,
        w: 0.62,
        h: 0.5,
        sprite: { node: <PixelSprite sprite={toolbox} className="block w-full" />, href: '#mestier', label: 'Mestier' },
      },
      {
        id: 'l6',
        x: 0.12,
        bottom: 2,
        w: 0.76,
        h: 0.76,
        sprite: {
          node: <PixelSprite sprite={crab} className="block w-full" />,
          href: 'https://github.com/ferrislabs',
          label: 'FerrisLabs',
          external: true,
        },
      },
    ],
  },
  {
    side: 'right',
    loads: [
      { id: 'r1', x: 0, bottom: 0, w: 1, h: 1, color: '#f2670f' },
      { id: 'r2', x: 2, bottom: 0, w: 1, h: 1, color: '#c2410c' },
      { id: 'r3', x: 1.24, bottom: 0.11, w: 0.53, h: 0.53, color: '#d9480f', diamond: true },
      { id: 'r4', x: 0, bottom: 1, w: 1, h: 1, color: '#ffb547' },
      {
        id: 'r5',
        x: 2.12,
        bottom: 1.02,
        w: 0.76,
        h: 0.42,
        sprite: { node: <PixelSprite sprite={key} className="block w-full" />, href: '#ferriskey', label: 'Ferriskey' },
      },
      {
        id: 'r6',
        x: 0,
        bottom: 2.1,
        w: 1.05,
        h: 0.65,
        sprite: { node: <PixelSprite sprite={cometCrab} className="block w-full" />, href: '#ferristrace', label: 'FerrisTrace' },
      },
    ],
  },
]

/** Immeubles lointains : largeur, hauteur, position, en unités. */
const skyline = [
  [0.6, 1.6, 3.4],
  [0.9, 2.4, 4.1],
  [0.5, 1.2, 5.1],
  [0.8, 2.9, 5.7],
  [0.6, 1.8, 6.6],
  [1, 2.2, 7.4],
]

const u = (n: number) => `calc(var(--u) * ${n})`

function horizontal(side: 'left' | 'right', x: number): CSSProperties {
  return side === 'left' ? { left: u(x) } : { right: u(x) }
}

export function HeroSite() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const probe = scene.querySelector<HTMLElement>('[data-probe]')
    const unit = probe?.offsetWidth ?? 80
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const running: Animation[] = []
    let cancelled = false

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
    const play = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = el.animate(frames, { fill: 'forwards', ...options })
      running.push(animation)
      return animation.finished.catch(() => undefined)
    }

    async function build(side: 'left' | 'right', loads: Load[], startDelay: number) {
      const trolley = scene!.querySelector<HTMLElement>(`[data-trolley="${side}"]`)
      const cable = scene!.querySelector<HTMLElement>(`[data-cable="${side}"]`)
      if (!trolley || !cable) return
      const sign = side === 'left' ? 1 : -1
      // Le chariot part du mât ; ses déplacements se font en translateX.
      let at = MAST
      await sleep(startDelay)

      for (const load of loads) {
        if (cancelled) return
        const el = scene!.querySelector<HTMLElement>(`[data-load="${load.id}"]`)
        const dust = scene!.querySelector<HTMLElement>(`[data-dust="${load.id}"]`)
        if (!el) continue
        const center = load.x + load.w / 2
        const travel = (center - at) * unit * sign

        // 1. Le chariot glisse jusqu'à l'aplomb de la charge.
        const from = (at - MAST) * unit * sign
        await play(trolley, [{ transform: `translateX(${from}px)` }, { transform: `translateX(${from + travel}px)` }], {
          duration: 260 + Math.abs(center - at) * 120,
          easing: 'cubic-bezier(0.45, 0, 0.3, 1)',
        })
        at = center

        // 2. Le câble descend avec la charge, qui apparaît accrochée en haut.
        // Du bas du chariot au haut de la charge, moins le crochet.
        const full = (JIB - 0.08 - load.bottom - load.h) * unit - 8
        const rest = HOOK_REST * unit
        const lift = full - rest
        const duration = 420 + lift * 0.9
        const easing = 'cubic-bezier(0.5, 0, 0.25, 1)'
        el.style.visibility = 'visible'
        await Promise.all([
          play(cable, [{ height: `${rest}px` }, { height: `${full}px` }], { duration, easing }),
          play(el, [{ transform: `translateY(${-lift}px)` }, { transform: 'translateY(0)' }], { duration, easing }),
        ])

        // 3. Atterrissage : léger tassement et un nuage de pixels.
        play(el, [{ transform: 'scale(1.06, 0.92)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-out' })
        if (dust) {
          dust.querySelectorAll('span').forEach((p, i) => {
            const dx = (i - 1.5) * 0.18 * unit
            play(p, [{ opacity: 1, transform: 'translate(0, 0)' }, { opacity: 0, transform: `translate(${dx}px, ${-0.22 * unit}px)` }], {
              duration: 420,
              easing: 'ease-out',
            })
          })
        }

        // 4. Le câble remonte, vide.
        await play(cable, [{ height: `${full}px` }, { height: `${rest}px` }], { duration: 260 + full * 0.35, easing })
      }

      // Une fois le chantier fini, le chariot va et vient lentement.
      if (cancelled) return
      const from = (at - MAST) * unit * sign
      const idle = trolley.animate(
        [{ transform: `translateX(${from}px)` }, { transform: `translateX(${from + 0.9 * unit * sign}px)` }],
        { duration: 5200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'forwards' },
      )
      running.push(idle)
    }

    if (reduce) {
      scene.querySelectorAll<HTMLElement>('[data-load]').forEach((el) => (el.style.visibility = 'visible'))
      return
    }
    build('left', sides[0].loads, 350)
    build('right', sides[1].loads, 650)

    return () => {
      cancelled = true
      running.forEach((animation) => animation.cancel())
    }
  }, [])

  return (
    <div ref={sceneRef} className="hero-site pointer-events-none absolute inset-x-0 bottom-0" style={{ height: u(JIB + 0.4) }}>
      <span data-probe className="absolute h-0" style={{ width: u(1) }} />

      {/* Fond : immeubles lointains, très pâles */}
      <div className="absolute inset-x-0 bottom-0 h-full" aria-hidden="true">
        {skyline.map(([w, h, x], i) => (
          <span key={`l${i}`} className="hero-far absolute bottom-0" style={{ left: u(x), width: u(w), height: u(h) }} />
        ))}
        {skyline.map(([w, h, x], i) => (
          <span key={`r${i}`} className="hero-far absolute bottom-0" style={{ right: u(x + 0.3), width: u(w), height: u(h * 0.85) }} />
        ))}
      </div>

      {/* Plan moyen : les grues */}
      {sides.map(({ side }) => (
        <div key={side} className="absolute inset-0" aria-hidden="true">
          <span className="hero-mast absolute bottom-0" style={{ ...horizontal(side, MAST - 0.11), width: u(0.22), height: u(JIB + 0.3) }} />
          <span
            className="hero-jib absolute"
            style={{ ...horizontal(side, -0.35), bottom: u(JIB), width: u(3.75), height: u(0.16) }}
          />
          <span className="hero-cabin absolute" style={{ ...horizontal(side, MAST - 0.2), bottom: u(JIB - 0.32), width: u(0.4), height: u(0.3) }} />
          <span
            data-trolley={side}
            className="absolute"
            style={{ ...horizontal(side, MAST - 0.12), bottom: u(JIB - 0.08), width: u(0.24) }}
          >
            <span className="hero-trolley block" style={{ height: u(0.1) }} />
            <span data-cable={side} className="hero-cable absolute left-1/2 top-full block" style={{ height: u(HOOK_REST) }}>
              <span className="hero-hook absolute -left-[3px] top-full block size-[8px]" />
            </span>
          </span>
        </div>
      ))}

      {/* Premier plan : les charges, à leur place finale */}
      {sides.map(({ side, loads }) =>
        loads.map((load) => {
          const style: CSSProperties = { ...horizontal(side, load.x), bottom: u(load.bottom), width: u(load.w) }
          return (
            <div key={load.id}>
              {load.sprite ? (
                <a
                  data-load={load.id}
                  href={load.sprite.href}
                  aria-label={load.sprite.label}
                  data-label={load.sprite.label}
                  className="hero-sprite pointer-events-auto absolute origin-bottom"
                  style={{ ...style, visibility: 'hidden' }}
                  {...(load.sprite.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {load.sprite.node}
                </a>
              ) : (
                <span
                  data-load={load.id}
                  className="absolute origin-bottom"
                  style={{ ...style, height: u(load.h), visibility: 'hidden' }}
                >
                  {/* La rotation du losange est sur l'enfant : le parent est animé en transform. */}
                  <span className={['block h-full w-full', load.diamond ? 'rotate-45' : ''].join(' ')} style={{ background: load.color }} />
                </span>
              )}
              <span data-dust={load.id} className="absolute" style={{ ...horizontal(side, load.x), bottom: u(load.bottom), width: u(load.w) }} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="hero-dust absolute bottom-0 size-[5px] opacity-0" style={{ left: `${20 + i * 20}%` }} />
                ))}
              </span>
            </div>
          )
        }),
      )}
    </div>
  )
}
