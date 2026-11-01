import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { PixelSprite } from './pixel/pixel-sprite'
import { barrier, cometCrab, cone, crab, crabAsleep, key, toolbox } from './pixel/sprites'

const WORD = 'FerrisLabs'
/** Unités du viewBox. Silkscreen dessine ses glyphes sur 8 pixels par em. */
const FONT_SIZE = 160
const P = FONT_SIZE / 8
const BASELINE = FONT_SIZE
/** Hauteur de la zone de tuiles : le mot et son ombre. */
const WORD_HEIGHT = FONT_SIZE + P
/** Le sol, sous l'ombre des lettres. */
const GROUND = BASELINE + P
/** Place laissée au-dessus du mot pour la grue. */
const TOP = P * 4.2
/** Marges autour du mot, où vit le décor du chantier. */
const LEFT = P * 6.5
const RIGHT = P * 9.5
/** Haut des capitales de Silkscreen, là où se pose le crabe. */
const CAP_TOP = BASELINE - FONT_SIZE * 0.625
/** Ombre portée qui donne du volume aux lettres. */
const DEPTH = P * 0.4
/** La grue : distance du mât au crochet. */
const REACH = P * 3
/** Durée du passage de la grue d'un bout à l'autre du mot. */
const SWEEP_MS = 2800
/** Le trajet de la grue vers sa place de parking, après la pose. */
const PARK_MS = 700

/**
 * Les teintes du logo, de l'ambre en haut à la rouille en bas : la même
 * lumière que les blocs du hero, plutôt qu'un confetti de couleurs.
 */
const ramp = ['#ffb547', '#ff8c42', '#f2670f', '#d9480f', '#a83e08']

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

/**
 * Le pied de page reprend le chantier du hero. Une grue sur rail roule le long
 * du mot FerrisLabs et pose ses tuiles colonne par colonne ; le contour pâle
 * sert de plan, une ombre décalée donne du volume. Autour : cônes, barrière,
 * tuiles de rechange et les personnages des produits. FerrisTrace survole le
 * chantier, c'est son métier. Une fois le mot bâti, le crabe dort sur le F.
 */
export function FooterWordmark() {
  const rootRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const [wordWidth, setWordWidth] = useState(WORD.length * P * 6)
  const [fCenter, setFCenter] = useState(P * 2)
  const [visible, setVisible] = useState(false)
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    const measure = () => {
      const text = textRef.current
      if (!text) return
      const box = text.getBBox()
      if (box.width > 0) setWordWidth(Math.ceil((box.x - LEFT + box.width + DEPTH) / P) * P)
      try {
        const f = text.getExtentOfChar(0)
        setFCenter(f.x - LEFT + f.width / 2)
      } catch {
        // Garde l'estimation.
      }
    }
    // La largeur dépend de Silkscreen : on demande la police explicitement,
    // `fonts.ready` peut se résoudre avant qu'elle soit même réclamée.
    measure()
    document.fonts?.load(`700 ${FONT_SIZE}px Silkscreen`).then(measure, measure)

    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.35 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const width = LEFT + wordWidth + RIGHT
  const top = -TOP
  const height = TOP + GROUND + P * 0.6

  // Une tuile par case ; la grue les pose colonne par colonne, le bas de
  // chaque colonne d'abord. La teinte suit la hauteur, avec un peu de grain.
  const tiles = useMemo(() => {
    const random = seeded(11)
    const out: Array<{ x: number; y: number; color: string; delay: number }> = []
    for (let x = 0; x < wordWidth; x += P) {
      for (let y = 0; y < WORD_HEIGHT; y += P) {
        const row = Math.round(((y - CAP_TOP) / (BASELINE - CAP_TOP)) * (ramp.length - 1))
        const grain = random() < 0.2 ? (random() < 0.5 ? -1 : 1) : 0
        const shade = ramp[Math.min(ramp.length - 1, Math.max(0, row + grain))]
        const delay = (x / wordWidth) * SWEEP_MS + (1 - y / WORD_HEIGHT) * 140 + random() * 60
        out.push({ x: LEFT + x, y, color: shade, delay: Math.round(delay) })
      }
    }
    return out
  }, [wordWidth])

  const craneStyle = {
    '--from': `${LEFT - REACH}px`,
    '--to': `${LEFT + wordWidth - REACH - P}px`,
    // Une fois le mot fini, la grue sort du mot et se gare dans la marge.
    '--park': `${LEFT + wordWidth + P * 1.6}px`,
    '--sweep': `${SWEEP_MS}ms`,
    '--total': `${SWEEP_MS + PARK_MS}ms`,
  } as CSSProperties
  const patrolStyle = { '--from': `${LEFT + wordWidth * 0.3}px`, '--to': `${LEFT + wordWidth * 0.72}px` } as CSSProperties
  const word = (props: { x: number; y: number }) => (
    <text x={props.x} y={props.y} fontFamily="Silkscreen" fontSize={FONT_SIZE} fontWeight={700}>
      {WORD}
    </text>
  )
  const prop = (href: string, label: string, child: ReactNode) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="wordmark-prop pointer-events-auto">
      <title>{label}</title>
      {child}
    </a>
  )

  return (
    <div ref={rootRef} className={['relative select-none', visible ? 'is-visible' : ''].join(' ')}>
      <svg viewBox={`0 ${top} ${width} ${height}`} className="block h-auto w-full" role="img" aria-label="FerrisLabs">
        <defs>
          <clipPath id="footer-wordmark-clip">{word({ x: LEFT, y: BASELINE })}</clipPath>
          <clipPath id="footer-wordmark-depth">{word({ x: LEFT + DEPTH, y: BASELINE + DEPTH })}</clipPath>
          <pattern id="footer-lattice" width={P * 0.5} height={P * 0.5} patternUnits="userSpaceOnUse">
            <path d={`M0 0 L${P * 0.5} ${P * 0.5} M${P * 0.5} 0 L0 ${P * 0.5}`} stroke="currentColor" strokeWidth={1.5} />
          </pattern>
        </defs>

        {/* Fond : immeubles lointains et rail de la grue */}
        <g className="text-foreground" aria-hidden="true">
          {[
            [0.6, 3.4, 2],
            [3, 4.6, 1.6],
            [LEFT / P + wordWidth / P * 0.42, 4.6, 1.8],
            [LEFT / P + wordWidth / P * 0.62, 3.2, 1.2],
            [LEFT / P + wordWidth / P + 3, 3.8, 1.6],
            [LEFT / P + wordWidth / P + 5.6, 2.6, 2],
          ].map(([x, h, w], i) => (
            <rect key={i} x={x * P} y={GROUND - h * P} width={w * P} height={h * P} fill="currentColor" opacity={0.045} />
          ))}
          <rect x={0} y={GROUND} width={width} height={2} fill="currentColor" opacity={0.25} />
          <rect x={0} y={GROUND + P * 0.3} width={width} height={2} fill="currentColor" opacity={0.12} />
        </g>

        {/* La grue sur rail : mât, flèche courte, contrepoids, cabine, câble */}
        <g className="wordmark-crane text-foreground" style={craneStyle} aria-hidden="true">
          <rect x={-P * 0.25} y={top + P * 0.6} width={P * 0.5} height={GROUND - top - P * 0.6} fill="url(#footer-lattice)" stroke="currentColor" strokeWidth={1.5} opacity={0.3} />
          <rect x={-P * 1.8} y={top + P * 0.6} width={P * 1.8 + REACH + P * 0.6} height={P * 0.42} fill="url(#footer-lattice)" stroke="currentColor" strokeWidth={1.5} opacity={0.3} />
          <rect x={-P * 1.8} y={top + P * 1.02} width={P * 0.9} height={P * 0.7} fill="currentColor" opacity={0.35} />
          <rect x={-P * 0.45} y={top + P * 1.02} width={P * 0.9} height={P * 0.6} fill="#f2670f" opacity={0.75} />
          <rect x={REACH - P * 0.35} y={top + P * 1.02} width={P * 0.7} height={P * 0.25} fill="currentColor" opacity={0.5} />
          <rect x={REACH - 1} y={top + P * 1.27} width={2} height={CAP_TOP - P * 1.6 - (top + P * 1.27)} fill="currentColor" opacity={0.45} />
          <rect x={REACH - P * 0.4} y={CAP_TOP - P * 1.6} width={P * 0.8} height={P * 0.8} fill="#ffb547" className="wordmark-payload" />
          <rect x={-P * 0.8} y={GROUND - P * 0.35} width={P * 1.6} height={P * 0.35} fill="currentColor" opacity={0.45} />
        </g>

        {/* Le plan : le contour pâle du mot avant qu'il soit bâti */}
        <text ref={textRef} x={LEFT} y={BASELINE} fontFamily="Silkscreen" fontSize={FONT_SIZE} fontWeight={700} fill="currentColor" opacity={0.07}>
          {WORD}
        </text>

        <g clipPath="url(#footer-wordmark-depth)" shapeRendering="crispEdges">
          {tiles.map((t) => (
            <rect key={`d${t.x}-${t.y}`} x={t.x} y={t.y} width={P} height={P} fill="#7a2d06" className="wordmark-tile" style={{ animationDelay: `${t.delay}ms` }} />
          ))}
        </g>
        <g clipPath="url(#footer-wordmark-clip)" shapeRendering="crispEdges">
          {tiles.map((t) => (
            <rect key={`${t.x}-${t.y}`} x={t.x} y={t.y} width={P} height={P} fill={t.color} className="wordmark-tile" style={{ animationDelay: `${t.delay}ms` }} />
          ))}
        </g>

        {/* Le décor : à gauche les tuiles de rechange et Mestier, à droite la barrière et Ferriskey */}
        <g shapeRendering="crispEdges" aria-hidden="true">
          <rect x={P * 0.3} y={GROUND - P * 1.4} width={P * 1.4} height={P * 1.4} fill={ramp[2]} />
          <rect x={P * 1.75} y={GROUND - P * 1.4} width={P * 1.4} height={P * 1.4} fill={ramp[3]} />
          <rect x={P * 1.0} y={GROUND - P * 2.8} width={P * 1.4} height={P * 1.4} fill={ramp[0]} />
          <PixelSprite sprite={cone} x={P * 3.4} y={GROUND - P * 1.8} width={P * 1.8} height={P * 1.8} />
        </g>
        {prop('https://mestier.fr', 'Mestier', <PixelSprite sprite={toolbox} x={LEFT - P * 1.4} y={GROUND - P * 1.4} width={P * 1.75} height={P * 1.4} />)}

        <g shapeRendering="crispEdges" aria-hidden="true">
          <PixelSprite sprite={barrier} x={LEFT + wordWidth + P * 3.2} y={GROUND - P * 2} width={P * 4.3} height={P * 2} />
          <PixelSprite sprite={cone} x={LEFT + wordWidth + P * 7.6} y={GROUND - P * 1.8} width={P * 1.8} height={P * 1.8} />
        </g>
        {prop('https://ferriskey.rs', 'Ferriskey', <PixelSprite sprite={key} x={LEFT + wordWidth + P * 4.1} y={GROUND - P * 3.2} width={P * 2.4} height={P * 1.3} />)}

        {/* FerrisTrace patrouille au-dessus du chantier */}
        <g className="wordmark-patrol" style={patrolStyle}>
          {prop('https://ferristrace.dev', 'FerrisTrace', <PixelSprite sprite={cometCrab} x={0} y={top + P * 1.6} width={P * 3.2} height={P * 2} />)}
        </g>
      </svg>

      <a
        href="#produits"
        onPointerEnter={() => setAwake(true)}
        onPointerLeave={() => setAwake(false)}
        onFocus={() => setAwake(true)}
        onBlur={() => setAwake(false)}
        aria-label="Réveiller le crabe et revoir nos produits"
        className="wordmark-crab absolute w-[clamp(30px,6.5%,88px)] -translate-x-1/2"
        style={{
          left: `${((LEFT + fCenter) / width) * 100}%`,
          bottom: `${((GROUND + P * 0.6 - CAP_TOP) / height) * 100}%`,
          animationDelay: `${SWEEP_MS + 300}ms`,
        }}
      >
        <span
          className={[
            'absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 border border-border bg-popover px-2.5 py-1 font-pixel text-[11px] uppercase text-foreground transition-all duration-200',
            awake ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0',
          ].join(' ')}
        >
          Trois produits à voir ↑
        </span>
        {awake ? null : (
          <span className="absolute -top-4 right-0 font-pixel text-primary" aria-hidden="true">
            <span className="wordmark-zzz absolute text-[10px]">z</span>
            <span className="wordmark-zzz absolute left-2 text-[12px] [animation-delay:0.9s]">z</span>
            <span className="wordmark-zzz absolute left-4 text-[14px] [animation-delay:1.8s]">Z</span>
          </span>
        )}
        <PixelSprite sprite={awake ? crab : crabAsleep} className={['block w-full', awake ? '' : 'wordmark-breathe'].join(' ')} />
      </a>
    </div>
  )
}
