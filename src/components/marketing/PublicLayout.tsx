import { Link, Outlet } from 'react-router-dom';
import { MarketingRoleProvider } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { brand } from '@/config/brand';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function PublicLayout({ children }: { children?: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MarketingRoleProvider>
    <div className="min-h-screen flex flex-col marketing-theme">
      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--marketing-border))] bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--marketing-navy))] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-[hsl(var(--marketing-navy))] text-lg tracking-tight">
              {brand.appName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="/#the-ritual"
              className="text-[hsl(var(--marketing-navy)/0.6)] hover:text-[hsl(var(--marketing-navy))] transition-colors font-medium"
            >
              The Ritual
            </a>
            <Link
              to="/security"
              className="text-[hsl(var(--marketing-navy)/0.6)] hover:text-[hsl(var(--marketing-navy))] transition-colors font-medium"
            >
              Security
            </Link>
            <Link
              to="/contact"
              className="text-[hsl(var(--marketing-navy)/0.6)] hover:text-[hsl(var(--marketing-navy))] transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--marketing-navy)/0.7)] hover:text-[hsl(var(--marketing-navy))]">
                Sign in
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="sm"
                className="rounded-full bg-[hsl(var(--marketing-navy))] text-white hover:bg-[hsl(var(--marketing-navy)/0.9)] px-5"
              >
                Start pilot <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[hsl(var(--marketing-border))] bg-white px-4 py-4 space-y-3">
            <a href="/#the-ritual" className="block text-sm font-medium text-[hsl(var(--marketing-navy)/0.7)] py-1.5" onClick={() => setMobileOpen(false)}>
              The Ritual
            </a>
            <Link to="/security" className="block text-sm font-medium text-[hsl(var(--marketing-navy)/0.7)] py-1.5" onClick={() => setMobileOpen(false)}>
              Security
            </Link>
            <Link to="/contact" className="block text-sm font-medium text-[hsl(var(--marketing-navy)/0.7)] py-1.5" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <div className="flex gap-2 pt-2 border-t border-[hsl(var(--marketing-border))]">
              <Link to="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-full">Sign in</Button>
              </Link>
              <Link to="/contact" className="flex-1">
                <Button size="sm" className="w-full rounded-full bg-[hsl(var(--marketing-navy))] text-white">
                  Start pilot
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

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface))]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(var(--marketing-navy))] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <span className="font-semibold text-[hsl(var(--marketing-navy))]">{brand.appName}</span>
              </div>
              <p className="text-sm text-[hsl(var(--marketing-navy)/0.5)] max-w-xs">
                {brand.fullName}
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/contact" className="text-[hsl(var(--marketing-navy)/0.5)] hover:text-[hsl(var(--marketing-navy))] transition-colors">Contact</Link>
              <Link to="/security" className="text-[hsl(var(--marketing-navy)/0.5)] hover:text-[hsl(var(--marketing-navy))] transition-colors">Security</Link>
              <Link to="/legal/privacy" className="text-[hsl(var(--marketing-navy)/0.5)] hover:text-[hsl(var(--marketing-navy))] transition-colors">Privacy</Link>
              <Link to="/legal/terms" className="text-[hsl(var(--marketing-navy)/0.5)] hover:text-[hsl(var(--marketing-navy))] transition-colors">Terms</Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-[hsl(var(--marketing-border))] text-xs text-[hsl(var(--marketing-navy)/0.4)]">
            <span>© {new Date().getFullYear()} Vigilia · {brand.fullName}. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
    </MarketingRoleProvider>
  );
}
