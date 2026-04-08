/**
 * OperatorSynthesisPage — Monitor AI narrative synthesis quality and throughput.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export default function OperatorSynthesisPage() {
  const { data: reflections, refetch } = useQuery({
    queryKey: ['operator-synthesis-reflections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_reflections')
        .select('id, reflection_text, reflection_type, is_print_candidate, published_at, season, tenant_id')
        .order('published_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ['operator-synthesis-chapters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_chapters')
        .select('id, chapter_text, week_start, tenant_id')
        .order('week_start', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: visits7d } = useQuery({
    queryKey: ['operator-visits-7d'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count, error } = await supabase
        .from('visit_rituals')
        .select('id', { count: 'exact', head: true })
        .gte('visited_at', weekAgo);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const totalReflections = (reflections ?? []).length;
  const printCandidates = (reflections ?? []).filter((r: any) => r.is_print_candidate).length;
  const immediateType = (reflections ?? []).filter((r: any) => r.reflection_type === 'immediate').length;
  const familyMessages = (reflections ?? []).filter((r: any) => r.reflection_type === 'family_message').length;

  // Synthesis rate: reflections per visit (last 50 reflections vs last 7d visits)
  const synthesisRate = visits7d && visits7d > 0 ? Math.round((totalReflections / visits7d) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Narrative Synthesis</h1>
          <p className="text-sm text-muted-foreground">AI reflection quality, throughput, and print readiness</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Refreshed'); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Sparkles className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{totalReflections}</p>
          <p className="text-xs text-muted-foreground">Recent Reflections</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BookOpen className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{(chapters ?? []).length}</p>
          <p className="text-xs text-muted-foreground">Weekly Chapters</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{printCandidates}</p>
          <p className="text-xs text-muted-foreground">Print-Worthy</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{visits7d}</p>
          <p className="text-xs text-muted-foreground">Visits (7d)</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{synthesisRate}%</p>
          <p className="text-xs text-muted-foreground">Synthesis Rate</p>
        </CardContent></Card>
      </div>

      {/* Recent reflections for spot-checking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent AI Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(reflections ?? []).slice(0, 15).map((ref: any) => (
            <div key={ref.id} className="py-3 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">{ref.reflection_type}</Badge>
                <Badge variant="outline" className="text-[10px]">{ref.season}</Badge>
                {ref.is_print_candidate && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">Print</Badge>}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(ref.published_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {ref.reflection_text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent chapters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Weekly Chapters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(chapters ?? []).slice(0, 5).map((ch: any) => (
            <div key={ch.id} className="py-3 border-b border-border/40 last:border-0">
              <p className="text-xs text-muted-foreground mb-2">
                Week of {new Date(ch.week_start).toLocaleDateString()}
              </p>
              <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {ch.chapter_text}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
