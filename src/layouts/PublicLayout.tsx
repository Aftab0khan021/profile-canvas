import { Outlet, useParams, Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/useProfile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Menu, X } from 'lucide-react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import NotFound from '@/pages/NotFound';
import { useLenis } from '@/hooks/useLenis';
import { CustomCursor } from '@/components/CustomCursor';
import { IntroScreen } from '@/components/IntroScreen';
import { ScrollProgress } from '@/components/ScrollProgress';
import { HiddenTerminal } from '@/components/HiddenTerminal';

interface PublicLayoutContext {
  profile: ReturnType<typeof usePublicProfile>['data'];
  brandColor: string;
  initials: string;
  username: string;
  template: 'modern' | 'minimal' | 'professional';
}

export function usePublicLayoutContext() {
  return useOutletContext<PublicLayoutContext>();
}

export default function PublicLayout() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { data: profile, isLoading } = usePublicProfile(username || '');
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Show intro only once per browser session
  const [introComplete, setIntroComplete] = useState(() => {
    try { return sessionStorage.getItem('intro_shown') === '1'; } catch { return true; }
  });
  const handleIntroComplete = useCallback(() => {
    try { sessionStorage.setItem('intro_shown', '1'); } catch {}
    setIntroComplete(true);
  }, []);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for nav style changes
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const sameAs = useMemo(() => {
    if (!profile) return [];
    const links: string[] = [];
    if (profile.linkedin_url) links.push(profile.linkedin_url);
    if (profile.github_url) links.push(profile.github_url);
    return links;
  }, [profile]);

  const personSchema = useMemo(() => {
    if (!profile) return {};
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.full_name || 'Developer',
      "jobTitle": profile.title || undefined,
      "url": currentUrl,
      "image": profile.avatar_url || undefined,
      "email": profile.email || undefined,
      ...(sameAs.length > 0 && { sameAs })
    };
  }, [profile, currentUrl, sameAs]);

  const basePath = `/p/${username}`;

  // Keyboard shortcuts — must be above ALL early returns (Rules of Hooks)
  useEffect(() => {
    if (!profile) return;
    const bp = `/p/${username}`;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      const keyMap: Record<string, string> = {
        h: bp,
        p: `${bp}/projects`,
        a: `${bp}/about`,
        s: `${bp}/skills`,
        e: `${bp}/experience`,
        c: `${bp}/contact`,
        b: `${bp}/blog`,
      };
      if (e.key === 'Escape') { navigate(bp); return; }
      const target = keyMap[e.key.toLowerCase()];
      if (target) navigate(target);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, profile?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl btn-gradient flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-sm">...</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!profile) return <NotFound />;

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const SAFE_HEX = /^#[0-9a-fA-F]{3,8}$/;
  const brandColor = SAFE_HEX.test(profile.brand_color ?? '') ? profile.brand_color! : '#7C3AED';
  const safeResumeUrl = profile.resume_url?.startsWith('https://') ? profile.resume_url : null;
  const rawTemplate = (profile as unknown as Record<string, unknown>).template as string | null;
  const template: 'modern' | 'minimal' | 'professional' =
    rawTemplate === 'minimal' || rawTemplate === 'professional' ? rawTemplate : 'modern';

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

  const seoTitle = profile.full_name && profile.title
    ? `${profile.full_name} - ${profile.title} | Portfolio`
    : profile.full_name ? `${profile.full_name} | Portfolio` : 'Developer Portfolio';

  const seoDescription = profile.bio
    ? profile.bio.length > 160 ? profile.bio.slice(0, 157) + '...' : profile.bio
    : `View ${profile.full_name || 'this developer'}'s portfolio showcasing projects, skills, and experience.`;

  const seoImage = profile.avatar_url || 'og-image.png';

  // (keyboard shortcuts moved above early returns)

  return (
    <div className="dark min-h-screen editorial-surface">
      <SEO title={seoTitle} description={seoDescription} image={seoImage} url={currentUrl} type="profile" schema={personSchema} />

      {/* Intro screen — shows once per session */}
      {!introComplete && (
        <IntroScreen
          name={profile.full_name || 'Developer'}
          title={profile.title || undefined}
          avatarUrl={profile.avatar_url || undefined}
          brandColor={brandColor}
          onComplete={handleIntroComplete}
        />
      )}

      {/* Aurora background */}
      <div className="aurora-bg" style={{ '--aurora-color': brandColor } as React.CSSProperties} />

      {/* Film grain overlay */}
      <div className="grain-overlay" />

      {/* Custom cursor */}
      <CustomCursor />

      {/* Scroll progress bar */}
      <ScrollProgress brandColor={brandColor} />

      {/* Hidden terminal — press ` to open */}
      <HiddenTerminal profile={profile} brandColor={brandColor} />

      {/* Dynamic brand color styles */}
      <style>{`
        :root {
          --cursor-color: ${brandColor};
          --aurora-color: ${brandColor};
          --gradient-color: ${brandColor};
          --neon-color: ${brandColor};
          --conic-color: ${brandColor};
          --glow-color: ${brandColor};
          --scan-color: ${brandColor}20;
        }
        .brand-primary { color: ${brandColor}; }
        .brand-bg { background-color: ${brandColor}; }
        .brand-border { border-color: ${brandColor}; }
        .brand-hover:hover { color: ${brandColor}; }
        .brand-btn { background-color: ${brandColor}; color: white; }
        .brand-btn:hover { opacity: 0.9; }
        .brand-fill { fill: ${brandColor}; color: ${brandColor}; }
        .brand-ring:focus { outline: 2px solid ${brandColor}; outline-offset: 2px; }
        .nav-active-brand { color: ${brandColor}; font-weight: 600; }
        .nav-active-brand::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background-color: ${brandColor}; border-radius: 999px; }
      `}</style>

      {/* ── Floating Navigation ── */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "py-2"
          : "py-4"
      )}>
        <div className={cn(
          "mx-auto max-w-5xl px-4 transition-all duration-500",
        )}>
          <div
            className={cn(
              "flex items-center justify-between h-12 px-4 rounded-2xl transition-all duration-500",
              scrolled
                ? "backdrop-blur-xl shadow-lg"
                : "backdrop-blur-md"
            )}
            style={{
              background: scrolled ? 'rgba(10,10,10,0.85)' : 'rgba(10,10,10,0.5)',
              border: `1px solid ${scrolled ? brandColor + '30' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: scrolled ? `0 0 24px -8px ${brandColor}40` : 'none',
            }}
          >
            {/* Profile identity */}
            <Link to={basePath} className="flex items-center gap-2.5 group">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={initials} className="h-7 w-7 rounded-lg object-cover ring-2 ring-border group-hover:ring-offset-1 transition-all" style={{ '--tw-ring-color': brandColor } as React.CSSProperties} />
              ) : (
                <div className="h-7 w-7 rounded-lg brand-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>
              )}
              <span className="font-display font-bold text-sm hidden sm:block truncate max-w-[120px]">
                {profile.full_name || username}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((navItem) => {
                const active = isActive(navItem.to, navItem.end);
                return (
                  <Link
                    key={navItem.to}
                    to={navItem.to}
                    className={cn(
                      "relative px-3 py-1.5 rounded-lg text-sm transition-all duration-200",
                      active
                        ? "font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                    style={active ? { color: brandColor } : undefined}
                  >
                    {navItem.label}
                    {active && (
                      <span
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full"
                        style={{ backgroundColor: brandColor }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              {safeResumeUrl && (
                <a
                  href={safeResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 brand-btn shadow-sm"
                >
                  <Download className="h-3 w-3" />
                  Resume
                </a>
              )}
              <button
                className="md:hidden h-8 w-8 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="mt-2 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/60 shadow-xl overflow-hidden">
              <nav className="p-3 space-y-0.5">
                {navItems.map((navItem) => {
                  const active = isActive(navItem.to, navItem.end);
                  return (
                    <Link
                      key={navItem.to}
                      to={navItem.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                      style={active ? { backgroundColor: brandColor } : undefined}
                    >
                      {navItem.label}
                    </Link>
                  );
                })}
                {safeResumeUrl && (
                  <a href={safeResumeUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors">
                    <Download className="h-4 w-4" />Download Resume
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main content — padded for floating nav */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet context={{ profile, brandColor, initials, username: username || '', template } satisfies PublicLayoutContext} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer — editorial style */}
      <footer className="py-16 border-t" style={{ borderColor: `${brandColor}15` }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={initials} className="h-8 w-8 rounded-lg object-cover" style={{ boxShadow: `0 0 0 2px ${brandColor}40` }} />
              ) : (
                <div className="h-8 w-8 rounded-lg brand-bg flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="font-display font-bold text-sm" style={{ color: '#f0ede6' }}>{profile.full_name}</span>
            </div>
            <p className="text-xs text-center font-mono" style={{ color: '#4b5563', letterSpacing: '0.08em' }}>
              © {new Date().getFullYear()} {profile.full_name} · Built with{' '}
              <a href="/" className="font-semibold transition-colors hover:opacity-80" style={{ color: brandColor }}>FolioX</a>
            </p>
            <div className="flex items-center gap-2">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors text-xs font-bold">
                  GH
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="h-7 w-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors text-xs font-bold">
                  Li
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}