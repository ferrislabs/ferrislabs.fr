import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { PixelSprite } from './pixel/pixel-sprite'
import { crab } from './pixel/sprites'

const links = [
  { label: 'Produits', href: '#produits' },
  { label: 'Manifeste', href: '#manifeste' },
  { label: 'Missions', href: '#missions' },
  { label: 'Équipe', href: '#equipe' },
]

type Appearance = 'light' | 'dark'

/** Bascule ce qui est affiché : un clic change toujours l'écran. */
function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>('light')

  useEffect(() => {
    const read = () => setAppearance(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    const next: Appearance = appearance === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return { appearance, toggle }
}

export function WebsiteNavbar() {
  const { appearance, toggle } = useAppearance()
  const [open, setOpen] = useState(false)
  const next = appearance === 'dark' ? 'clair' : 'sombre'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-stretch border-x border-border">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 border-r border-border px-4 text-[15px] font-semibold tracking-tight text-foreground"
        >
          <PixelSprite sprite={crab} className="size-5" />
          FerrisLabs
        </a>

        <nav aria-label="Principale" className="hidden md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center border-r border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-stretch">
          <a
            href="https://github.com/ferrislabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 border-l border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Icon icon="mdi:github" className="size-4" aria-hidden="true" />
            GitHub
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label={`Passer en thème ${next}`}
            title={`Passer en thème ${next}`}
            className="flex w-12 cursor-pointer items-center justify-center border-l border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon icon={appearance === 'dark' ? 'lucide:moon' : 'lucide:sun'} className="size-4" aria-hidden="true" />
          </button>
          <a
            href="mailto:contact@ferrislabs.fr"
            className="hidden items-center bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:flex"
          >
            Nous écrire
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex w-12 cursor-pointer items-center justify-center border-l border-border text-foreground md:hidden"
          >
            <Icon icon={open ? 'lucide:x' : 'lucide:menu'} className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" aria-label="Principale" className="border-t border-border bg-background md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border px-5 py-3 text-sm font-medium text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="flex">
            <a href="https://github.com/ferrislabs" className="flex-1 border-r border-border px-5 py-3 text-sm font-medium">
              GitHub
            </a>
            <a href="mailto:contact@ferrislabs.fr" className="flex-1 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Nous écrire
            </a>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
