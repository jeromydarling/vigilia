/**
 * OperatorDioceseOverviewPage — Platform-wide view of diocese reporting and ERD compliance.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cross, FileText, Users, Heart, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export default function OperatorDioceseOverviewPage() {
  const { data: stats, refetch } = useQuery({
    queryKey: ['operator-diocese-overview'],
    queryFn: async () => {
      const [sacRes, visitRes, tenantRes, printRes] = await Promise.all([
        supabase.from('sacramental_records').select('sacrament_type'),
        supabase.from('visit_rituals').select('id', { count: 'exact', head: true }),
        supabase.from('tenants').select('id, name, slug'),
        supabase.from('print_jobs').select('id', { count: 'exact', head: true }).in('status', ['shipped', 'delivered']),
      ]);

      const sacraments = sacRes.data ?? [];
      const sacByType: Record<string, number> = {};
      for (const s of sacraments) {
        sacByType[(s as any).sacrament_type] = (sacByType[(s as any).sacrament_type] || 0) + 1;
      }

      return {
        totalVisits: visitRes.count ?? 0,
        totalSacraments: sacraments.length,
        sacByType,
        tenants: tenantRes.data ?? [],
        journalsDelivered: printRes.count ?? 0,
      };
    },
  });

  const sacTypes = [
    { key: 'communion', label: 'Holy Communion' },
    { key: 'confession', label: 'Confession' },
    { key: 'anointing_of_sick', label: 'Anointing of the Sick' },
    { key: 'last_rites', label: 'Last Rites' },
    { key: 'rosary', label: 'Rosary' },
    { key: 'blessing', label: 'Blessings' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diocese & Compliance Overview</h1>
          <p className="text-sm text-muted-foreground">Platform-wide sacramental care and ERD compliance metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Refreshed'); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Platform totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Heart className="h-5 w-5 mx-auto mb-2 text-rose-500" />
          <p className="text-2xl font-bold">{stats?.totalVisits ?? 0}</p>
          <p className="text-xs text-muted-foreground">Total Visits</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Cross className="h-5 w-5 mx-auto mb-2 text-amber-600" />
          <p className="text-2xl font-bold">{stats?.totalSacraments ?? 0}</p>
          <p className="text-xs text-muted-foreground">Sacraments Recorded</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{(stats?.tenants ?? []).length}</p>
          <p className="text-xs text-muted-foreground">Active Facilities</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <FileText className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{stats?.journalsDelivered ?? 0}</p>
          <p className="text-xs text-muted-foreground">Journals Delivered</p>
        </CardContent></Card>
      </div>

      {/* Sacrament breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cross className="h-4 w-4" />
            Sacramental Life — Platform-Wide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sacTypes.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <span className="text-sm">{label}</span>
                <span className="text-sm font-semibold">{stats?.sacByType[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per-tenant breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          {(stats?.tenants ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No tenants yet.</p>
          )}
          <div className="space-y-2">
            {(stats?.tenants ?? []).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.slug}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ERD note */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This overview supports monitoring of pastoral care delivery in alignment with the
            Ethical and Religious Directives for Catholic Health Care Services (7th Edition, USCCB 2025).
            Individual facility reports are available at each tenant's Reports &gt; Diocese Report page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
