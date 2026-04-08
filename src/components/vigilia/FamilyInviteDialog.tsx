/**
 * FamilyInviteDialog — Send a magic link invitation to a family member.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFamilyInvite } from '@/hooks/useFamilyInvite';
import { Mail } from 'lucide-react';

interface FamilyInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residentContactId: string;
  residentName: string;
}

export default function FamilyInviteDialog({
  open, onOpenChange, residentContactId, residentName,
}: FamilyInviteDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const invite = useFamilyInvite();

  const handleSend = () => {
    if (!email.trim() || !name.trim()) return;
    invite.mutate(
      { email: email.trim(), name: name.trim(), residentContactId, relationship: relationship.trim() },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setRelationship('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invite to {residentName}'s Journal
          </DialogTitle>
          <DialogDescription>
            They'll receive a magic link — no password needed. One tap to read the journal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Sarah Williams" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="sarah@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input id="relationship" placeholder="Daughter, Son, Spouse..." value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={!email.trim() || !name.trim() || invite.isPending}>
            {invite.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
