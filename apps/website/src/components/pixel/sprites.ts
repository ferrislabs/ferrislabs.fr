/**
 * Les sprites du site, dessinés à la main sur une grille. Une ligne par rangée
 * de pixels, un caractère par pixel, « . » pour transparent. La palette dit
 * quelle couleur prend chaque caractère.
 *
 * Le crabe reprend exactement public/logo.svg (9 × 9) : c'est l'unité de base
 * de toute la direction artistique.
 */
export interface Sprite {
  rows: string[]
  palette: Record<string, string>
}

const RUST = { D: '#a83e08', O: '#f2670f', E: '#1c1917' }

export const crab: Sprite = {
  rows: [
    '.........',
    '..D...D..',
    '.DD...DD.',
    '.D.E.E.D.',
    '.DOOOOOD.',
    'OOOOOOOOO',
    '.OOOOOOO.',
    'D.OOOOO.D',
    '.........',
  ],
  palette: RUST,
}

/** Le crabe qui dort, pour le pied de page : yeux fermés, pinces baissées. */
export const crabAsleep: Sprite = {
  rows: [
    '.........',
    '.........',
    '.DD...DD.',
    '.D.....D.',
    '.DOEOEOD.',
    'OOOOOOOOO',
    '.OOOOOOO.',
    'D.OOOOO.D',
    '.........',
  ],
  palette: RUST,
}

/** Ferriskey : une clé dorée. */
export const key: Sprite = {
  rows: [
    '.GGG.......',
    'GYYYG......',
    'GY.YGGGGGGG',
    'GYYYGYYYYYG',
    '.GGG...G.GG',
    '.......G.G.',
  ],
  palette: { G: '#b7791f', Y: '#f3b544' },
}

/** Mestier : une caisse à outils, la suite qui fait tourner l'entreprise. */
export const toolbox: Sprite = {
  rows: [
    '...TTTT...',
    '...T..T...',
    'TTTTTTTTTT',
    'TLLLLLLLLT',
    'TTTTYYTTTT',
    'TLLLLLLLLT',
    'TLLLLLLLLT',
    'TTTTTTTTTT',
  ],
  palette: { T: '#0f766e', L: '#2dd4bf', Y: '#f3b544' },
}

/** FerrisTrace : le crabe-comète, en indigo, avec sa traînée de spans. */
export const cometCrab: Sprite = {
  rows: [
    '.............',
    '......D...D..',
    '.....DD...DD.',
    '.....D.E.E.D.',
    'AAA..DOOOOOD.',
    '.BBBOOOOOOOOO',
    'CCC..OOOOOOO.',
    '.....D.OOO.D.',
  ],
  palette: { D: '#3730a3', O: '#6366f1', E: '#0c0c0e', A: '#a5b4fc', B: '#2fb394', C: '#e8893c' },
}

/** Le chantier du pied de page : un cône de signalisation… */
export const cone: Sprite = {
  rows: ['...W...', '..OOO..', '..WWW..', '.OOOOO.', '.WWWWW.', 'OOOOOOO', 'DDDDDDD'],
  palette: { W: '#f5f5f4', O: '#f2670f', D: '#57534e' },
}

/** … et une barrière de chantier. */
export const barrier: Sprite = {
  rows: ['OOWWOOWWOOWWO', 'OOWWOOWWOOWWO', '.D.........D.', '.D.........D.', '.D.........D.', 'DDD.......DDD'],
  palette: { W: '#f5f5f4', O: '#f2670f', D: '#57534e' },
}
