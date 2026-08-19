'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Plateau de tuiles qui font l'aller-retour entre un état dispersé (A) et le
 * crabe FerrisLabs (B).
 *
 * Le motif n'est pas redessiné : il est repris de logo.svg, une grille 9×9 de
 * rectangles dont seules les lignes 1 à 7 portent des pixels — d'où un crabe
 * de 9 colonnes sur 7 lignes.
 *
 * La grille s'adapte au conteneur pour occuper toute la place disponible, en
 * gardant des cellules carrées : sinon le crabe se déformerait avec le format
 * de la boîte.
 */
const BG = '#120f0e'

/** Les trois tons du logo, puis la rampe rust pour l'état dispersé. */
const COLORS = ['#1c1917', '#a83e08', '#f2670f', '#7a2d06', '#ff8c42', '#ffb07c']

/** [colonne, ligne, index de couleur] — extrait de logo.svg, lignes remontées de 1. */
const CRAB: Array<[number, number, number]> = [
  [2, 0, 1], [6, 0, 1],
  [1, 1, 1], [2, 1, 1], [6, 1, 1], [7, 1, 1],
  [1, 2, 1], [3, 2, 0], [5, 2, 0], [7, 2, 1],
  [1, 3, 1], [2, 3, 2], [3, 3, 2], [4, 3, 2], [5, 3, 2], [6, 3, 2], [7, 3, 1],
  [0, 4, 2], [1, 4, 2], [2, 4, 2], [3, 4, 2], [4, 4, 2], [5, 4, 2], [6, 4, 2], [7, 4, 2], [8, 4, 2],
  [1, 5, 2], [2, 5, 2], [3, 5, 2], [4, 5, 2], [5, 5, 2], [6, 5, 2], [7, 5, 2],
  [0, 6, 1], [2, 6, 2], [3, 6, 2], [4, 6, 2], [5, 6, 2], [6, 6, 2], [8, 6, 1],
]
const CRAB_W = 9
const CRAB_H = 7
const N = CRAB.length

const STEP_MS = 260 // intervalle entre deux pas, soit une case
/**
 * Durée du déplacement, un peu plus courte que l'intervalle : la tuile se pose
 * sur sa case et marque un très bref arrêt avant le pas suivant. Sans cette
 * marge, l'accélération du pas suivant s'enchaîne sur la décélération du
 * précédent et l'effet s'annule.
 */
const MOVE_MS = 215
/**
 * ease-in-out très marqué : départ et arrivée nettement ralentis, passage
 * rapide au milieu. Plus la courbe est creusée, plus chaque case se lit
 * comme un pas distinct.
 */
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'
const PAUSE_TICKS = 10 // temps de maintien à chaque extrémité
/**
 * Nombre de lignes visé. Le crabe en occupe 7 : à 10 lignes il remplit donc
 * ~70 % de la hauteur quelle que soit la taille du plateau. Une taille de
 * cellule fixe ferait l'inverse — plus le plateau est haut, plus il y a de
 * lignes, et plus le crabe paraît petit.
 */
const ROWS_TARGET = 10

type Cell = [number, number]

interface Tile {
  id: number
  a: Cell // position dans l'état dispersé
  b: Cell // position dans le crabe
  colorA: number
  colorB: number
}

/**
 * Dispersion déterministe sur toute la grille : le même conteneur produit
 * toujours le même état A, donc l'aller-retour A→B→A est exactement réversible.
 */
function scatterA(cols: number, rows: number): Cell[] {
  const all: Cell[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) all.push([c, r])
  all.sort(
    (p, q) => ((p[0] * 37 + p[1] * 91) % 251) - ((q[0] * 37 + q[1] * 91) % 251),
  )
  return all.slice(0, N)
}

/** Appariement au plus proche, calculé une seule fois : chaque tuile garde son trajet. */
function pairNearest(from: Cell[], to: Cell[]): number[] {
  const taken = new Array(to.length).fill(false)
  const res: number[] = new Array(from.length)
  for (let i = 0; i < from.length; i++) {
    let best = -1
    let bestD = Infinity
    for (let j = 0; j < to.length; j++) {
      if (taken[j]) continue
      const d = Math.abs(to[j][0] - from[i][0]) + Math.abs(to[j][1] - from[i][1])
      if (d < bestD) {
        bestD = d
        best = j
      }
    }
    taken[best] = true
    res[i] = best
  }
  return res
}

/**
 * Planifie un chemin case par case pour chaque tuile, de A vers B.
 *
 * Première tentative : chaque tuile décidait de son pas au dernier moment en
 * regardant les cases libres. Avec 40 tuiles et une forme aussi dense que le
 * crabe, elles se bloquaient mutuellement et le motif plafonnait à 68 %.
 *
 * Ici les tuiles sont routées une par une, en amont, par un parcours en
 * largeur dans l'espace (case, instant). Chaque tuile réserve les couples
 * qu'elle occupe ; les suivantes les évitent. Deux tuiles ne peuvent donc
 * jamais se retrouver sur la même case au même instant, ni échanger leurs
 * places. Le chemin retour est ce même chemin lu à l'envers.
 */
function planPaths(a: Cell[], b: Cell[], cols: number, rows: number): Cell[][] {
  const n = a.length
  const HORIZON = cols + rows + n + 8
  const occupe = new Set<string>() // "c,r,t"
  const arete = new Set<string>() // "c1,r1>c2,r2,t" pour interdire les échanges
  // Dernier instant où chaque case est occupée par une tuile déjà routée.
  // Une tuile qui se gare y reste jusqu'à la fin : elle ne peut donc pas
  // s'arrêter sur une case qu'une autre traverse plus tard.
  const dernier = new Map<string, number>()
  const paths: Cell[][] = new Array(n)

  // Les plus longs trajets d'abord : ils ont le plus de contraintes à satisfaire.
  const ordre = a
    .map((_, i) => i)
    .sort(
      (i, j) =>
        Math.abs(b[j][0] - a[j][0]) + Math.abs(b[j][1] - a[j][1]) -
        (Math.abs(b[i][0] - a[i][0]) + Math.abs(b[i][1] - a[i][1])),
    )

  // Décalage de départ : les tuiles ne s'élancent pas toutes en même temps.
  const depart: number[] = new Array(n)
  ordre.forEach((idx, rang) => (depart[idx] = rang % 6))

  // Toutes les tuiles patientent sur leur case de départ jusqu'à leur tour.
  // Sans réserver ces attentes, une tuile routée tôt traverse la case d'une
  // tuile encore immobile — c'est exactement ce qui produisait des collisions.
  for (let i = 0; i < n; i++) {
    const cle = `${a[i][0]},${a[i][1]}`
    for (let t = 0; t <= depart[i]; t++) occupe.add(`${cle},${t}`)
    dernier.set(cle, Math.max(dernier.get(cle) ?? -1, depart[i]))
  }

  for (const i of ordre) {
    const [sc, sr] = a[i]
    const [gc, gr] = b[i]
    const t0 = depart[i]

    // On libère sa propre attente, sinon elle se bloquerait elle-même.
    for (let t = 0; t <= t0; t++) occupe.delete(`${sc},${sr},${t}`)

    // Immobile jusqu'à son départ.
    const prefixe: Cell[] = []
    for (let t = 0; t <= t0; t++) prefixe.push([sc, sr])

    const vu = new Set<string>()
    const file: Array<{ c: number; r: number; t: number; prev: number }> = [
      { c: sc, r: sr, t: t0, prev: -1 },
    ]
    const noeuds = [...file]
    vu.add(`${sc},${sr},${t0}`)
    let fin = -1

    for (let k = 0; k < noeuds.length && fin < 0; k++) {
      const cur = noeuds[k]
      if (cur.c === gc && cur.r === gr && cur.t > (dernier.get(`${gc},${gr}`) ?? -1)) {
        fin = k
        break
      }
      if (cur.t >= HORIZON) continue
      const nt = cur.t + 1
      // attendre sur place, puis les quatre directions
      const moves: Cell[] = [
        [cur.c, cur.r],
        [cur.c + 1, cur.r],
        [cur.c - 1, cur.r],
        [cur.c, cur.r + 1],
        [cur.c, cur.r - 1],
      ]
      // priorise le rapprochement, pour des trajets lisibles
      moves.sort(
        (m, p) =>
          Math.abs(gc - m[0]) + Math.abs(gr - m[1]) - (Math.abs(gc - p[0]) + Math.abs(gr - p[1])),
      )
      for (const [nc, nr] of moves) {
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue
        const cle = `${nc},${nr},${nt}`
        if (vu.has(cle)) continue
        if (occupe.has(cle)) continue
        // interdit l'échange de places entre deux tuiles
        if (arete.has(`${nc},${nr}>${cur.c},${cur.r},${nt}`)) continue
        vu.add(cle)
        noeuds.push({ c: nc, r: nr, t: nt, prev: k })
      }
    }

    // Reconstruit le chemin ; en cas d'échec (jamais observé), trajet direct.
    let chemin: Cell[]
    if (fin >= 0) {
      const arriere: Cell[] = []
      let k = fin
      while (k !== -1) {
        arriere.push([noeuds[k].c, noeuds[k].r])
        k = noeuds[k].prev
      }
      arriere.reverse()
      chemin = [...prefixe.slice(0, -1), ...arriere]
    } else {
      chemin = [...prefixe, [gc, gr]]
    }

    // Réserve les cases traversées, puis la case d'arrivée jusqu'à la fin.
    for (let t = 0; t < chemin.length; t++) {
      const cle = `${chemin[t][0]},${chemin[t][1]}`
      occupe.add(`${cle},${t}`)
      dernier.set(cle, Math.max(dernier.get(cle) ?? -1, t))
      if (t > 0) {
        const [pc, pr] = chemin[t - 1]
        arete.add(`${pc},${pr}>${chemin[t][0]},${chemin[t][1]},${t}`)
      }
    }
    const [fc, fr] = chemin[chemin.length - 1]
    for (let t = chemin.length; t <= HORIZON; t++) occupe.add(`${fc},${fr},${t}`)
    dernier.set(`${fc},${fr}`, HORIZON)
    paths[i] = chemin
  }
  return paths
}

export function HeroGrid() {
  const boxRef = useRef<HTMLDivElement>(null)
  const [grid, setGrid] = useState({ cols: 0, rows: 0 })
  const [plan, setPlan] = useState<{ paths: Cell[][]; colors: number[][]; duree: number } | null>(null)
  const [tick, setTick] = useState(0)

  // Dimensionne la grille d'après le conteneur, cellules carrées.
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const mesurer = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width < 40 || height < 40) return
      const rows = ROWS_TARGET
      const cell = height / rows
      const cols = Math.max(CRAB_W + 2, Math.round(width / cell))
      setGrid((g) => (g.cols === cols && g.rows === rows ? g : { cols, rows }))
    }
    mesurer()
    const ro = new ResizeObserver(mesurer)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // (Re)planifie les trajets quand la grille change.
  useEffect(() => {
    const { cols, rows } = grid
    if (!cols || !rows) return
    const dx = Math.floor((cols - CRAB_W) / 2)
    const dy = Math.floor((rows - CRAB_H) / 2)
    const b: Cell[] = CRAB.map(([c, r]) => [c + dx, r + dy])
    const a = scatterA(cols, rows)
    const paire = pairNearest(a, b)
    const cible = paire.map((j) => b[j])
    const paths = planPaths(a, cible, cols, rows)
    const duree = Math.max(...paths.map((p) => p.length))
    const colors = paire.map((j, i) => [2 + ((i * 7) % 4), CRAB[j][2]])
    setPlan({ paths, colors, duree })
    setTick(0)
  }, [grid])

  // Horloge : un pas = une case. Aller, pause, retour, pause.
  useEffect(() => {
    if (!plan) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTick(plan.duree - 1)
      return
    }
    const cycle = (plan.duree + PAUSE_TICKS) * 2
    const id = setInterval(() => setTick((t) => (t + 1) % cycle), STEP_MS)
    return () => clearInterval(id)
  }, [plan])

  const { cols, rows } = grid

  /** Avancement commun : croissant à l'aller, décroissant au retour. */
  function avancement(): number {
    if (!plan) return 0
    const phase = plan.duree + PAUSE_TICKS
    const local = tick < phase ? tick : tick - phase
    return tick < phase ? local : plan.duree - 1 - local
  }

  const pas = avancement()
  const versCrabe = plan ? pas / Math.max(1, plan.duree - 1) : 1

  return (
    <div
      ref={boxRef}
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* repères d'angle, comme des traits de coupe */}
      <span className="absolute -left-px -top-px z-20 size-2 bg-foreground" aria-hidden="true" />
      <span className="absolute -right-px -top-px z-20 size-2 bg-foreground" aria-hidden="true" />
      <span className="absolute -bottom-px -left-px z-20 size-2 bg-foreground" aria-hidden="true" />
      <span className="absolute -bottom-px -right-px z-20 size-2 bg-foreground" aria-hidden="true" />

      <span className="absolute bottom-2 left-3 z-20 font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
        Open source depuis 2025
      </span>

      {cols > 0 &&
        plan &&
        plan.paths.map((path, i) => {
          const k = Math.min(path.length - 1, Math.max(0, pas))
          const [c, r] = path[k]
          const couleur = plan.colors[i][versCrabe > 0.65 ? 1 : 0]
          return (
            <div
              key={i}
              className="absolute left-0 top-0"
              style={{
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
                transform: `translate(${c * 100}%, ${r * 100}%)`,
                backgroundColor: COLORS[couleur],
                transition: `transform ${MOVE_MS}ms ${EASE}, background-color 0.5s ease`,
              }}
            />
          )
        })}
    </div>
  )
}
