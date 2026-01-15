import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface LayoutModernProps {
  profile: {
    full_name: string | null;
    resume_url: string | null;
    brand_color: string | null;
  };
  initials: string;
  brandColor: string;
  navItems: { id: string; label: string }[];
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  children: ReactNode;
}

export function LayoutModern({ profile, initials, brandColor, navItems, onNavClick, children }: LayoutModernProps) {
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
        .brand-progress [data-state="complete"], .brand-progress [data-state="loading"] { background-color: ${brandColor}; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg brand-bg flex items-center justify-center text-white font-bold text-sm">{initials}</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map(item => (
              <a key={item.id} href={`#${item.id}`} onClick={(e) => onNavClick(e, item.id)} className="brand-hover transition-colors cursor-pointer">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile.resume_url && (
              <Button size="sm" className="brand-btn" asChild>
                <a href={profile.resume_url} target="_blank"><Download className="h-4 w-4 mr-1" />Resume</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.full_name}. Built with FolioX.
        </div>
      </footer>
    </div>
  );
}
