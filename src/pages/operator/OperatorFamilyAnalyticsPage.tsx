/**
 * OperatorFamilyAnalyticsPage — Family journal engagement metrics across tenants.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Mail, Printer, Users, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export default function OperatorFamilyAnalyticsPage() {
  const { data: reflectionStats, refetch } = useQuery({
    queryKey: ['operator-family-analytics'],
    queryFn: async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [totalRes, weekRes, monthRes, chaptersRes, printRes, memoriesRes, tenantsRes] = await Promise.all([
        supabase.from('family_reflections').select('id', { count: 'exact', head: true }),
        supabase.from('family_reflections').select('id', { count: 'exact', head: true }).gte('published_at', weekAgo),
        supabase.from('family_reflections').select('id', { count: 'exact', head: true }).gte('published_at', monthAgo),
        supabase.from('weekly_chapters').select('id', { count: 'exact', head: true }),
        supabase.from('print_jobs').select('id', { count: 'exact', head: true }).in('status', ['shipped', 'delivered']),
        supabase.from('family_memories').select('id', { count: 'exact', head: true }).catch(() => ({ count: 0 })),
        supabase.from('family_reflections').select('tenant_id').then(({ data }) => {
          return new Set((data ?? []).map((r: any) => r.tenant_id)).size;
        }),
      ]);

      return {
        totalReflections: totalRes.count ?? 0,
        reflectionsThisWeek: weekRes.count ?? 0,
        reflectionsThisMonth: monthRes.count ?? 0,
        totalChapters: chaptersRes.count ?? 0,
        journalsDelivered: printRes.count ?? 0,
        familyMemories: (memoriesRes as any).count ?? 0,
        tenantsWithReflections: tenantsRes as number,
      };
    },
  });

  const { data: recentReflections } = useQuery({
    queryKey: ['operator-recent-family-reflections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_reflections')
        .select('id, reflection_text, published_at, season, reflection_type')
        .order('published_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const s = reflectionStats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Family Journal Analytics</h1>
          <p className="text-sm text-muted-foreground">Engagement, delivery, and narrative quality across the platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Refreshed'); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Heart className="h-5 w-5 mx-auto mb-2 text-rose-500" />
          <p className="text-2xl font-bold">{s?.totalReflections ?? 0}</p>
          <p className="text-xs text-muted-foreground">Total Reflections</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{s?.totalChapters ?? 0}</p>
          <p className="text-xs text-muted-foreground">Weekly Chapters</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Printer className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{s?.journalsDelivered ?? 0}</p>
          <p className="text-xs text-muted-foreground">Journals Delivered</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{s?.tenantsWithReflections ?? 0}</p>
          <p className="text-xs text-muted-foreground">Active Tenants</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">This Week</p>
          <p className="text-xl font-bold">{s?.reflectionsThisWeek ?? 0} reflections</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">This Month</p>
          <p className="text-xl font-bold">{s?.reflectionsThisMonth ?? 0} reflections</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Family Contributions</p>
          <p className="text-xl font-bold">{s?.familyMemories ?? 0} memories</p>
        </CardContent></Card>
      </div>

      {/* Sample reflections for quality check */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Latest Published Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(recentReflections ?? []).map((ref: any) => (
            <div key={ref.id} className="py-3 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px]">{ref.season}</Badge>
                <Badge variant="outline" className="text-[10px]">{ref.reflection_type}</Badge>
                <span className="text-[10px] text-muted-foreground ml-auto">{new Date(ref.published_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {ref.reflection_text?.slice(0, 200)}{ref.reflection_text?.length > 200 ? '...' : ''}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
