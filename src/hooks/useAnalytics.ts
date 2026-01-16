import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PortfolioView {
  id: string;
  user_id: string;
  viewed_at: string;
  page_path: string;
  referrer: string | null;
  user_agent: string | null;
}

export interface AnalyticsData {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsByPage: { page: string; count: number }[];
  viewsByDay: { date: string; count: number }[];
}

export function useAnalytics() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.id) {
        return {
          totalViews: 0,
          viewsToday: 0,
          viewsThisWeek: 0,
          viewsThisMonth: 0,
          viewsByPage: [],
          viewsByDay: [],
        };
      }

      const { data: views, error } = await supabase
        .from('portfolio_views')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(todayStart);
      monthStart.setDate(monthStart.getDate() - 30);

      const viewsData = views as PortfolioView[];

      const viewsToday = viewsData.filter(
        (v) => new Date(v.viewed_at) >= todayStart
      ).length;

      const viewsThisWeek = viewsData.filter(
        (v) => new Date(v.viewed_at) >= weekStart
      ).length;

      const viewsThisMonth = viewsData.filter(
        (v) => new Date(v.viewed_at) >= monthStart
      ).length;

      // Group views by page
      const pageGroups = viewsData.reduce((acc, v) => {
        acc[v.page_path] = (acc[v.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const viewsByPage = Object.entries(pageGroups)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Group views by day (last 30 days)
      const dayGroups: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const date = new Date(todayStart);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dayGroups[dateStr] = 0;
      }

      viewsData.forEach((v) => {
        const dateStr = new Date(v.viewed_at).toISOString().split('T')[0];
        if (dayGroups[dateStr] !== undefined) {
          dayGroups[dateStr]++;
        }
      });

      const viewsByDay = Object.entries(dayGroups).map(([date, count]) => ({
        date,
        count,
      }));

      return {
        totalViews: viewsData.length,
        viewsToday,
        viewsThisWeek,
        viewsThisMonth,
        viewsByPage,
        viewsByDay,
      };
    },
    enabled: !!user?.id,
  });

  return { analytics, isLoading };
}

export function useTrackView() {
  return useMutation({
    mutationFn: async ({
      userId,
      pagePath,
    }: {
      userId: string;
      pagePath: string;
    }) => {
      const { error } = await supabase.from('portfolio_views').insert({
        user_id: userId,
        page_path: pagePath,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null,
      });
      if (error) throw error;
    },
  });
}
