import { useProfile } from '@/hooks/useProfile';
import { useProjects, useExperience, useMessages } from '@/hooks/usePortfolioData';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FolderOpen, Briefcase, MessageSquare, ExternalLink, ArrowRight, Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export default function DashboardHome() {
  const { profile } = useProfile();
  const { projects } = useProjects();
  const { experience } = useExperience();
  const { messages, unreadCount } = useMessages();
  const { analytics, isLoading: analyticsLoading } = useAnalytics();

  // Format chart data for recharts
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
    views: {
      label: 'Views',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'there'}!</h1>
        <p className="text-muted-foreground">Here's an overview of your portfolio.</p>
      </div>

      {profile?.username && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">Your public portfolio</p>
              <p className="text-sm text-muted-foreground">foliox.com/p/{profile.username}</p>
            </div>
            <Button asChild>
              <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Portfolio Analytics
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '—' : analytics?.totalViews || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '—' : analytics?.viewsToday || 0}
              </div>
              <p className="text-xs text-muted-foreground">Views today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '—' : analytics?.viewsThisWeek || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? '—' : analytics?.viewsThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Views Area Chart - Last 30 Days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Views (Last 30 Days)</CardTitle>
          <CardDescription>Daily portfolio views over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          ) : chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  width={30}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">No view data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Pages */}
      {analytics?.viewsByPage && analytics.viewsByPage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Popular Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.viewsByPage.map((page) => (
                <div key={page.page} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[200px]">{page.page}</span>
                  <span className="text-sm font-medium">{page.count} views</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <Link to="/dashboard/projects" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Manage projects <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experience.length}</div>
            <Link to="/dashboard/experience" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Manage experience <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount} <span className="text-sm font-normal text-muted-foreground">unread</span></div>
            <Link to="/dashboard/messages" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View messages <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {!profile?.bio && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Complete your profile</CardTitle>
            <CardDescription>Add your bio, title, and social links to make your portfolio stand out.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to="/dashboard/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
