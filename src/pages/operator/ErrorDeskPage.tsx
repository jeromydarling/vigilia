/**
 * ErrorDeskPage — Centralized operator error tracking console.
 *
 * WHAT: Admin-only view of all captured frontend + edge + DB errors.
 * WHERE: /operator/error-desk
 * WHY: One place to see, triage, and generate Lovable repair prompts for all issues.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Search, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { ErrorDetailDrawer } from '@/components/operator/ErrorDetailDrawer';
import { classifyImpact } from '@/lib/operatorImpactClassifier';
import { buildLovableFixPrompt, buildBulkRepairPrompt } from '@/lib/buildLovableFixPrompt';
import { calmVariant } from '@/lib/calmMode';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { HelpTooltip } from '@/components/ui/help-tooltip';
const SectionTooltip = HelpTooltip;

interface ErrorRecord {
  id: string;
  tenant_id: string | null;
  source: string;
  severity: string;
  fingerprint: string;
  message: string;
  context: Record<string, unknown>;
  repro_steps: string | null;
  expected: string | null;
  first_seen_at: string;
  last_seen_at: string;
  count: number;
  status: string;
  owner_notes: string | null;
  lovable_prompt: string | null;
}
export default function ErrorDeskPage() {
  const [tab, setTab] = useState('open');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkCopied, setBulkCopied] = useState(false);

  const bulk = useBulkSelection<ErrorRecord>();

  const statusFilter = tab === 'open' ? ['open', 'acknowledged'] : tab === 'resolved' ? ['resolved'] : ['ignored'];

  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ['operator-app-errors', statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operator_app_errors')
        .select('*')
        .in('status', statusFilter)
        .order('last_seen_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as ErrorRecord[];
    },
  });

  const filteredErrors = useMemo(() => {
    let result = errors ?? [];
    if (sourceFilter !== 'all') result = result.filter(e => e.source === sourceFilter);
    if (severityFilter !== 'all') result = result.filter(e => e.severity === severityFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.message.toLowerCase().includes(q) || e.fingerprint.includes(q));
    }
    return result;
  }, [errors, sourceFilter, severityFilter, search]);

  const handleRowClick = (error: ErrorRecord) => {
    setSelectedError(error);
    setDrawerOpen(true);
  };

  const handleBulkCopy = async () => {
    const selected = bulk.getSelectedItems(filteredErrors);
    if (selected.length === 0) {
      toast.error('Select at least one issue');
      return;
    }
    const prompt = selected.length === 1
      ? buildLovableFixPrompt(selected[0])
      : buildBulkRepairPrompt(selected);
    await navigator.clipboard.writeText(prompt);
    setBulkCopied(true);
    toast.success(`${selected.length === 1 ? 'Repair prompt' : 'Bulk stabilization prompt'} copied.`);
    setTimeout(() => setBulkCopied(false), 3000);
  };

  const sourceBadge = (source: string) => {
    return (
      <Badge variant="outline" className="text-[10px]">
        {source.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-1">
            Error Desk
            <SectionTooltip
              what="Centralized error tracking for the CROS platform"
              where="operator_app_errors table"
              why="One place to triage, understand, and fix platform issues"
            />
          </h1>
          <p className="text-sm text-muted-foreground">Quiet visibility into what may need attention.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search errors..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="edge_function">Edge Function</SelectItem>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {bulk.selectedCount > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-md">
          <span className="text-sm text-muted-foreground">{bulk.selectedCount} selected</span>
          <Button size="sm" variant="outline" onClick={handleBulkCopy} disabled={bulkCopied}>
            {bulkCopied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {bulk.selectedCount === 1 ? 'Copy Prompt' : 'Copy Combined Prompt'}
          </Button>
          <Button size="sm" variant="ghost" onClick={bulk.clearSelection}>Clear</Button>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => { setTab(v); bulk.clearSelection(); }}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="ignored">Ignored</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {isLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : filteredErrors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground text-sm">
                {tab === 'open' ? 'No open issues — the system is running smoothly.' : `No ${tab} items.`}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <Checkbox
                          checked={bulk.isAllSelected(filteredErrors)}
                          onCheckedChange={(checked) => checked ? bulk.selectAll(filteredErrors) : bulk.clearSelection()}
                        />
                      </TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="hidden sm:table-cell">Severity</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Count</TableHead>
                      <TableHead className="text-right">Last Seen</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.map((error) => {
                      const impact = classifyImpact(error);
                      return (
                        <TableRow
                          key={error.id}
                          className="cursor-pointer"
                          onClick={() => handleRowClick(error)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={bulk.isSelected(error.id)}
                              onCheckedChange={() => bulk.toggle(error.id)}
                            />
                          </TableCell>
                          <TableCell>{sourceBadge(error.source)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={calmVariant(error.severity === 'high' ? 'error' : 'ok')} className="text-[10px]">
                              {error.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] md:max-w-xs">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {impact === 'high' && (
                                <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                              )}
                              <span className="truncate text-sm">{error.message}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right hidden md:table-cell text-muted-foreground text-xs">{error.count}</TableCell>
                          <TableCell className="text-right text-muted-foreground text-xs whitespace-nowrap">
                            {format(new Date(error.last_seen_at), 'MMM d, h:mm a')}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <ErrorDetailDrawer
        error={selectedError}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdated={() => refetch()}
      />
    </div>
  );
}
