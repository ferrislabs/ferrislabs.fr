import { Button } from '@explainer/ui/components/button'

export function WebsiteNavbar() {
  const links = [
    { label: 'Ferriskey', href: '#ferriskey' },
    { label: 'Mestier', href: '#mestier' },
    { label: 'Ce qu\'on fait', href: '#services' },
    { label: 'Équipe', href: '#team' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <a
          href="/"
          className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground"
        >
          <img src="/logo.svg" alt="" className="h-5 w-5" />
          FerrisLabs
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-5">
          <a
            href="https://github.com/ferrislabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            GitHub
          </a>
          <Button size="sm" className="cursor-pointer rounded-none h-8 px-3 text-[13px]">
            <a href="mailto:contact@ferrislabs.fr">Nous écrire</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
