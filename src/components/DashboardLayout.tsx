import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useMessages } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Sparkles, LayoutDashboard, User, FolderOpen, Briefcase,
  Lightbulb, MessageSquare, Settings, LogOut, ExternalLink, Menu, X,
  Quote, FileText, GraduationCap, Award, FileDown, Heart, Palette, Trash2, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    label: 'Portfolio Content',
    items: [
      { to: '/dashboard/profile', icon: User, label: 'Profile' },
      { to: '/dashboard/projects', icon: FolderOpen, label: 'Projects' },
      { to: '/dashboard/experience', icon: Briefcase, label: 'Experience' },
      { to: '/dashboard/education', icon: GraduationCap, label: 'Education' },
      { to: '/dashboard/certifications', icon: Award, label: 'Certifications' },
      { to: '/dashboard/skills', icon: Lightbulb, label: 'Skills' },
      { to: '/dashboard/testimonials', icon: Quote, label: 'Testimonials' },
      { to: '/dashboard/blog', icon: FileText, label: 'Blog' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages', badge: true },
      { to: '/dashboard/resume', icon: FileDown, label: 'Resume Builder' },
      { to: '/dashboard/brand', icon: Heart, label: 'Brand & Identity' },
      { to: '/dashboard/content', icon: Palette, label: 'Site Content' },
    ]
  },
  {
    label: 'System',
    items: [
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
      { to: '/dashboard/trash', icon: Trash2, label: 'Trash' },
    ]
  }
];

export default function DashboardLayout() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isActive = (to: string, end?: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname === to;
  };

  // Get current page label for breadcrumb
  const currentNavItem = navGroups.flatMap(g => g.items).find(item => isActive(item.to, item.end === true));
  const pageName = currentNavItem?.label || 'Dashboard';

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col transform transition-transform duration-300 ease-in-out lg:transform-none",
        "border-r border-border/60",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
        style={{ background: 'hsl(var(--sidebar-background))' }}
      >
        {/* Logo area */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border/40 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg btn-gradient flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-base">FolioX</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.to, (item as any).end);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "sidebar-item",
                        active && "active"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-emerald-500" : "text-muted-foreground")} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {(item as any).badge && unreadCount > 0 && (
                        <span className="ml-auto shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user section */}
        <div className="shrink-0 border-t border-border/40 p-3 space-y-2">
          {profile?.username && (
            <a
              href={`/p/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 group"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">View Portfolio</p>
                <p className="text-[10px] text-muted-foreground truncate">foliox.com/p/{profile.username}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          )}

          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile?.title || 'Portfolio Builder'}</p>
            </div>
            <button
              onClick={signOut}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 shrink-0"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top header */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-5 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:block">Dashboard</span>
              {pageName !== 'Dashboard' && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  <span className="font-semibold">{pageName}</span>
                </>
              )}
              {pageName === 'Dashboard' && <span className="font-semibold sm:hidden">Dashboard</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile?.username && (
              <a
                href={`/p/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors border border-emerald-500/20"
              >
                <ExternalLink className="h-3 w-3" />
                Live Preview
              </a>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}