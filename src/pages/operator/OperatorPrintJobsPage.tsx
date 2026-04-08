/**
 * OperatorPrintJobsPage — Monitor seasonal journal print fulfillment across all tenants.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Package, Truck, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  generating_pdf: { label: 'Generating PDF', className: 'bg-blue-100 text-blue-800' },
  pdf_ready: { label: 'PDF Ready', className: 'bg-cyan-100 text-cyan-800' },
  submitted_to_lulu: { label: 'Submitted', className: 'bg-yellow-100 text-yellow-800' },
  printing: { label: 'Printing', className: 'bg-orange-100 text-orange-800' },
  shipped: { label: 'Shipped', className: 'bg-green-100 text-green-800' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800' },
  error: { label: 'Error', className: 'bg-red-100 text-red-800' },
};

export default function OperatorPrintJobsPage() {
  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['operator-print-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('print_jobs')
        .select('*, contacts!print_jobs_resident_contact_id_fkey(name), tenants!print_jobs_tenant_id_fkey(name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const statusCounts: Record<string, number> = {};
  for (const job of jobs ?? []) {
    statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
  }

  const errorJobs = (jobs ?? []).filter((j: any) => j.status === 'error');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Print Jobs</h1>
          <p className="text-sm text-muted-foreground">Seasonal journal fulfillment across all tenants</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetch(); toast.success('Refreshed'); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <Printer className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-bold">{(jobs ?? []).length}</p>
          <p className="text-xs text-muted-foreground">Total Jobs</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Package className="h-5 w-5 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{statusCounts['printing'] || 0}</p>
          <p className="text-xs text-muted-foreground">Printing</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Truck className="h-5 w-5 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{(statusCounts['shipped'] || 0) + (statusCounts['delivered'] || 0)}</p>
          <p className="text-xs text-muted-foreground">Shipped/Delivered</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-500" />
          <p className="text-2xl font-bold">{errorJobs.length}</p>
          <p className="text-xs text-muted-foreground">Errors</p>
        </CardContent></Card>
      </div>

      {/* Job list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Print Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground py-4">Loading...</p>}
          {(jobs ?? []).length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">No print jobs yet.</p>
          )}
          <div className="space-y-2">
            {(jobs ?? []).map((job: any) => {
              const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE.pending;
              return (
                <div key={job.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{(job.contacts as any)?.name ?? 'Unknown Resident'}</p>
                    <p className="text-xs text-muted-foreground">
                      {(job.tenants as any)?.name ?? 'Unknown Tenant'} &middot; {job.season} {job.season_year}
                    </p>
                    {job.error_message && <p className="text-xs text-red-600 mt-1">{job.error_message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {job.tracking_url && (
                      <a href={job.tracking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Track</a>
                    )}
                    <Badge variant="outline" className={`text-[10px] ${badge.className}`}>{badge.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
