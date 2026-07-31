import { useProfile } from '@/hooks/useProfile';
import { useProjects, useExperience, useMessages } from '@/hooks/usePortfolioData';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  FolderOpen, Briefcase, MessageSquare, ExternalLink, ArrowRight,
  Eye, TrendingUp, Calendar, BarChart3, Sparkles, User, Settings, Zap
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

export default function DashboardHome() {
  const { profile } = useProfile();
  const { projects } = useProjects();
  const { experience } = useExperience();
  const { unreadCount } = useMessages();
  const { analytics, isLoading: analyticsLoading } = useAnalytics();

  const chartData = useMemo(() => {
    if (!analytics?.viewsByDay) return [];
    return analytics.viewsByDay.map((day) => {
      const date = new Date(day.date);
      return {
        date: day.date,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: day.count,
      };
    });
  }, [analytics?.viewsByDay]);

  const chartConfig = {
    views: { label: 'Views', color: 'hsl(var(--primary))' },
  };

  const profileCompletion = [
    !profile?.avatar_url,
    !profile?.title,
    !profile?.bio,
  ].filter(Boolean).length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5 max-w-6xl"
    >
      {/* Welcome banner */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl p-6 border border-border/60"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(99,102,241,0.04) 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-base font-bold shadow-md shrink-0">
                {profile?.full_name?.charAt(0)?.toUpperCase() || '✦'}
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
                <p className="text-muted-foreground text-sm mt-0.5">Here's what's happening with your portfolio.</p>
              </div>
            </div>
            {profile?.username && (
              <a
                href={`/p/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-transform duration-200 shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                View Portfolio
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Analytics stats — bento grid */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-violet-500" />
          <h2 className="font-semibold text-sm">Portfolio Analytics</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Views', value: analyticsLoading ? '—' : analytics?.viewsLast30Days || 0, sub: 'Last 30 days', icon: Eye, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Today', value: analyticsLoading ? '—' : analytics?.viewsToday || 0, sub: 'Views today', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'This Week', value: analyticsLoading ? '—' : analytics?.viewsThisWeek || 0, sub: 'Last 7 days', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'This Month', value: analyticsLoading ? '—' : analytics?.viewsThisMonth || 0, sub: 'Last 30 days', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="bento-card group">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                </div>
              </div>
              <div className={cn("font-display text-2xl font-bold", analyticsLoading ? 'animate-pulse text-muted-foreground' : '')}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chart + Popular pages */}
      <motion.div variants={item} className="grid lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bento-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Views Over Time</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Daily views — last 30 days</p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <div className="h-4 w-4 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
                Loading analytics...
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" tickMargin={6} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={28} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#viewsGradient)" dot={false} activeDot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No view data yet</p>
              <p className="text-xs text-muted-foreground/70">Share your portfolio to start tracking</p>
            </div>
          )}
        </div>

        {/* Popular pages */}
        <div className="bento-card">
          <h3 className="text-sm font-semibold mb-3">Popular Pages</h3>
          {analytics?.viewsByPage && analytics.viewsByPage.length > 0 ? (
            <div className="space-y-2">
              {analytics.viewsByPage.slice(0, 5).map((page, i) => {
                const maxViews = analytics.viewsByPage[0]?.count || 1;
                const pct = (page.count / maxViews) * 100;
                return (
                  <div key={page.page}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs truncate max-w-[150px] font-medium">{page.page}</span>
                      <span className="text-xs text-muted-foreground font-mono">{page.count}</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 py-8">
              <Eye className="h-7 w-7 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground text-center">Share your portfolio to see page stats</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Projects', value: projects.length, icon: FolderOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', to: '/dashboard/projects', link: 'Manage projects' },
            { label: 'Experience', value: experience.length, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10', to: '/dashboard/experience', link: 'Manage experience' },
            { label: 'Messages', value: `${unreadCount} unread`, icon: MessageSquare, color: 'text-violet-500', bg: 'bg-violet-500/10', to: '/dashboard/messages', link: 'View messages' },
          ].map((stat) => (
            <div key={stat.label} className="bento-card flex items-center gap-4">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="font-display text-xl font-bold">{stat.value}</p>
              </div>
              <Link to={stat.to} className="text-xs text-violet-500 hover:text-violet-600 font-semibold flex items-center gap-1 shrink-0">
                {stat.link} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Profile completion */}
      {profileCompletion > 0 && (
        <motion.div variants={item}>
          <div className="bento-card border-dashed">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-base mb-1">Complete your profile</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {!profile?.avatar_url && 'Add a profile photo. '}
                  {!profile?.title && 'Add your professional title. '}
                  {!profile?.bio && 'Write a short bio.'}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${((3 - profileCompletion) / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {3 - profileCompletion}/3
                  </span>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0">
                <Link to="/dashboard/settings">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Complete
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Project', icon: FolderOpen, to: '/dashboard/projects' },
            { label: 'Edit Profile', icon: User, to: '/dashboard/profile' },
            { label: 'Write Blog', icon: TrendingUp, to: '/dashboard/blog' },
            { label: 'Settings', icon: Settings, to: '/dashboard/settings' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="bento-card flex flex-col items-center gap-2 p-4 text-center group cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors">
                <action.icon className="h-4 w-4 text-violet-500" />
              </div>
              <span className="text-xs font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
