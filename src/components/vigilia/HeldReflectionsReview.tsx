/**
 * HeldReflectionsReview — Facility admin page for reviewing flagged reflections.
 *
 * These are reflections that failed quality validation. The facility admin
 * (not the platform operator) decides: approve, edit, or discard.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle, Check, X, Pencil, BookOpen } from 'lucide-react';
import { useHeldReflections, useApproveReflection, useDiscardReflection } from '@/hooks/useHeldReflections';

export default function HeldReflectionsReview() {
  const { data: held, isLoading } = useHeldReflections();
  const approve = useApproveReflection();
  const discard = useDiscardReflection();
  const [editDialog, setEditDialog] = useState<{ id: string; text: string } | null>(null);
  const [editText, setEditText] = useState('');

  const openEdit = (id: string, text: string) => {
    setEditDialog({ id, text });
    setEditText(text);
  };

  const handleApproveEdited = () => {
    if (!editDialog) return;
    approve.mutate({ id: editDialog.id, editedText: editText.trim() }, {
      onSuccess: () => setEditDialog(null),
    });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Loading...</p>;

  if ((held ?? []).length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Check className="h-10 w-10 text-green-500/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No held reflections. All clear.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Held Reflections
            <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">{(held ?? []).length} pending</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            These reflections were flagged by automated quality checks. Review and decide: approve, edit, or discard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(held ?? []).map((ref: any) => (
            <div key={ref.id} className="border border-yellow-200 bg-yellow-50/30 rounded p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {(ref.contacts as any)?.name ?? 'Unknown'} &middot; {ref.season} &middot;{' '}
                    {new Date(ref.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-yellow-100 text-yellow-800">Held</Badge>
              </div>

              <p className="text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                {ref.reflection_text}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => approve.mutate({ id: ref.id })}
                  disabled={approve.isPending}
                >
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => openEdit(ref.id, ref.reflection_text)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-red-700 border-red-300 hover:bg-red-50"
                  onClick={() => discard.mutate(ref.id)}
                  disabled={discard.isPending}
                >
                  <X className="h-3.5 w-3.5" /> Discard
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Edit Reflection
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[120px]"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          />
          <p className="text-xs text-muted-foreground">
            Edit the text to fix any issues, then approve. This will publish it to the family journal.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={handleApproveEdited} disabled={!editText.trim() || approve.isPending}>
              Approve &amp; Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
