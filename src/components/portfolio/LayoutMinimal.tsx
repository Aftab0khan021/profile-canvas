import { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight } from 'lucide-react';

interface LayoutMinimalProps {
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

export function LayoutMinimal({ profile, initials, brandColor, navItems, onNavClick, children }: LayoutMinimalProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal theme: Black and white with large typography */}
      <style>{`
        .minimal-accent { color: ${brandColor}; }
        .minimal-border { border-color: currentColor; }
        .minimal-underline { text-decoration-color: ${brandColor}; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">{profile.full_name || 'Portfolio'}</span>
          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
            {navItems.map(item => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                onClick={(e) => onNavClick(e, item.id)} 
                className="hover:underline underline-offset-4 transition-all cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {profile.resume_url && (
              <Button variant="outline" size="sm" className="rounded-none border-2" asChild>
                <a href={profile.resume_url} target="_blank">CV <ArrowRight className="h-3 w-3 ml-1" /></a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="pt-16">
        {children}
      </div>

      <footer className="py-12 border-t">
        <div className="container mx-auto px-6 flex justify-between items-center text-sm">
          <span>© {new Date().getFullYear()}</span>
          <span className="uppercase tracking-widest">{profile.full_name}</span>
        </div>
      </footer>
    </div>
  );
}
