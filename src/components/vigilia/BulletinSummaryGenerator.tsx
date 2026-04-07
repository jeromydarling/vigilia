/**
 * BulletinSummaryGenerator — Generate formatted text for parish bulletins.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileText } from 'lucide-react';
import { useParishVolunteerStats } from '@/hooks/useParishVolunteers';
import { useTenant } from '@/contexts/TenantContext';

export default function BulletinSummaryGenerator() {
  const { tenantName } = useTenant();
  const { data: stats } = useParishVolunteerStats();
  const [copied, setCopied] = useState(false);

  const monthName = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const bulletinText = stats
    ? `Our volunteers made ${stats.visitsThisMonth} visits to ${tenantName ?? 'our care facility'} this month, bringing companionship and communion to ${stats.uniqueResidentsThisMonth} residents. ${stats.activeVolunteers} active volunteers from ${stats.connectedParishes} connected ${stats.connectedParishes === 1 ? 'parish' : 'parishes'} served faithfully through prayerful presence and the Eucharist. Thank you for your ministry of attention.`
    : 'Loading...';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bulletinText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Parish Bulletin Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{monthName}</p>
        <div className="bg-muted/30 p-4 rounded text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {bulletinText}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy to clipboard'}
        </Button>
      </CardContent>
    </Card>
  );
}
