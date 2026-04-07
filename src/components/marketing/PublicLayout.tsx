import { Link, Outlet } from 'react-router-dom';
import { MarketingRoleProvider } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { brand } from '@/config/brand';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function LogoCandle({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="24" viewBox="0 0 14 24" fill="none" className={className} aria-hidden>
      <path d="M7 1c0.8 1.6 1.6 3.2 1.6 4.8-0.3 1-1 1.6-1.6 1.6s-1.3-0.6-1.6-1.6C5.4 4.2 6.2 2.6 7 1z" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <ellipse cx="7" cy="7" rx="0.7" ry="1.1" fill="currentColor" opacity="0.3" />
      <line x1="7" y1="7.5" x2="7" y2="10" stroke="currentColor" strokeWidth="0.6" />
      <rect x="4.5" y="10" width="5" height="12" rx="0.5" stroke="currentColor" strokeWidth="0.6" fill="none" />
      <line x1="4.5" y1="14" x2="9.5" y2="14" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
      <line x1="4.5" y1="18" x2="9.5" y2="18" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
      <path d="M3.5 22h7" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MarketingRoleProvider>
    <div className="min-h-screen flex flex-col marketing-theme bg-[hsl(var(--marketing-surface))]">
      {/* Sticky Nav — warm, editorial */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--marketing-border)/0.5)] bg-[hsl(var(--marketing-surface)/0.92)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoCandle className="text-[hsl(var(--marketing-gold))]" />
            <span className="font-serif text-xl tracking-tight text-[hsl(var(--marketing-deep))]">
              Vigilia
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="/#the-ritual"
              className="font-serif-body text-[hsl(var(--marketing-muted))] hover:text-[hsl(var(--marketing-deep))] transition-colors"
            >
              The Ritual
            </a>
            <Link
              to="/security"
              className="font-serif-body text-[hsl(var(--marketing-muted))] hover:text-[hsl(var(--marketing-deep))] transition-colors"
            >
              Security
            </Link>
            <Link
              to="/contact"
              className="font-serif-body text-[hsl(var(--marketing-muted))] hover:text-[hsl(var(--marketing-deep))] transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none text-[hsl(var(--marketing-muted))] hover:text-[hsl(var(--marketing-deep))] font-serif-body"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="sm"
                className="rounded-none border-2 border-[hsl(var(--marketing-deep))] bg-[hsl(var(--marketing-deep))] text-[hsl(var(--marketing-cream))] hover:bg-transparent hover:text-[hsl(var(--marketing-deep))] px-6 text-xs font-sans tracking-[0.15em] uppercase transition-colors duration-300"
              >
                Start Pilot
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen
              ? <X className="h-5 w-5 text-[hsl(var(--marketing-deep))]" />
              : <Menu className="h-5 w-5 text-[hsl(var(--marketing-deep))]" />
            }
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[hsl(var(--marketing-border)/0.5)] bg-[hsl(var(--marketing-surface))] px-6 py-5 space-y-3">
            <a href="/#the-ritual" className="block font-serif-body text-sm text-[hsl(var(--marketing-muted))] py-2" onClick={() => setMobileOpen(false)}>
              The Ritual
            </a>
            <Link to="/security" className="block font-serif-body text-sm text-[hsl(var(--marketing-muted))] py-2" onClick={() => setMobileOpen(false)}>
              Security
            </Link>
            <Link to="/contact" className="block font-serif-body text-sm text-[hsl(var(--marketing-muted))] py-2" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <div className="flex gap-3 pt-3 border-t border-[hsl(var(--marketing-border)/0.5)]">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-none border-[hsl(var(--marketing-border))] text-[hsl(var(--marketing-deep))]">Sign in</Button>
              </Link>
              <Link to="/contact" className="flex-1">
                <Button size="sm" className="w-full rounded-none bg-[hsl(var(--marketing-deep))] text-[hsl(var(--marketing-cream))] text-xs tracking-[0.1em] uppercase">
                  Start Pilot
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>

      {/* Footer — deep brown, book-end feel */}
      <footer className="bg-[hsl(var(--marketing-deep))] border-t border-[hsl(var(--marketing-brown))]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <LogoCandle className="text-[hsl(var(--marketing-gold))]" />
                <span className="font-serif text-xl text-[hsl(var(--marketing-cream))] tracking-tight">
                  Vigilia
                </span>
              </div>
              <p className="font-serif-body italic text-sm text-[hsl(var(--marketing-tan))] mt-2">
                A Liturgy of Attention
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <Link to="/contact" className="font-serif-body text-[hsl(var(--marketing-tan))] hover:text-[hsl(var(--marketing-cream))] transition-colors">Contact</Link>
              <Link to="/security" className="font-serif-body text-[hsl(var(--marketing-tan))] hover:text-[hsl(var(--marketing-cream))] transition-colors">Security</Link>
              <Link to="/legal/privacy" className="font-serif-body text-[hsl(var(--marketing-tan))] hover:text-[hsl(var(--marketing-cream))] transition-colors">Privacy</Link>
              <Link to="/legal/terms" className="font-serif-body text-[hsl(var(--marketing-tan))] hover:text-[hsl(var(--marketing-cream))] transition-colors">Terms</Link>
            </nav>
          </div>
          <div className="mt-10 pt-8 border-t border-[hsl(var(--marketing-brown)/0.5)] text-xs text-[hsl(var(--marketing-tan)/0.6)] font-sans tracking-wide">
            <span>&copy; {new Date().getFullYear()} Vigilia &middot; {brand.fullName}.</span>
          </div>
        </div>
      </footer>
    </div>
    </MarketingRoleProvider>
  );
}
