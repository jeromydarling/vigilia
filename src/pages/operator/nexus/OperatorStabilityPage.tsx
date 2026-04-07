/**
 * OperatorStabilityPage — Recent System Friction + Self-Healing Prompts.
 *
 * WHAT: Surfaces runtime errors and generates copy-paste repair prompts.
 * WHERE: /operator/nexus/stability
 * WHY: Operators need calm visibility into system friction without alarmist dashboards.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
// No HelpTooltip import needed — inline description used instead
import { buildLovableFixPrompt } from '@/lib/buildLovableFixPrompt';

interface SystemErrorEvent {
  id: string;
  tenant_id: string | null;
  route: string;
  component: string;
  error_type: string;
  stack_excerpt: string | null;
  user_role: string | null;
  created_at: string;
}

function buildSystemErrorPrompt(event: SystemErrorEvent): string {
  const sections = [
    `# SYSTEM FIX: ${event.error_type} — ${event.route || 'unknown route'}`,
    '',
    '## CONTEXT',
    `A runtime error was captured on route \`${event.route}\`.`,
    `Component: \`${event.component || 'unknown'}\``,
    `Error type: ${event.error_type}`,
    `User role: ${event.user_role || 'unknown'}`,
    `Occurred: ${format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}`,
    '',
    '## STACK EXCERPT',
    event.stack_excerpt
      ? `\`\`\`\n${event.stack_excerpt.slice(0, 800)}\n\`\`\``
      : '(no stack trace captured)',
    '',
    '## LIKELY FILES',
    inferFilesFromRoute(event.route).map(f => `- \`${f}\``).join('\n') || '- Check stack trace above',
    '',
    '## REQUIRED FIX',
    '- [ ] Stabilize the failing component',
    '- [ ] Add null guards for data that may not be loaded',
    '- [ ] Maintain RLS policies — no security regressions',
    '- [ ] Mobile-first — layouts work at 320px',
    '- [ ] Use Calm Mode language — no urgency styling',
    '',
    '## DONE WHEN',
    '- [ ] Error no longer appears in System Friction',
    '- [ ] No tenant data leakage',
    '- [ ] Component renders without crash',
  ];
  return sections.join('\n');
}

function inferFilesFromRoute(route: string): string[] {
  const files: string[] = [];
  if (route.includes('/operator')) files.push('src/pages/operator/');
  if (route.includes('/admin')) files.push('src/pages/admin/');
  if (route.includes('/onboarding')) files.push('src/pages/Onboarding.tsx');
  if (route.includes('/settings')) files.push('src/pages/Settings.tsx');
  if (route.includes('/dashboard')) files.push('src/pages/DashboardPage.tsx');
  if (route.includes('/events')) files.push('src/pages/EventsPage.tsx');
  return files;
}

export default function OperatorStabilityPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: errors, isLoading } = useQuery({
    queryKey: ['system-error-events-stability'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_error_events')
        .select('*')
        .gte('created_at', weekAgo)
        .order('created_at', { ascending: false })
        .limit(50);
      return (data as SystemErrorEvent[]) ?? [];
    },
  });

  const handleCopyPrompt = (event: SystemErrorEvent) => {
    const prompt = buildSystemErrorPrompt(event);
    navigator.clipboard.writeText(prompt);
    toast.success('Gentle correction prompt copied');
  };

  const handleCopyAll = () => {
    if (!errors?.length) return;
    const header = `# CROS™ System Stability Repair Pack\n\nThis pack addresses ${errors.length} recent friction event(s).\n\n---\n\n`;
    const body = errors.slice(0, 10).map((e, i) =>
      `## Issue ${i + 1}\n\n${buildSystemErrorPrompt(e)}`
    ).join('\n\n---\n\n');
    navigator.clipboard.writeText(header + body);
    toast.success('Bulk repair prompts copied');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">System Friction</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Something unexpected happened — here are this week's gentle observations.
          </p>
        </div>
        {errors && errors.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy All Prompts
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : errors && errors.length > 0 ? (
        <div className="space-y-3">
          {errors.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{event.error_type}</Badge>
                      {event.user_role && (
                        <Badge variant="secondary" className="text-xs">{event.user_role}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM d · h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.route || 'Unknown route'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {event.component || 'Unknown component'}
                      {event.stack_excerpt && ` — ${event.stack_excerpt.slice(0, 80)}…`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPrompt(event)}
                    className="shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy Fix
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No system friction detected this week. Everything is steady.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
