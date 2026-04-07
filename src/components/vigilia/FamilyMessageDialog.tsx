/**
 * FamilyMessageDialog — Send a tender message to the family journal during Vigil Mode.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSendFamilyMessage } from '@/hooks/useVigilMode';
import { Heart } from 'lucide-react';

interface FamilyMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentContactId: string;
  residentName: string;
}

export default function FamilyMessageDialog({
  open, onOpenChange, residentContactId, residentName,
}: FamilyMessageDialogProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useSendFamilyMessage();

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(
      { residentContactId, message: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Heart className="h-4 w-4 text-amber-600" />
            A note for the family
          </DialogTitle>
          <DialogDescription style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            This message will appear in {residentName}'s family journal.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 500))}
          placeholder="Write something the family would want to hold onto..."
          className="min-h-[120px] resize-none"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{message.length}/500</span>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}>
            {sendMessage.isPending ? 'Sending...' : 'Send to Family'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
