/**
 * OperatorVisitAdoptionPage — Monitor visit ritual adoption and usage across tenants.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export default function OperatorVisitAdoptionPage() {
  const { data: stats, refetch } = useQuery({
    queryKey: ['operator-visit-adoption'],
    queryFn: async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [totalRes, weekRes, monthRes, visitorsRes, moodsRes, recentRes] = await Promise.all([
        supabase.from('visit_rituals').select('id', { count: 'exact', head: true }),
        supabase.from('visit_rituals').select('id', { count: 'exact', head: true }).gte('visited_at', weekAgo),
        supabase.from('visit_rituals').select('id', { count: 'exact', head: true }).gte('visited_at', monthAgo),
        supabase.from('visit_rituals').select('visitor_user_id').gte('visited_at', monthAgo).then(({ data }) =>
          new Set((data ?? []).map((v: any) => v.visitor_user_id)).size
        ),
        supabase.from('visit_rituals').select('mood_observed').gte('visited_at', weekAgo).then(({ data }) => {
          const counts: Record<string, number> = {};
          for (const v of data ?? []) counts[(v as any).mood_observed] = (counts[(v as any).mood_observed] || 0) + 1;
          return counts;
        }),
        supabase.from('visit_rituals')
          .select('id, mood_observed, need_observed, concern_noted, visited_at, tenant_id')
          .order('visited_at', { ascending: false })
          .limit(20),
      ]);

      return {
        totalVisits: totalRes.count ?? 0,
        visitsThisWeek: weekRes.count ?? 0,
        visitsThisMonth: monthRes.count ?? 0,
        uniqueVisitorsMonth: visitorsRes as number,
        moodBreakdown: moodsRes as Record<string, number>,
        recentVisits: recentRes.data ?? [],
      };
    },
  });

  const avgPerDay = stats?.visitsThisWeek ? Math.round((stats.visitsThisWeek / 7) * 10) / 10 : 0;

  const moodLabels: Record<string, string> = {
    peaceful: 'Peaceful', lonely: 'Lonely', anxious: 'Anxious',
    encouraged: 'Encouraged', tired: 'Tired', hard_to_tell: 'Hard to tell',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visit Ritual Adoption</h1>
          <p className="text-sm text-muted-foreground">Usage, frequency, and mood patterns across all tenants</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Refreshed'); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Activity className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
          <p className="text-2xl font-bold">{stats?.totalVisits ?? 0}</p>
          <p className="text-xs text-muted-foreground">Total Visits</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats?.visitsThisWeek ?? 0}</p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{avgPerDay}</p>
          <p className="text-xs text-muted-foreground">Avg / Day</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-violet-500" />
          <p className="text-2xl font-bold">{stats?.uniqueVisitorsMonth ?? 0}</p>
          <p className="text-xs text-muted-foreground">Visitors (30d)</p>
        </CardContent></Card>
      </div>

      {/* Mood breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mood Distribution (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(stats?.moodBreakdown ?? {})
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => (
                <div key={mood} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                  <span className="text-sm">{moodLabels[mood] ?? mood}</span>
                  <Badge variant="outline" className="text-[10px]">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent visits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Visits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(stats?.recentVisits ?? []).map((v: any) => (
            <div key={v.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{v.mood_observed}</Badge>
                <Badge variant="outline" className="text-[10px]">{v.need_observed}</Badge>
                {v.concern_noted !== 'no_concern' && (
                  <Badge variant="outline" className="text-[10px] bg-yellow-50">{v.concern_noted}</Badge>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(v.visited_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
