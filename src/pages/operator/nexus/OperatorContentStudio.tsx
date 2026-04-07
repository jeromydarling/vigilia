/**
 * OperatorContentStudio — Unified Editorial Workspace.
 *
 * WHAT: RSS aggregation, NRI-voiced essay drafts, emerging narrative signals, and story curation — all in one.
 * WHERE: /operator/nexus/content (also serves /operator/nexus/narrative-studio)
 * WHY: Full editorial flow — fetch, generate, edit, publish — without leaving the studio.
 */
import { useState, useMemo } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Rss, RefreshCw, Loader2, Pen, Plus, Trash2, ExternalLink,
  BookOpen, CheckSquare, ChevronDown, ChevronUp, Save, CheckCircle,
  XCircle, RotateCcw, Eye, EyeOff, ArrowRight, Sun, Feather,
  Sparkles, Globe, Archive, Edit, ImageIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle as HelpIcon } from 'lucide-react';
import { aggregateNarrativeSignals, type NarrativeSignal } from '@/lib/nri/narrativeSignals';
import { triggerEssayImageGeneration } from '@/lib/essays/triggerEssayImageGeneration';

function HelpTip({ text }: { text: string }) {
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild>
      <HelpIcon className="h-3.5 w-3.5 text-muted-foreground inline ml-1" />
    </TooltipTrigger><TooltipContent><p className="max-w-xs text-xs">{text}</p></TooltipContent></Tooltip></TooltipProvider>
  );
}

/* ─── Inline Draft Editor (for operator_content_drafts) ─── */
function markdownToHtml(md: string): string {
  if (!md) return '';
  // If already HTML, return as-is
  if (md.trim().startsWith('<')) return md;
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^(?!<[hulo])(.*\S.*)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '');
}

function DraftEditor({ draft, onClose }: { draft: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(draft.title);
  const [body, setBody] = useState(markdownToHtml(draft.body || ''));
  const [preview, setPreview] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('operator_content_drafts')
        .update({ title, body, updated_at: new Date().toISOString() })
        .eq('id', draft.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Draft saved'); qc.invalidateQueries({ queryKey: ['essay-drafts'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
      const { error } = await supabase.from('operator_content_drafts')
        .update({ title, body, slug, status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', draft.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Essay published to library');
      qc.invalidateQueries({ queryKey: ['essay-drafts'] });
      // Fire-and-forget image generation
      if (!draft.hero_image_url) {
        triggerEssayImageGeneration(draft.id, title, draft.body?.replace(/[#*_]/g, '').slice(0, 300), 'operator_content_drafts');
      }
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('operator_content_drafts')
        .update({ status: 'draft', published_at: null, updated_at: new Date().toISOString() })
        .eq('id', draft.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Reverted to draft'); qc.invalidateQueries({ queryKey: ['essay-drafts'] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const dismissMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('operator_content_drafts')
        .update({ status: 'dismissed', updated_at: new Date().toISOString() })
        .eq('id', draft.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Draft dismissed'); qc.invalidateQueries({ queryKey: ['essay-drafts'] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!draft.source_item_ids?.length) throw new Error('No source items linked to this draft');
      const { data, error } = await supabase.functions.invoke('operator-rss-draft', {
        body: { draft_type: draft.draft_type, item_ids: draft.source_item_ids, category: draft.collection || undefined, regenerate_id: draft.id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success('Draft regenerated with NRI voice'); qc.invalidateQueries({ queryKey: ['essay-drafts'] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  const regenImageMutation = useMutation({
    mutationFn: async () => {
      await supabase.from('operator_content_drafts').update({ hero_image_url: null }).eq('id', draft.id);
      await triggerEssayImageGeneration(draft.id, title, body?.replace(/[#*_]/g, '').slice(0, 300), 'operator_content_drafts');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['essay-drafts'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isDirty = title !== draft.title || body !== (draft.body || '');
  const isPublished = draft.status === 'published';
  const anyPending = saveMutation.isPending || publishMutation.isPending || unpublishMutation.isPending || dismissMutation.isPending || regenerateMutation.isPending || regenImageMutation.isPending;

  return (
    <div className="border border-primary/20 rounded-lg bg-card p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
      <Input value={title} onChange={e => setTitle(e.target.value)} className="text-base font-semibold font-serif" placeholder="Essay title…" />
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={isPublished ? 'default' : 'secondary'} className="text-xs">{draft.status}</Badge>
        <Badge variant="outline" className="text-xs">{draft.draft_type}</Badge>
        {draft.voice_origin === 'nri' && <Badge variant="secondary" className="text-xs">NRI</Badge>}
        {draft.voice_calibrated && <Badge variant="default" className="text-xs bg-primary/80">Voice Calibrated</Badge>}
        {draft.is_interim_content && <Badge variant="outline" className="text-xs opacity-70">Interim</Badge>}
        {draft.collection && <Badge variant="outline" className="text-xs font-medium border-primary/40 text-primary">{draft.collection}</Badge>}
        {draft.reflection_cycle && <Badge variant="outline" className="text-xs">Cycle: {draft.reflection_cycle}</Badge>}
        {isPublished && draft.slug && (
          <a href={`/essays/${draft.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-1">
            <ExternalLink className="h-3 w-3" /> View on site
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setPreview(!preview)} className="gap-1.5 text-xs">
          {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {preview ? 'Edit' : 'Preview'}
        </Button>
        {draft.disclaimer && <p className="text-xs text-muted-foreground italic truncate flex-1">{draft.disclaimer}</p>}
      </div>
      {preview ? (
        <div className="prose prose-sm max-w-none dark:prose-invert p-4 rounded-md bg-muted/30 min-h-[200px] text-sm leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: sanitizeHtml(body || '<em>No content yet.</em>') }} />
      ) : (
        <RichTextEditor content={body} onChange={setBody} placeholder="Write or edit the essay body…" className="min-h-[300px] font-serif" editorClassName="min-h-[280px] text-sm leading-relaxed" />
      )}
      <Separator />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!isDirty || anyPending} className="gap-1.5">
          {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
        </Button>
        {!isPublished ? (
          <Button size="sm" variant="default" onClick={() => publishMutation.mutate()} disabled={anyPending} className="gap-1.5">
            {publishMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Publish
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => unpublishMutation.mutate()} disabled={anyPending} className="gap-1.5">
            {unpublishMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />} Unpublish
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => regenerateMutation.mutate()} disabled={anyPending || !draft.source_item_ids?.length} className="gap-1.5">
          {regenerateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Regenerate
        </Button>
        <Button size="sm" variant="ghost" onClick={() => regenImageMutation.mutate()} disabled={anyPending} className="gap-1.5">
          {regenImageMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {regenImageMutation.isPending ? 'Generating…' : 'Regenerate Image'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => dismissMutation.mutate()} disabled={anyPending} className="gap-1.5 text-muted-foreground">
          {dismissMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Dismiss
        </Button>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onClose} className="text-xs text-muted-foreground">Close</Button>
      </div>
    </div>
  );
}

/* ─── Strength badge variant map ─── */
const strengthColors: Record<string, string> = { strong: 'default', growing: 'secondary', emerging: 'outline' };

/* ─── Main Studio ─── */
export default function OperatorContentStudio() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('Catholic Ministry & Church Life');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [draftType, setDraftType] = useState<string>('essay');
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);
  const [draftFilter, setDraftFilter] = useState<string>('all');

  // --- Narrative Story state ---
  const [editingStory, setEditingStory] = useState<any | null>(null);
  const [draftFromSignal, setDraftFromSignal] = useState<NarrativeSignal | null>(null);

  // ═══ RSS Queries ═══
  const { data: sources, isLoading: srcLoading } = useQuery({
    queryKey: ['rss-sources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('operator_rss_sources').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['rss-items'],
    queryFn: async () => {
      // Only show articles from the current month — previous months are stale for essay prep
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data, error } = await supabase.from('operator_rss_items')
        .select('*, source:operator_rss_sources(name, category)')
        .gte('published_at', currentMonthStart)
        .order('published_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: drafts } = useQuery({
    queryKey: ['essay-drafts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('operator_content_drafts')
        .select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // ═══ Narrative Signal & Story Queries ═══
  const { data: signals, isLoading: loadingSignals, refetch: refetchSignals } = useQuery({
    queryKey: ['narrative-signals'],
    queryFn: aggregateNarrativeSignals,
    refetchInterval: 5 * 60_000,
  });

  const { data: stories, isLoading: loadingStories } = useQuery({
    queryKey: ['narrative-stories-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('narrative_stories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const storyDrafts = stories?.filter((s: any) => s.status === 'draft') || [];
  const storyPublished = stories?.filter((s: any) => s.status === 'published') || [];

  // ═══ Derived state ═══
  const filteredDrafts = useMemo(() => {
    if (!drafts) return [];
    if (draftFilter === 'all') return drafts;
    return drafts.filter((d: any) => d.status === draftFilter);
  }, [drafts, draftFilter]);

  const selectedCategoryCount = useMemo(() => {
    if (!items?.length) return 0;
    const categories = new Set<string>();
    for (const item of items) {
      if (selectedItems.includes(item.id)) categories.add(item.source?.category || 'Uncategorized');
    }
    return categories.size;
  }, [items, selectedItems]);

  const allItemIds = useMemo(() => (items || []).map((i: any) => i.id), [items]);
  const allSelected = allItemIds.length > 0 && selectedItems.length === allItemIds.length;

  const statusCounts = useMemo(() => {
    if (!drafts) return { all: 0, draft: 0, published: 0, dismissed: 0 };
    return {
      all: drafts.length,
      draft: drafts.filter((d: any) => d.status === 'draft').length,
      published: drafts.filter((d: any) => d.status === 'published').length,
      dismissed: drafts.filter((d: any) => d.status === 'dismissed').length,
    };
  }, [drafts]);

  // ═══ RSS Mutations ═══
  const addSourceMutation = useMutation({
    mutationFn: async () => {
      if (!newSourceName || !newSourceUrl) throw new Error('Name and URL required');
      const { data: { user: u } } = await supabase.auth.getUser();
      const { error } = await supabase.from('operator_rss_sources').insert({
        name: newSourceName, url: newSourceUrl, category: newSourceCategory, created_by: u!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Source added'); setNewSourceName(''); setNewSourceUrl(''); qc.invalidateQueries({ queryKey: ['rss-sources'] }); },
    onError: (e) => toast.error(e.message),
  });

  const fetchMutation = useMutation({
    mutationFn: async (sourceId: string | undefined) => {
      if (!sourceId) {
        const { error: delErr } = await supabase.from('operator_rss_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delErr) throw delErr;
      } else {
        const { error: delErr } = await supabase.from('operator_rss_items').delete().eq('source_id', sourceId);
        if (delErr) throw delErr;
      }
      const { data, error } = await supabase.functions.invoke('operator-rss-fetch', {
        body: sourceId ? { source_id: sourceId } : { fetch_all: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { toast.success(`Cleared & fetched from ${d?.sources_processed || 0} sources`); setSelectedItems([]); qc.invalidateQueries({ queryKey: ['rss-items'] }); },
    onError: (e) => toast.error(e.message),
  });

  const draftMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItems.length) throw new Error('Select at least one item');
      const byCategory: Record<string, string[]> = {};
      for (const item of (items || [])) {
        if (selectedItems.includes(item.id)) {
          const cat = item.source?.category || 'Uncategorized';
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(item.id);
        }
      }
      const results = [];
      for (const [category, catItemIds] of Object.entries(byCategory)) {
        const { data, error } = await supabase.functions.invoke('operator-rss-draft', { body: { draft_type: draftType, item_ids: catItemIds, category } });
        if (error) throw error;
        results.push({ category, ...data });
      }
      return results;
    },
    onSuccess: (results) => { toast.success(`${results.length} draft(s) generated`); setSelectedItems([]); qc.invalidateQueries({ queryKey: ['essay-drafts'] }); },
    onError: (e) => toast.error(e.message),
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('operator_rss_sources').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { toast.success('Source removed'); qc.invalidateQueries({ queryKey: ['rss-sources'] }); },
  });

  // ═══ Narrative Story Mutations ═══
  const createStoryDraft = useMutation({
    mutationFn: async (signal: NarrativeSignal) => {
      const { error } = await supabase.from('narrative_stories').insert([{
        slug: signal.suggested_slug, title: signal.pattern, role: signal.role,
        archetype: signal.archetype, pattern_source: signal.source_data as unknown as import('@/integrations/supabase/types').Json,
        summary: signal.summary, body: '', status: 'draft', created_by: user?.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Story draft created'); qc.invalidateQueries({ queryKey: ['narrative-stories-all'] }); setDraftFromSignal(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStory = useMutation({
    mutationFn: async (story: any) => {
      const { error } = await supabase.from('narrative_stories')
        .update({ title: story.title, slug: story.slug, role: story.role, archetype: story.archetype, summary: story.summary, body: story.body, status: story.status })
        .eq('id', story.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Story updated'); qc.invalidateQueries({ queryKey: ['narrative-stories-all'] }); setEditingStory(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteStory = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('narrative_stories').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { toast.success('Story deleted'); qc.invalidateQueries({ queryKey: ['narrative-stories-all'] }); },
  });

  // ═══ Helpers ═══
  const toggleItem = (id: string) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelectedItems(allSelected ? [] : allItemIds);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Pen className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground font-serif">Editorial Studio</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Curate industry insights, surface emerging narrative signals, and publish NRI-voiced stories.
        </p>
      </div>

      {/* Related Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/operator/nexus/library" className="group">
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Living Library</p>
                <p className="text-xs text-muted-foreground">Publish queue &amp; reflection cycles</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/operator/nexus/rhythm" className="group">
          <Card className="hover:border-primary/30 transition-colors h-full">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <Sun className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Daily Rhythm</p>
                <p className="text-xs text-muted-foreground">Editorial recommendations &amp; signals</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <Tabs defaultValue="items">
        <TabsList className="w-full overflow-x-auto justify-start gap-1 h-auto flex-nowrap">
          <TabsTrigger value="items">RSS Items</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="drafts">
            Essay Drafts
            {statusCounts.draft > 0 && <Badge variant="secondary" className="ml-1.5 text-xs h-5 px-1.5">{statusCounts.draft}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="emerging">
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Emerging Signals
            {signals && signals.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px]">{signals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="stories">
            <Feather className="h-3.5 w-3.5 mr-1" />
            Stories
            {storyDrafts.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px]">{storyDrafts.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* ═══ RSS Items Tab ═══ */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={draftType} onValueChange={setDraftType}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="briefing">Briefing</SelectItem>
                  <SelectItem value="reflection">Reflection</SelectItem>
                  <SelectItem value="library_entry">Library Entry</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full sm:w-auto" onClick={() => draftMutation.mutate()} disabled={!selectedItems.length || draftMutation.isPending}>
                {draftMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Pen className="h-4 w-4 mr-1" />}
                <span className="truncate">Generate Drafts (NRI)</span>
              </Button>
            </div>
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => fetchMutation.mutate(undefined)} disabled={fetchMutation.isPending}>
              {fetchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Clear &amp; Refetch All
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="gap-1.5">
              <CheckSquare className="h-4 w-4" /> {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedItems.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedItems.length} selected across {selectedCategoryCount} {selectedCategoryCount === 1 ? 'category' : 'categories'}
                {selectedCategoryCount > 1 && ' — one draft per category'}
              </span>
            )}
          </div>
          {itemsLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2 pr-4">
                {items?.map((item: any) => (
                  <Card key={item.id} className={`cursor-pointer transition-colors ${selectedItems.includes(item.id) ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} className="mt-1" />
                        <div className="flex-1 min-w-0" onClick={() => toggleItem(item.id)}>
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">{item.source?.category || 'news'}</Badge>
                            <span className="text-xs text-muted-foreground truncate">{item.source?.name}</span>
                            {item.published_at && <span className="text-xs text-muted-foreground">· {new Date(item.published_at).toLocaleDateString()}</span>}
                          </div>
                          {item.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>}
                        </div>
                        {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="shrink-0"><ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /></a>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* ═══ Sources Tab ═══ */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Add Source <HelpTip text="Add RSS feed URLs from nonprofit news, ministry publications, or sector outlets." /></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input placeholder="Source name" value={newSourceName} onChange={e => setNewSourceName(e.target.value)} />
                <Input placeholder="RSS URL" value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)} />
                <Select value={newSourceCategory} onValueChange={setNewSourceCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Catholic Ministry & Church Life">Catholic Ministry & Church Life</SelectItem>
                    <SelectItem value="Christian Nonprofit & Ministry Work">Christian Nonprofit & Ministry Work</SelectItem>
                    <SelectItem value="Nonprofit Sector">Nonprofit Sector</SelectItem>
                    <SelectItem value="Local Ministry & Community Action">Local Ministry & Community Action</SelectItem>
                    <SelectItem value="Volunteerism & Service Culture">Volunteerism & Service Culture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => addSourceMutation.mutate()} disabled={addSourceMutation.isPending}><Plus className="h-4 w-4 mr-1" /> Add Source</Button>
            </CardContent>
          </Card>
          {srcLoading ? <Skeleton className="h-32" /> : (
            <div className="space-y-2">
              {sources?.map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.url}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs truncate max-w-[140px]">{s.category}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => fetchMutation.mutate(s.id)} disabled={fetchMutation.isPending}><RefreshCw className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteSourceMutation.mutate(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ Essay Drafts Tab ═══ */}
        <TabsContent value="drafts" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', 'draft', 'published', 'dismissed'] as const).map(f => (
              <Button key={f} variant={draftFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setDraftFilter(f)} className="text-xs capitalize gap-1">
                {f} <span className="opacity-70">({statusCounts[f]})</span>
              </Button>
            ))}
          </div>
          {filteredDrafts.length ? (
            <div className="space-y-3">
              {filteredDrafts.map((d: any) => (
                <div key={d.id}>
                  {expandedDraftId === d.id ? (
                    <DraftEditor draft={d} onClose={() => setExpandedDraftId(null)} />
                  ) : (
                    <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setExpandedDraftId(d.id)}>
                      <CardContent className="py-4 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground mb-1 break-words font-serif">{d.title}</p>
                            <div className="flex items-center gap-1.5 flex-wrap mb-2">
                              <Badge variant={d.status === 'published' ? 'default' : d.status === 'dismissed' ? 'outline' : 'secondary'} className="text-xs">{d.status}</Badge>
                              {d.collection && <Badge variant="outline" className="text-xs font-medium">{d.collection}</Badge>}
                              {d.voice_origin === 'nri' && <Badge variant="secondary" className="text-xs">NRI</Badge>}
                              <Badge variant="outline" className="text-xs">{d.draft_type}</Badge>
                              {d.voice_calibrated && <Badge variant="default" className="text-xs bg-primary/80">Calibrated</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.body?.slice(0, 180)}</p>
                          </div>
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card><CardContent className="py-8 text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-serif italic">
                {draftFilter === 'all' ? 'No essay drafts yet. Select items and generate one.' : `No ${draftFilter} drafts.`}
              </p>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ Emerging Signals Tab (from Narrative Studio) ═══ */}
        <TabsContent value="emerging" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => refetchSignals()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh signals
            </Button>
          </div>
          {loadingSignals ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
          ) : signals && signals.length > 0 ? (
            <div className="space-y-3">
              {signals.map(signal => (
                <Card key={signal.id} className="rounded-xl border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-serif">{signal.pattern}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={strengthColors[signal.strength] as any} className="text-[10px]">{signal.strength}</Badge>
                          <Badge variant="outline" className="text-[10px]">{signal.role}</Badge>
                          <Badge variant="outline" className="text-[10px]">{signal.source_type}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setDraftFromSignal(signal)} className="shrink-0">
                        <Edit className="h-3.5 w-3.5 mr-1.5" /> Open Draft
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{signal.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-xl"><CardContent className="py-12 text-center">
              <Feather className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-serif italic">No emerging patterns right now. Stories surface as tenants work.</p>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ Stories Tab (Narrative Stories) ═══ */}
        <TabsContent value="stories" className="space-y-6">
          {/* Story Drafts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Drafts</h3>
            {loadingStories ? <Skeleton className="h-32 w-full rounded-xl" /> : storyDrafts.length > 0 ? (
              <div className="space-y-3">
                {storyDrafts.map((d: any) => (
                  <Card key={d.id} className="rounded-xl border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-serif">{d.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">/{d.slug} · {d.role || '—'} · Created {format(new Date(d.created_at), 'MMM d, yyyy')}</CardDescription>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => setEditingStory({ ...d })}><Edit className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => deleteStory.mutate(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{d.summary || 'No summary yet.'}</p></CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-xl"><CardContent className="py-8 text-center">
                <BookOpen className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No story drafts. Create one from an emerging signal.</p>
              </CardContent></Card>
            )}
          </div>

          <Separator />

          {/* Published Stories */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Published</h3>
            {loadingStories ? <Skeleton className="h-32 w-full rounded-xl" /> : storyPublished.length > 0 ? (
              <div className="space-y-3">
                {storyPublished.map((p: any) => (
                  <Card key={p.id} className="rounded-xl border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-serif">{p.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">/stories/{p.slug} · Published {format(new Date(p.updated_at), 'MMM d, yyyy')}</CardDescription>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button size="sm" variant="outline" asChild><a href={`/stories/${p.slug}`} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5 mr-1" /> View</a></Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingStory({ ...p })}><Edit className="h-3.5 w-3.5 mr-1" /> Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStory.mutate({ ...p, status: 'archived' })}><Archive className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground">{p.summary}</p></CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-xl"><CardContent className="py-8 text-center">
                <Globe className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No published stories yet.</p>
              </CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══ Create Story Draft Dialog ═══ */}
      <Dialog open={!!draftFromSignal} onOpenChange={() => setDraftFromSignal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Create Story Draft</DialogTitle>
            <DialogDescription>This signal will become a draft. You can edit it before publishing.</DialogDescription>
          </DialogHeader>
          {draftFromSignal && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-sm font-medium">{draftFromSignal.pattern}</p>
                <p className="text-xs text-muted-foreground mt-1">{draftFromSignal.summary}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">{draftFromSignal.role}</Badge>
                <Badge variant="outline" className="text-xs">{draftFromSignal.source_type}</Badge>
                <Badge variant={strengthColors[draftFromSignal.strength] as any} className="text-xs">{draftFromSignal.strength}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraftFromSignal(null)}>Cancel</Button>
            <Button onClick={() => draftFromSignal && createStoryDraft.mutate(draftFromSignal)} disabled={createStoryDraft.isPending}>
              {createStoryDraft.isPending ? 'Creating…' : 'Create Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Edit Story Dialog ═══ */}
      <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Story</DialogTitle>
            <DialogDescription>Edit the story content and publish when ready.</DialogDescription>
          </DialogHeader>
          {editingStory && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Title</Label><Input value={editingStory.title} onChange={e => setEditingStory({ ...editingStory, title: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editingStory.slug} onChange={e => setEditingStory({ ...editingStory, slug: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Role</Label><Input value={editingStory.role || ''} onChange={e => setEditingStory({ ...editingStory, role: e.target.value })} placeholder="shepherd, companion, visitor…" /></div>
                <div><Label>Archetype</Label><Input value={editingStory.archetype || ''} onChange={e => setEditingStory({ ...editingStory, archetype: e.target.value })} placeholder="church, digital_inclusion…" /></div>
              </div>
              <div><Label>Summary</Label><Textarea value={editingStory.summary || ''} onChange={e => setEditingStory({ ...editingStory, summary: e.target.value })} rows={2} placeholder="A brief summary for SEO…" /></div>
              <div><Label>Body</Label><Textarea value={editingStory.body || ''} onChange={e => setEditingStory({ ...editingStory, body: e.target.value })} rows={12} placeholder="Write the narrative story here…" className="font-serif" /></div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingStory?.status === 'draft' && (
              <Button onClick={() => updateStory.mutate({ ...editingStory, status: 'published' })} disabled={updateStory.isPending}>
                <Globe className="h-3.5 w-3.5 mr-1.5" /> Publish
              </Button>
            )}
            {editingStory?.status === 'published' && (
              <Button variant="outline" onClick={() => updateStory.mutate({ ...editingStory, status: 'draft' })} disabled={updateStory.isPending}>Revert to Draft</Button>
            )}
            <Button onClick={() => updateStory.mutate(editingStory)} disabled={updateStory.isPending}>
              {updateStory.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setEditingStory(null)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
