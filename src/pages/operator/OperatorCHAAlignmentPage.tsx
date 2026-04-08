/**
 * OperatorCHAAlignmentPage — CHA alignment scoring across the platform.
 *
 * Measures how well facilities align with CHA's Essential Services
 * for Spiritual Care and the ERD directives.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface AlignmentCriterion {
  id: string;
  category: string;
  title: string;
  description: string;
  metric: string;
  threshold: number;
  actual: number;
  pass: boolean;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-100 text-green-800' : score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return <Badge variant="outline" className={`text-lg px-3 py-1 ${color}`}>{score}%</Badge>;
}

function CriterionRow({ c }: { c: AlignmentCriterion }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      {c.pass
        ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        : <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
      }
      <div className="flex-1">
        <p className="text-sm font-medium">{c.title}</p>
        <p className="text-xs text-muted-foreground">{c.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {c.metric}: <span className="font-medium">{c.actual}</span> (threshold: {c.threshold})
        </p>
      </div>
      <Badge variant="outline" className={`text-[10px] ${c.pass ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        {c.pass ? 'Met' : 'Below'}
      </Badge>
    </div>
  );
}

export default function OperatorCHAAlignmentPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['operator-cha-alignment'],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [visitsRes, sacRes, reflRes, printRes, volunteersRes, residentsRes] = await Promise.all([
        supabase.from('visit_rituals').select('id, resident_contact_id, visitor_user_id').gte('visited_at', thirtyDaysAgo),
        supabase.from('sacramental_records').select('id, sacrament_type, resident_contact_id').gte('administered_at', thirtyDaysAgo),
        supabase.from('family_reflections').select('id').gte('published_at', thirtyDaysAgo),
        supabase.from('print_jobs').select('id').in('status', ['shipped', 'delivered']),
        supabase.from('volunteers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('person_type', 'resident'),
      ]);

      const visits = visitsRes.data ?? [];
      const sacraments = sacRes.data ?? [];
      const totalResidents = residentsRes.count ?? 0;
      const uniqueResidentsVisited = new Set(visits.map((v: any) => v.resident_contact_id)).size;
      const sacResidents = new Set(sacraments.map((s: any) => s.resident_contact_id)).size;
      const communionCount = sacraments.filter((s: any) => s.sacrament_type === 'communion').length;

      const visitCoverage = totalResidents > 0 ? Math.round((uniqueResidentsVisited / totalResidents) * 100) : 0;
      const sacCoverage = totalResidents > 0 ? Math.round((sacResidents / totalResidents) * 100) : 0;

      const criteria: AlignmentCriterion[] = [
        {
          id: 'pastoral_presence', category: 'CHA Essential Service 3', title: 'Pastoral Presence',
          description: 'Regular pastoral visits to all residents (CHA Category 3)',
          metric: 'Residents visited in 30 days', threshold: 80, actual: visitCoverage, pass: visitCoverage >= 80,
        },
        {
          id: 'sacramental_access', category: 'ERD Directive 12', title: 'Sacramental Access',
          description: 'Residents receiving at least one sacrament per month',
          metric: 'Sacramental coverage %', threshold: 70, actual: sacCoverage, pass: sacCoverage >= 70,
        },
        {
          id: 'communion_delivery', category: 'ERD Directive 13', title: 'Eucharistic Ministry',
          description: 'Regular communion delivery to residents',
          metric: 'Communion visits (30d)', threshold: 10, actual: communionCount, pass: communionCount >= 10,
        },
        {
          id: 'family_communication', category: 'CHA Essential Service 6', title: 'Family Spiritual Communication',
          description: 'Proactive narrative updates to families',
          metric: 'Reflections published (30d)', threshold: 20, actual: reflRes.data?.length ?? 0, pass: (reflRes.data?.length ?? 0) >= 20,
        },
        {
          id: 'printed_journals', category: 'ERD Directive 35', title: 'Family Engagement (Printed)',
          description: 'Seasonal journals shipped to families',
          metric: 'Journals delivered', threshold: 1, actual: printRes.data?.length ?? 0, pass: (printRes.data?.length ?? 0) >= 1,
        },
        {
          id: 'volunteer_program', category: 'CHA Essential Service 5', title: 'Volunteer & Staff Formation',
          description: 'Active volunteer participation in ministry',
          metric: 'Active volunteers', threshold: 3, actual: volunteersRes.count ?? 0, pass: (volunteersRes.count ?? 0) >= 3,
        },
        {
          id: 'visit_frequency', category: 'CHA Essential Service 3', title: 'Visit Frequency',
          description: 'Adequate pastoral visit volume',
          metric: 'Total visits (30d)', threshold: 50, actual: visits.length, pass: visits.length >= 50,
        },
      ];

      const passCount = criteria.filter(c => c.pass).length;
      const overallScore = Math.round((passCount / criteria.length) * 100);

      return { criteria, overallScore, passCount, totalCriteria: criteria.length };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CHA Alignment Score</h1>
          <p className="text-sm text-muted-foreground">
            Measuring alignment with CHA Essential Services and ERD directives
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Refreshed'); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {data && (
        <>
          {/* Overall score */}
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Alignment</p>
                <p className="text-lg font-medium">{data.passCount} of {data.totalCriteria} criteria met</p>
              </div>
              <ScoreBadge score={data.overallScore} />
            </CardContent>
          </Card>

          {/* Individual criteria */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Criteria Assessment (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.criteria.map(c => <CriterionRow key={c.id} c={c} />)}
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                This alignment score is based on quantitative metrics from the past 30 days, mapped
                to CHA's Essential Services for Spiritual Care (2022) and the USCCB Ethical and
                Religious Directives (7th Edition, 2025). It is not a formal CHA assessment but
                provides continuous, evidence-based monitoring of Catholic identity in practice.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading alignment data...</p>}
    </div>
  );
}
