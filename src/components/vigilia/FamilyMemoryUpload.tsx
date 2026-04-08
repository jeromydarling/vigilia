/**
 * FamilyMemoryUpload — Let families contribute photos, stories, and greetings to the journal.
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, BookOpen, Heart, Image } from 'lucide-react';
import { useFamilyMemories, useAddFamilyMemory, type FamilyMemory } from '@/hooks/useFamilyMemories';

interface FamilyMemoryUploadProps {
  residentContactId: string;
  residentName: string;
}

export default function FamilyMemoryUpload({ residentContactId, residentName }: FamilyMemoryUploadProps) {
  const { data: memories } = useFamilyMemories(residentContactId);
  const addMemory = useAddFamilyMemory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [memoryType, setMemoryType] = useState<'photo' | 'story' | 'greeting'>('story');
  const [text, setText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    addMemory.mutate({
      residentContactId,
      memoryType,
      contentText: text.trim() || undefined,
      photoFile: photoFile ?? undefined,
    }, {
      onSuccess: () => {
        setText('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setDialogOpen(false);
      },
    });
  };

  const typeLabels = {
    photo: { icon: Camera, label: 'Share a photo', desc: 'A photo the staff can reference during visits.' },
    story: { icon: BookOpen, label: 'Share a memory', desc: 'A memory that helps them know who Mom really is.' },
    greeting: { icon: Heart, label: 'Send a greeting', desc: 'A note that gets read to them and added to the journal.' },
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Family Contributions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Share photos, memories, and greetings. These become part of {residentName}'s living journal.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(['photo', 'story', 'greeting'] as const).map((type) => {
              const { icon: Icon, label } = typeLabels[type];
              return (
                <Button
                  key={type}
                  variant="outline"
                  className="flex flex-col items-center gap-1.5 h-auto py-3 text-xs"
                  onClick={() => { setMemoryType(type); setDialogOpen(true); }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              );
            })}
          </div>

          {/* Recent contributions */}
          {(memories ?? []).length > 0 && (
            <div className="space-y-3 pt-3 border-t border-border/50">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Recent</p>
              {(memories ?? []).slice(0, 5).map((m: FamilyMemory) => (
                <div key={m.id} className="flex gap-3 py-2 border-b border-border/30 last:border-0">
                  {m.photo_url && (
                    <img src={m.photo_url} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
                  )}
                  {!m.photo_url && (
                    <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center shrink-0">
                      {m.memory_type === 'story' ? <BookOpen className="h-4 w-4 text-muted-foreground" /> :
                       m.memory_type === 'greeting' ? <Heart className="h-4 w-4 text-muted-foreground" /> :
                       <Image className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    {m.content_text && (
                      <p className="text-sm text-foreground leading-relaxed line-clamp-2" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
                        {m.content_text}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {m.contributor_name ?? 'Family'} &middot; {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => { const { icon: Icon, label } = typeLabels[memoryType]; return <><Icon className="h-4 w-4" />{label}</>; })()}
            </DialogTitle>
            <DialogDescription>{typeLabels[memoryType].desc}</DialogDescription>
          </DialogHeader>

          {memoryType === 'photo' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="w-full rounded max-h-48 object-cover" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full h-24" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-5 w-5 mr-2" />
                  Choose photo
                </Button>
              )}
            </div>
          )}

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            placeholder={
              memoryType === 'photo' ? 'Add a caption (optional)...' :
              memoryType === 'story' ? 'Share a memory the staff would love to know...' :
              'Write a note for them...'
            }
            className="min-h-[100px] resize-none"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          />
          <p className="text-xs text-muted-foreground text-right">{text.length}/500</p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={(!text.trim() && !photoFile) || addMemory.isPending}
            >
              {addMemory.isPending ? 'Adding...' : 'Add to Journal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
