/**
 * SacramentalLog — Pastoral care tracking for a resident.
 * Shows history of sacraments received and allows adding new records.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cross, Plus } from 'lucide-react';
import { useSacramentalRecords, useCreateSacramentalRecord } from '@/hooks/usePastoralCare';
import type { SacramentType } from '@/types/vigilia';

const SACRAMENT_LABELS: Record<SacramentType, string> = {
  communion: 'Holy Communion',
  confession: 'Confession',
  anointing_of_sick: 'Anointing of the Sick',
  last_rites: 'Last Rites',
  rosary: 'Rosary',
  blessing: 'Blessing',
  other: 'Other',
};

interface SacramentalLogProps {
  residentContactId: string;
}

export function SacramentalLog({ residentContactId }: SacramentalLogProps) {
  const { data: records, isLoading } = useSacramentalRecords(residentContactId);
  const createRecord = useCreateSacramentalRecord();
  const [showForm, setShowForm] = useState(false);
  const [sacramentType, setSacramentType] = useState<SacramentType>('communion');
  const [administeredBy, setAdministeredBy] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    createRecord.mutate({
      resident_contact_id: residentContactId,
      sacrament_type: sacramentType,
      administered_by: administeredBy || undefined,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setSacramentType('communion');
        setAdministeredBy('');
        setNotes('');
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cross className="h-4 w-4 text-muted-foreground" />
            Pastoral Care
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Record
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="space-y-3 mb-4 p-4 rounded-lg border border-border bg-muted/50">
            <div>
              <Label>Sacrament</Label>
              <Select value={sacramentType} onValueChange={(v) => setSacramentType(v as SacramentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SACRAMENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Administered by</Label>
              <Input
                value={administeredBy}
                onChange={(e) => setAdministeredBy(e.target.value)}
                placeholder="Fr. John, Deacon Smith, etc."
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={createRecord.isPending}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && (records ?? []).length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">No sacramental records yet.</p>
        )}
        {!isLoading && (records ?? []).length > 0 && (
          <div className="space-y-2">
            {(records ?? []).slice(0, 10).map((record: any) => (
              <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <Badge variant="outline" className="mr-2">
                    {SACRAMENT_LABELS[record.sacrament_type as SacramentType] ?? record.sacrament_type}
                  </Badge>
                  {record.administered_by && (
                    <span className="text-xs text-muted-foreground">by {record.administered_by}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(record.administered_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
