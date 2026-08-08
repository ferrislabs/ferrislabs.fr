import { Button } from '@explainer/ui'

export function WebsiteNavbar() {
  const links = [
    { label: 'Ferriskey', href: '#ferriskey' },
    { label: 'Mestier', href: '#mestier' },
    { label: 'Ce qu\'on fait', href: '#services' },
    { label: 'Team', href: '#team' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <img src="/logo.svg" alt="FerrisLabs" className="h-6 w-6" />
          FerrisLabs
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ferrislabs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            GitHub
          </a>
          <Button size="sm" className="cursor-pointer rounded-[3px]">
            <a href="#ferriskey">Explore</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
