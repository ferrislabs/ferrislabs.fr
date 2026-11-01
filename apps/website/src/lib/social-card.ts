/**
 * La carte de partage de ferrislabs.fr : le logo, les personnages des produits
 * et les accessoires du chantier, en SVG, à partir des mêmes sprites que la page. Lu par astro.config.ts, donc
 * pas de React ici, seulement des chaînes.
 */
import { barrier, cometCrab, cone, crab, key, toolbox, type Sprite } from '../components/pixel/sprites'

function spriteRects(sprite: Sprite, x: number, y: number, width: number) {
  const cols = Math.max(...sprite.rows.map((r) => r.length))
  const size = width / cols
  return sprite.rows
    .flatMap((row, j) =>
      [...row].map((char, i) =>
        char === '.'
          ? ''
          : `<rect x="${(x + i * size).toFixed(2)}" y="${(y + j * size).toFixed(2)}" width="${(size + 0.3).toFixed(2)}" height="${(size + 0.3).toFixed(2)}" fill="${sprite.palette[char]}"/>`,
      ),
    )
    .join('')
}

/** Le crabe du logo, seul, en SVG autonome. */
export function markSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" shape-rendering="crispEdges">${spriteRects(crab, 0, 0, 90)}</svg>`
}

/** Un sprite seul, en SVG autonome à sa taille naturelle. */
export function spriteSvg(sprite: Sprite) {
  const cols = Math.max(...sprite.rows.map((r) => r.length))
  const rows = sprite.rows.length
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * 10} ${rows * 10}" shape-rendering="crispEdges">${spriteRects(sprite, 0, 0, cols * 10)}</svg>`
}

/** Ce que la carte de partage reçoit : logo, accessoires et produits en tour. */
export function pixelCard() {
  return {
    eyebrow: 'FERRISLABS · OPEN SOURCE · RUST',
    lines: ['Du logiciel', 'open source,', 'construit en public.'],
    site: 'ferrislabs.fr',
    mark: markSvg(),
    crab: spriteSvg(crab),
    cone: spriteSvg(cone),
    barrier: spriteSvg(barrier),
    products: [
      { name: 'Mestier', sprite: spriteSvg(toolbox), color: '#0f766e', light: '#2dd4bf' },
      { name: 'Ferriskey', sprite: spriteSvg(key), color: '#c2410c', light: '#ffb547' },
      { name: 'FerrisTrace', sprite: spriteSvg(cometCrab), color: '#4338ca', light: '#818cf8' },
    ],
  }
}
