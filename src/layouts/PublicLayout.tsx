import { Outlet, useParams, Link, useLocation, useOutletContext } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/useProfile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Types for outlet context
interface PublicLayoutContext {
  profile: ReturnType<typeof usePublicProfile>['data'];
  brandColor: string;
  initials: string;
  username: string;
}

// Hook to access the public layout context from child pages
export function usePublicLayoutContext() {
  return useOutletContext<PublicLayoutContext>();
}

export default function PublicLayout() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { data: profile, isLoading } = usePublicProfile(username || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Portfolio not found.</p>
      </div>
    );
  }

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const brandColor = profile.brand_color || '#3b82f6';
  const basePath = `/p/${username}`;

  const navItems = [
    { to: basePath, label: 'Home', end: true },
    { to: `${basePath}/about`, label: 'About' },
    { to: `${basePath}/projects`, label: 'Projects' },
    { to: `${basePath}/experience`, label: 'Experience' },
    { to: `${basePath}/skills`, label: 'Skills' },
    { to: `${basePath}/blog`, label: 'Blog' },
    { to: `${basePath}/contact`, label: 'Contact' },
  ];

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dynamic brand color styles */}
      <style>{`
        .brand-primary { color: ${brandColor}; }
        .brand-bg { background-color: ${brandColor}; }
        .brand-border { border-color: ${brandColor}; }
        .brand-hover:hover { color: ${brandColor}; }
        .brand-btn { background-color: ${brandColor}; color: white; }
        .brand-btn:hover { opacity: 0.9; }
        .brand-fill { fill: ${brandColor}; color: ${brandColor}; }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to={basePath} className="h-8 w-8 rounded-lg brand-bg flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "transition-colors",
                  isActive(item.to, item.end)
                    ? "brand-primary font-medium"
                    : "text-muted-foreground brand-hover"
                )}
                style={isActive(item.to, item.end) ? { color: brandColor } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile.resume_url && (
              <Button size="sm" className="brand-btn hidden sm:flex" asChild>
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />Resume
                </a>
              </Button>
            )}
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-background p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-lg transition-colors",
                  isActive(item.to, item.end)
                    ? "brand-bg text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
                style={isActive(item.to, item.end) ? { backgroundColor: brandColor } : undefined}
              >
                {item.label}
              </Link>
            ))}
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <Download className="h-4 w-4 inline mr-2" />Download Resume
              </a>
            )}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-14">
        <Outlet context={{ profile, brandColor, initials, username: username || '' } satisfies PublicLayoutContext} />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.full_name}. Built with FolioX.
        </div>
      </footer>
    </div>
  );
}
