/**
 * SafeEnvironmentCard — Track Safe Environment Training certifications for volunteers.
 *
 * Required by all dioceses for anyone ministering in Catholic facilities.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useVolunteers, type Volunteer } from '@/hooks/useVolunteers';

interface CertRecord {
  volunteerId: string;
  volunteerName: string;
  completedDate: string | null;
  expirationDate: string | null;
  status: 'current' | 'expiring_soon' | 'expired' | 'none';
}

function getCertStatus(completed: string | null, expiration: string | null): CertRecord['status'] {
  if (!completed) return 'none';
  if (!expiration) return 'current';
  const exp = new Date(expiration);
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 86400000);
  if (exp < now) return 'expired';
  if (exp < thirtyDays) return 'expiring_soon';
  return 'current';
}

const STATUS_STYLES: Record<CertRecord['status'], { label: string; className: string }> = {
  current: { label: 'Current', className: 'bg-green-100 text-green-800' },
  expiring_soon: { label: 'Expiring Soon', className: 'bg-yellow-100 text-yellow-800' },
  expired: { label: 'Expired', className: 'bg-red-100 text-red-800' },
  none: { label: 'Not on file', className: 'bg-muted text-muted-foreground' },
};

export default function SafeEnvironmentCard() {
  const { data: volunteers } = useVolunteers('active');
  const [editDialog, setEditDialog] = useState<{ volunteerId: string; name: string } | null>(null);
  const [completedDate, setCompletedDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // In production, cert dates would come from a volunteer_certifications table.
  // For now, we show the UI structure with the volunteer list.
  const certs: CertRecord[] = ((volunteers ?? []) as Volunteer[]).map((v) => ({
    volunteerId: v.id,
    volunteerName: `${v.first_name} ${v.last_name}`,
    completedDate: null, // Would come from DB
    expirationDate: null,
    status: 'none' as const,
  }));

  const expiredCount = certs.filter((c) => c.status === 'expired' || c.status === 'expiring_soon').length;
  const noneCount = certs.filter((c) => c.status === 'none').length;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Safe Environment Training
            </CardTitle>
            {(expiredCount > 0 || noneCount > 0) && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-xs gap-1">
                <AlertTriangle className="h-3 w-3" />
                {expiredCount + noneCount} need attention
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Required by all dioceses for ministry in Catholic facilities. Track completion dates and expirations.
          </p>
          {certs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No active volunteers.</p>
          ) : (
            <div className="space-y-2">
              {certs.map((cert) => {
                const style = STATUS_STYLES[cert.status];
                return (
                  <div key={cert.volunteerId} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{cert.volunteerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.completedDate
                          ? `Completed ${new Date(cert.completedDate).toLocaleDateString()}`
                          : 'No training on file'}
                        {cert.expirationDate && ` · Expires ${new Date(cert.expirationDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${style.className}`}>
                        {style.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => setEditDialog({ volunteerId: cert.volunteerId, name: cert.volunteerName })}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editDialog} onOpenChange={(open) => !open && setEditDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Certification — {editDialog?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Completed Date</Label>
              <Input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={() => { setEditDialog(null); setCompletedDate(''); setExpirationDate(''); }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
