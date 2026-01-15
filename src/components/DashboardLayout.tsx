import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useMessages } from '@/hooks/usePortfolioData';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Sparkles, LayoutDashboard, User, FolderOpen, Briefcase,
  Lightbulb, MessageSquare, Settings, LogOut, ExternalLink, Menu, X, Quote, FileText, GraduationCap, Award, FileDown, Heart, Palette
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
  { to: '/dashboard/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/dashboard/experience', icon: Briefcase, label: 'Experience' },
  { to: '/dashboard/education', icon: GraduationCap, label: 'Education' },
  { to: '/dashboard/certifications', icon: Award, label: 'Certifications' },
  { to: '/dashboard/skills', icon: Lightbulb, label: 'Skills' },
  { to: '/dashboard/testimonials', icon: Quote, label: 'Testimonials' },
  { to: '/dashboard/blog', icon: FileText, label: 'Blog' },
  { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/dashboard/resume', icon: FileDown, label: 'Resume Builder' },
  { to: '/dashboard/brand', icon: Heart, label: 'Brand & Identity' },
  { to: '/dashboard/content', icon: Palette, label: 'Site Content' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">FolioX</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.label === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-2">
            {profile?.username && (
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portfolio
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
