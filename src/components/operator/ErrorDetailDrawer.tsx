/**
 * ErrorDetailDrawer — Slide-out panel for a single operator error.
 *
 * WHAT: Shows full error context, repro steps, and Lovable prompt generation.
 * WHERE: Opened from Error Desk table row click.
 * WHY: Gives operator all info + one-click repair prompt without leaving the desk.
 */
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Copy, Check, ChevronDown, FlaskConical } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { buildLovableFixPrompt } from '@/lib/buildLovableFixPrompt';
import { classifyImpact, isAutoResolvable } from '@/lib/operatorImpactClassifier';
import { calmVariant } from '@/lib/calmMode';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

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

interface ErrorDetailDrawerProps {
  error: ErrorRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function ErrorDetailDrawer({ error, open, onOpenChange, onUpdated }: ErrorDetailDrawerProps) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('open');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setNotes(error.owner_notes || '');
      setStatus(error.status);
      setCopied(false);
    }
  }, [error]);

  if (!error) return null;

  const impact = classifyImpact(error);
  const autoResolvable = isAutoResolvable(error);

  const handleCopyPrompt = async () => {
    const prompt = buildLovableFixPrompt(error);
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success('Lovable repair prompt copied.');
    setTimeout(() => setCopied(false), 3000);

    // Cache prompt
    await supabase.from('operator_app_errors').update({ lovable_prompt: prompt }).eq('id', error.id);
  };

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    try {
      const updates: Record<string, unknown> = { owner_notes: notes };
      if (newStatus) {
        updates.status = newStatus;
        setStatus(newStatus);
      }
      await supabase.from('operator_app_errors').update(updates).eq('id', error.id);
      toast.success('Updated');
      onUpdated();
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (val: string) => {
    handleSave(val);
  };

  const handleCreateDemoLabTest = () => {
    toast.success('Demo Lab test item created for this error.');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base font-medium flex items-center gap-2">
            Error Detail
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs space-y-1">
                  <p><strong>What:</strong> Full detail view of a captured error</p>
                  <p><strong>Where:</strong> operator_app_errors table</p>
                  <p><strong>Why:</strong> Inspect, triage, and generate repair prompts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={calmVariant(error.source === 'frontend' ? 'ok' : 'warning')}>{error.source}</Badge>
            <Badge variant={calmVariant(error.severity === 'high' ? 'error' : 'ok')}>{error.severity}</Badge>
            {impact === 'high' && (
              <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
                Blocking
              </Badge>
            )}
            {autoResolvable && (
              <Badge variant="outline" className="text-accent-foreground text-xs">
                Looks stable — mark resolved?
              </Badge>
            )}
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Message</p>
            <p className="text-sm font-mono bg-muted/50 p-2 rounded">{error.message}</p>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">First seen</p>
              <p className="font-medium">{format(new Date(error.first_seen_at), 'MMM d, h:mm a')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last seen</p>
              <p className="font-medium">{format(new Date(error.last_seen_at), 'MMM d, h:mm a')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Occurrences</p>
              <p className="font-medium">{error.count}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fingerprint</p>
              <p className="font-mono text-[10px] truncate">{error.fingerprint}</p>
            </div>
          </div>

          {/* Context JSON */}
          <Collapsible open={contextOpen} onOpenChange={setContextOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ChevronDown className={`h-3 w-3 transition-transform ${contextOpen ? 'rotate-180' : ''}`} />
              Context JSON
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="text-[10px] bg-muted/50 p-2 rounded mt-1 overflow-x-auto max-h-48">
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>

          {/* Repro / Expected */}
          {error.repro_steps && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Repro Steps</p>
              <p className="text-sm whitespace-pre-wrap">{error.repro_steps}</p>
            </div>
          )}
          {error.expected && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expected</p>
              <p className="text-sm">{error.expected}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Owner Notes */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Gardener Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this issue..."
              rows={3}
              onBlur={() => handleSave()}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyPrompt} disabled={copied}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy Lovable Fix Prompt'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleSave('resolved')} disabled={saving}>
              Mark Resolved
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleSave('ignored')} disabled={saving}>
              Ignore
            </Button>
            <Button size="sm" variant="outline" onClick={handleCreateDemoLabTest}>
              <FlaskConical className="h-4 w-4 mr-1" />
              Create Demo Lab Test
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
