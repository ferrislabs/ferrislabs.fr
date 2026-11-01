import { useState } from 'react'
import { Icon } from '@iconify/react'

/**
 * Le manifeste, versionné comme du code : chaque engagement est un commit de
 * manifeste.md. Ouvrir un commit montre son diff, ce qu'on retire du métier
 * (en rouge) et ce qu'on y met à la place (en vert).
 */
interface Commit {
  hash: string
  message: string
  removed: string
  added: string
}

const commits: Commit[] = [
  {
    hash: 'a3f9c21',
    message: 'Le code est public, du premier commit à la production',
    removed: 'Faites-nous confiance, le code est propriétaire.',
    added: 'Lisez le code avant de signer : tout est sur GitHub, erreurs comprises.',
  },
  {
    hash: '7b2e0d4',
    message: 'Apache 2.0 pour tous nos produits',
    removed: 'Une licence à renouveler chaque année, sinon tout s’arrête.',
    added: 'Le droit d’utiliser, de modifier et de forker, pour toujours.',
  },
  {
    hash: 'c81d5ef',
    message: 'Vos données restent chez vous',
    removed: 'Vos données vivent dans notre cloud, sous nos conditions.',
    added: 'Auto-hébergeable sur vos serveurs. Notre cloud reste une option.',
  },
  {
    hash: '5d0c3a8',
    message: 'Pas d’enfermement',
    removed: 'Partir veut dire tout racheter et tout réécrire.',
    added: 'Des standards ouverts : OpenID Connect, OpenTelemetry, PostgreSQL.',
  },
  {
    hash: '19ab7e2',
    message: 'On utilise ce qu’on publie',
    removed: 'Vendre un produit qu’on n’utilise pas soi-même.',
    added: 'Ferriskey gère l’identité de nos propres produits. Ses bugs, on les subit en premier.',
  },
  {
    hash: 'e6f2b91',
    message: 'Écrit en Rust',
    removed: 'Des fuites mémoire et des pauses imprévisibles en production.',
    added: 'Une mémoire sûre à la compilation et une latence qui reste stable.',
  },
  {
    hash: '0a4d7cc',
    message: 'On reste après la livraison',
    removed: 'Livré, facturé, oublié.',
    added: 'Un changelog public et des issues suivies, release après release.',
  },
]

export function ManifestoSection() {
  const [openHash, setOpenHash] = useState(commits[0].hash)

  return (
    <section id="manifeste" aria-labelledby="manifeste-title" className="scroll-mt-12 border-b border-border">
      <div className="mx-auto grid max-w-6xl border-x border-border lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="border-b border-border px-5 py-20 sm:px-8 sm:py-24 lg:border-b-0 lg:border-r">
          <p className="font-pixel text-[11px] uppercase tracking-[0.08em] text-primary">Manifeste</p>
          <h2
            id="manifeste-title"
            className="mt-4 text-balance text-[clamp(2rem,3.4vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.035em]"
          >
            Nos engagements, versionnés comme du code.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-muted-foreground">
            Un manifeste qu'on ne peut pas relire n'engage personne. Le nôtre a un historique : chaque
            principe est un commit, avec ce qu'il retire et ce qu'il ajoute.
          </p>
          <p className="mt-8 flex items-center gap-2 font-pixel text-[11px] uppercase text-muted-foreground">
            <Icon icon="mdi:source-commit" className="size-4" aria-hidden="true" />
            {commits.length} commits · 0 retour en arrière
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <div className="border border-border bg-card font-mono text-[13px]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-muted-foreground">
              <span className="text-primary">$</span>
              git log --oneline manifeste.md
            </div>

            <ol>
              {commits.map((commit) => {
                const open = commit.hash === openHash
                return (
                  <li key={commit.hash} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenHash(open ? '' : commit.hash)}
                      className={[
                        'flex w-full cursor-pointer items-baseline gap-3 px-4 py-2.5 text-left transition-colors',
                        open ? 'bg-foreground/[0.04]' : 'hover:bg-foreground/[0.025]',
                      ].join(' ')}
                    >
                      <span className="shrink-0 text-primary">{commit.hash}</span>
                      <span className={open ? 'text-foreground' : 'text-foreground/80'}>{commit.message}</span>
                      <Icon
                        icon="lucide:chevron-down"
                        className={['ml-auto size-4 shrink-0 self-center text-muted-foreground transition-transform', open ? 'rotate-180' : ''].join(' ')}
                        aria-hidden="true"
                      />
                    </button>
                    {open ? (
                      <div className="manifesto-diff px-4 pb-3 pt-1 leading-6">
                        <p className="flex gap-3 bg-red-500/10 px-2 text-red-700 dark:text-red-300">
                          <span aria-hidden="true">-</span>
                          <span>
                            <span className="sr-only">Retiré : </span>
                            {commit.removed}
                          </span>
                        </p>
                        <p className="mt-1 flex gap-3 bg-emerald-500/10 px-2 text-emerald-700 dark:text-emerald-300">
                          <span aria-hidden="true">+</span>
                          <span>
                            <span className="sr-only">Ajouté : </span>
                            {commit.added}
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ol>

            <p className="border-t border-border px-4 py-2.5 text-muted-foreground">
              Signed-off-by: l'équipe FerrisLabs &lt;contact@ferrislabs.fr&gt;
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
