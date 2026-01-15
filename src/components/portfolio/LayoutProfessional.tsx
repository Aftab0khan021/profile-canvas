import { ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Download, Mail, Linkedin, Github } from 'lucide-react';

interface LayoutProfessionalProps {
  profile: {
    full_name: string | null;
    title: string | null;
    avatar_url: string | null;
    email: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    resume_url: string | null;
    brand_color: string | null;
  };
  initials: string;
  brandColor: string;
  navItems: { id: string; label: string }[];
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
  children: ReactNode;
}

export function LayoutProfessional({ profile, initials, brandColor, navItems, onNavClick, children }: LayoutProfessionalProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Professional theme: Sidebar layout */}
      <style>{`
        .pro-accent { color: ${brandColor}; }
        .pro-bg { background-color: ${brandColor}; }
        .pro-border { border-color: ${brandColor}; }
        .pro-hover:hover { background-color: ${brandColor}10; }
      `}</style>

      {/* Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-muted/30 border-r flex-col p-6">
        <div className="flex-1">
          {/* Profile */}
          <div className="text-center mb-8">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4" style={{ borderColor: brandColor }} />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: brandColor }}>
                {initials}
              </div>
            )}
            <h1 className="text-xl font-bold">{profile.full_name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{profile.title}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => onNavClick(e, item.id)}
                className="block px-4 py-2 rounded-lg text-sm font-medium pro-hover transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          <div className="flex justify-center gap-3">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="p-2 rounded-lg pro-hover">
                <Mail className="h-5 w-5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" className="p-2 rounded-lg pro-hover">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" className="p-2 rounded-lg pro-hover">
                <Github className="h-5 w-5" />
              </a>
            )}
          </div>
          
          {profile.resume_url && (
            <Button className="w-full" style={{ backgroundColor: brandColor }} asChild>
              <a href={profile.resume_url} target="_blank">
                <Download className="h-4 w-4 mr-2" /> Download CV
              </a>
            </Button>
          )}
          
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold">{profile.full_name}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile.resume_url && (
              <Button size="sm" style={{ backgroundColor: brandColor }} asChild>
                <a href={profile.resume_url} target="_blank"><Download className="h-4 w-4" /></a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
        
        <footer className="py-8 border-t lg:ml-0">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {profile.full_name}. Built with FolioX.
          </div>
        </footer>
      </main>
    </div>
  );
}
