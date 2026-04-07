/**
 * DigestSettingsCard — Manage family digest email preferences per resident.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Eye } from 'lucide-react';
import { useFamilyDigestRecipients, useUpdateDigestPreference } from '@/hooks/useFamilyDigest';
import FamilyDigestPreview from './FamilyDigestPreview';

interface DigestSettingsCardProps {
  residentContactId: string;
  residentName: string;
}

export default function DigestSettingsCard({ residentContactId, residentName }: DigestSettingsCardProps) {
  const { data: recipients } = useFamilyDigestRecipients(residentContactId);
  const updatePref = useUpdateDigestPreference();
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleToggle = (memberId: string, enabled: boolean) => {
    updatePref.mutate({
      memberId,
      frequency: enabled ? 'weekly' : 'as_needed',
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Weekly Family Digest
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(recipients ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No family members on file. Add household members to enable digests.</p>
          )}
          {(recipients ?? []).map((member: any) => (
            <div key={member.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  {member.relationship ?? 'Family'}
                  {member.is_primary_contact && (
                    <Badge variant="outline" className="ml-2 text-[10px]">Primary</Badge>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {member.contact_frequency_preference === 'weekly' ? 'Weekly' : 'Off'}
                </span>
                <Switch
                  checked={member.contact_frequency_preference === 'weekly'}
                  onCheckedChange={(checked) => handleToggle(member.id, checked)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Digest Preview</DialogTitle>
          </DialogHeader>
          <FamilyDigestPreview residentContactId={residentContactId} residentName={residentName} />
        </DialogContent>
      </Dialog>
    </>
  );
}
