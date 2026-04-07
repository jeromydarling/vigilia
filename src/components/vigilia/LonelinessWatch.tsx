/**
 * LonelinessWatch — Dashboard card showing residents at risk of isolation.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertTriangle } from 'lucide-react';
import { useLonelinessScores, driftLabel, driftColor } from '@/hooks/useLonelinessWatch';
import type { DriftStatus } from '@/types/vigilia';

export function LonelinessWatch() {
  const { data: scores, isLoading } = useLonelinessScores();

  const atRisk = (scores ?? [])
    .filter((s: any) => s.drift_status === 'drifting' || s.drift_status === 'distant')
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-4 w-4 text-muted-foreground" />
          Loneliness Watch
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!isLoading && atRisk.length === 0 && (
          <p className="text-sm text-muted-foreground">No residents currently at risk. Keep visiting.</p>
        )}
        {!isLoading && atRisk.length > 0 && (
          <div className="space-y-2">
            {atRisk.map((score: any) => (
              <div
                key={score.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  {score.drift_status === 'distant' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{score.resident_contact_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {score.visit_frequency_7d} visits/wk
                  </span>
                  <Badge variant="secondary" className={driftColor(score.drift_status as DriftStatus)}>
                    {driftLabel(score.drift_status as DriftStatus)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
