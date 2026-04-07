/**
 * StudioLibraryTab — Living Library essay editor inside Gardener Studio.
 *
 * WHAT: Full essay CRUD with draft-first workflow, versioning, publish/unpublish, AI assist, audit trail.
 * WHERE: Studio → Library tab
 * WHY: Gardener needs to edit & publish essays without using Lovable credits.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { triggerEssayImageGeneration } from '@/lib/essays/triggerEssayImageGeneration';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { Plus, Save, Eye, EyeOff, CheckCircle, Loader2, RotateCcw, Sparkles, History, Pen, ImageIcon } from 'lucide-react';
import StudioAiAssistPanel from './StudioAiAssistPanel';

interface Essay {
  id: string;
  title: string;
  slug: string;
  content_markdown: string | null;
  excerpt: string | null;
  sector: string;
  status: string;
  month_key: string;
  voice_profile: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function logAudit(userId: string, action: string, entityType: string, entityId: string, entityName?: string, diff?: any) {
  return supabase.from('gardener_audit_log').insert({
    actor_id: userId,
    action_type: action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    diff_json: diff || null,
  });
}

export default function StudioLibraryTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editingEssay, setEditingEssay] = useState<Essay | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { data: essays, isLoading } = useQuery({
    queryKey: ['studio-library-essays'],
    queryFn: async () => {
      const { data, error } = await supabase.from('library_essays')
        .select('*').order('updated_at', { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []) as Essay[];
    },
  });

  const filtered = essays?.filter(e => filter === 'all' || e.status === filter) || [];

  // Create new essay
  const createMutation = useMutation({
    mutationFn: async (form: { title: string; sector: string }) => {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
      const monthKey = new Date().toISOString().slice(0, 7);
      const { data, error } = await supabase.from('library_essays').insert({
        title: form.title, slug, sector: form.sector, month_key: monthKey,
        status: 'draft', content_markdown: '', generated_by: 'gardener',
      }).select().single();
      if (error) throw error;
      await logAudit(user!.id, 'create', 'library_essay', data.id, form.title);
      return data as Essay;
    },
    onSuccess: (data) => {
      toast.success('Essay draft created');
      qc.invalidateQueries({ queryKey: ['studio-library-essays'] });
      setShowCreate(false);
      setEditingEssay(data);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Save essay
  const saveMutation = useMutation({
    mutationFn: async (essay: Partial<Essay> & { id: string }) => {
      const { error } = await supabase.from('library_essays')
        .update({ ...essay, updated_at: new Date().toISOString() })
        .eq('id', essay.id);
      if (error) throw error;
      await logAudit(user!.id, 'update', 'library_essay', essay.id, essay.title);
    },
    onSuccess: () => {
      toast.success('Essay saved');
      qc.invalidateQueries({ queryKey: ['studio-library-essays'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Publish / Unpublish
  const publishMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'publish' | 'unpublish' }) => {
      if (action === 'publish') {
        await supabase.from('library_essays').update({
          status: 'published', published_at: new Date().toISOString(),
          meta_robots: 'index,follow', updated_at: new Date().toISOString(),
        }).eq('id', id);
        await logAudit(user!.id, 'publish', 'library_essay', id);
        // Fire-and-forget image generation
        const { data: essayData } = await supabase.from('library_essays').select('title, excerpt, hero_image_url').eq('id', id).single();
        if (essayData && !essayData.hero_image_url) {
          triggerEssayImageGeneration(id, essayData.title, essayData.excerpt, 'library_essays');
        }
      } else {
        await supabase.from('library_essays').update({
          status: 'draft', published_at: null, meta_robots: 'noindex,nofollow',
          updated_at: new Date().toISOString(),
        }).eq('id', id);
        await logAudit(user!.id, 'unpublish', 'library_essay', id);
      }
    },
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['studio-library-essays'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Regenerate essay image
  const regenImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: essayData } = await supabase.from('library_essays').select('title, excerpt').eq('id', id).single();
      if (!essayData) throw new Error('Essay not found');
      // Clear existing image first so it regenerates
      await supabase.from('library_essays').update({ hero_image_url: null }).eq('id', id);
      await triggerEssayImageGeneration(id, essayData.title, essayData.excerpt, 'library_essays');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-library-essays'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="ready_for_review">Ready</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} essays</span>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Essay
        </Button>
      </div>

      {/* Create Dialog */}
      <CreateEssayDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={(form) => createMutation.mutate(form)} isPending={createMutation.isPending} />

      {/* Essay List */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground font-serif italic">
          No essays yet. Begin the first reflection.
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(essay => (
            <Card key={essay.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setEditingEssay(essay)}>
              <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium font-serif truncate">{essay.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={essay.status === 'published' ? 'default' : 'secondary'} className="text-xs">{essay.status}</Badge>
                    <Badge variant="outline" className="text-xs">{essay.sector}</Badge>
                    <span className="text-xs text-muted-foreground">{essay.month_key}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{format(new Date(essay.updated_at), 'MMM d')}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      {editingEssay && (
        <EssayEditorDialog
          essay={editingEssay}
          onClose={() => { setEditingEssay(null); setShowAiPanel(false); }}
          onSave={(updates) => saveMutation.mutate({ id: editingEssay.id, ...updates })}
          onPublish={(action) => publishMutation.mutate({ id: editingEssay.id, action })}
          onRegenerateImage={() => regenImageMutation.mutate(editingEssay.id)}
          isSaving={saveMutation.isPending}
          isPublishing={publishMutation.isPending}
          isRegenerating={regenImageMutation.isPending}
          showAiPanel={showAiPanel}
          setShowAiPanel={setShowAiPanel}
        />
      )}
    </div>
  );
}

function CreateEssayDialog({ open, onClose, onCreate, isPending }: {
  open: boolean; onClose: () => void;
  onCreate: (form: { title: string; sector: string }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('general');

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Begin a New Essay</DialogTitle>
          <DialogDescription>This creates a private draft. Only you will see it until you publish.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="A reflection on…" className="font-serif" />
          </div>
          <div>
            <Label className="text-xs">Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="nonprofit">Nonprofit</SelectItem>
                <SelectItem value="catholic">Catholic</SelectItem>
                <SelectItem value="christian">Christian</SelectItem>
                <SelectItem value="ministry">Ministry</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onCreate({ title, sector })} disabled={!title.trim() || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Create Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EssayEditorDialog({ essay, onClose, onSave, onPublish, onRegenerateImage, isSaving, isPublishing, isRegenerating, showAiPanel, setShowAiPanel }: {
  essay: Essay;
  onClose: () => void;
  onSave: (updates: Partial<Essay>) => void;
  onPublish: (action: 'publish' | 'unpublish') => void;
  onRegenerateImage: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  isRegenerating: boolean;
  showAiPanel: boolean;
  setShowAiPanel: (v: boolean) => void;
}) {
  const [title, setTitle] = useState(essay.title);
  const [content, setContent] = useState(essay.content_markdown || '');
  const [excerpt, setExcerpt] = useState(essay.excerpt || '');
  const [seoTitle, setSeoTitle] = useState(essay.seo_title || '');
  const [seoDesc, setSeoDesc] = useState(essay.seo_description || '');
  const [tags, setTags] = useState(essay.tags?.join(', ') || '');
  const [showSeo, setShowSeo] = useState(false);

  const isDirty = title !== essay.title || content !== (essay.content_markdown || '') ||
    excerpt !== (essay.excerpt || '') || seoTitle !== (essay.seo_title || '') ||
    seoDesc !== (essay.seo_description || '');
  const isPublished = essay.status === 'published';

  const handleSave = () => {
    const updates: Partial<Essay> = {
      title, content_markdown: content, excerpt,
      seo_title: seoTitle || null, seo_description: seoDesc || null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
    };
    // Regenerate slug when title changes
    if (title !== essay.title) {
      updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    }
    onSave(updates);
  };

  const handleAiAccept = (patch: { content?: string; excerpt?: string; seo_title?: string; seo_description?: string }) => {
    if (patch.content) setContent(patch.content);
    if (patch.excerpt) setExcerpt(patch.excerpt);
    if (patch.seo_title) setSeoTitle(patch.seo_title);
    if (patch.seo_description) setSeoDesc(patch.seo_description);
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Pen className="h-4 w-4 text-primary" />
            Edit Essay
          </DialogTitle>
        </DialogHeader>

        <div className={`grid gap-4 ${showAiPanel ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          <div className={showAiPanel ? 'lg:col-span-2' : ''}>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="font-serif text-base" />
              </div>

              <div>
                <Label className="text-xs">Body (Markdown)</Label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Write your reflection…"
                />
              </div>

              <div>
                <Label className="text-xs">Excerpt</Label>
                <Textarea
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  className="min-h-[60px] text-sm"
                  placeholder="A brief summary for previews…"
                />
              </div>

              <div>
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="community, reflection, parish" className="text-sm" />
              </div>

              {/* SEO Section */}
              <div>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShowSeo(!showSeo)}>
                  {showSeo ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showSeo ? 'Hide' : 'Show'} SEO Fields
                </Button>
                {showSeo && (
                  <div className="space-y-2 mt-2 p-3 rounded-md bg-muted/30">
                    <div>
                      <Label className="text-xs">SEO Title</Label>
                      <Input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">SEO Description</Label>
                      <Textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="min-h-[50px] text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Badge variant={isPublished ? 'default' : 'secondary'} className="text-xs">{essay.status}</Badge>
                <Badge variant="outline" className="text-xs">{essay.sector}</Badge>
                <Badge variant="outline" className="text-xs">{essay.voice_profile}</Badge>
                {essay.published_at && <span className="text-xs text-muted-foreground">Published {format(new Date(essay.published_at), 'MMM d, yyyy')}</span>}
              </div>
            </div>
          </div>

          {/* AI Assist Panel */}
          {showAiPanel && (
            <div className="lg:col-span-1">
              <StudioAiAssistPanel
                entityType="library_essay"
                entityId={essay.id}
                currentContent={content}
                currentExcerpt={excerpt}
                onAcceptPatch={handleAiAccept}
              />
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAiPanel(!showAiPanel)}>
            <Sparkles className="h-3.5 w-3.5" /> {showAiPanel ? 'Hide' : 'Show'} AI Assist
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRegenerateImage} disabled={isRegenerating}>
            {isRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            {isRegenerating ? 'Generating…' : 'Regenerate Image'}
          </Button>
          <div className="flex-1" />
          <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving} className="gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
          </Button>
          {!isPublished ? (
            <Button size="sm" variant="default" onClick={() => onPublish('publish')} disabled={isPublishing} className="gap-1.5">
              {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Publish
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onPublish('unpublish')} disabled={isPublishing} className="gap-1.5">
              <EyeOff className="h-3.5 w-3.5" /> Unpublish
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
