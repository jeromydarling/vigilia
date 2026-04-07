/**
 * Vigilia Dashboard — The daily view for care staff and mission leads.
 */

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Eye, Cross, Calendar, Mic, ArrowRight } from 'lucide-react';
import { useTenantPath } from '@/hooks/useTenantPath';
import { Link } from 'react-router-dom';
import { useContacts } from '@/hooks/useContacts';
import { useVisitRituals } from '@/hooks/useVisitRituals';
import { useLonelinessScores, driftLabel, driftColor } from '@/hooks/useLonelinessWatch';
import { useSacramentalRecords } from '@/hooks/usePastoralCare';
import type { DriftStatus } from '@/types/vigilia';

const Index = () => {
  const { tenantPath } = useTenantPath();
  const { data: contacts } = useContacts();
  const { data: recentVisits } = useVisitRituals();
  const { data: lonelinessScores } = useLonelinessScores();
  const { data: sacramentalRecords } = useSacramentalRecords();

  // Count residents (contacts that could be residents)
  const residentCount = (contacts ?? []).length;
  const recentVisitCount = (recentVisits ?? []).slice(0, 7).length;
  const atRiskCount = (lonelinessScores ?? []).filter((s: any) =>
    s.drift_status === 'drifting' || s.drift_status === 'distant'
  ).length;
  const recentSacraments = (sacramentalRecords ?? []).slice(0, 5);

  return (
    <MainLayout title="Vigilia" subtitle="A liturgy of attention">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to={tenantPath('/visits')}>
            <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Mic className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Start Visit</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={tenantPath('/residents')}>
            <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Residents</p>
                <p className="text-xs text-muted-foreground">{residentCount}</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={tenantPath('/calendar')}>
            <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Calendar</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={tenantPath('/volunteers')}>
            <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Volunteers</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loneliness Watch */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  Loneliness Watch
                </span>
                {atRiskCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{atRiskCount} at risk</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {atRiskCount === 0 ? (
                <p className="text-sm text-muted-foreground">No residents currently at risk. Keep visiting.</p>
              ) : (
                <div className="space-y-2">
                  {(lonelinessScores ?? [])
                    .filter((s: any) => s.drift_status === 'drifting' || s.drift_status === 'distant')
                    .slice(0, 5)
                    .map((score: any) => (
                      <div key={score.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                        <span className="text-sm">{score.resident_contact_id?.slice(0, 8)}...</span>
                        <Badge variant="secondary" className={driftColor(score.drift_status as DriftStatus)}>
                          {driftLabel(score.drift_status as DriftStatus)}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Visits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-4 w-4 text-muted-foreground" />
                Recent Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentVisitCount === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No visits recorded yet.</p>
                  <Link to={tenantPath('/visits')}>
                    <Button size="sm" variant="outline" className="gap-1">
                      Record a visit <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {(recentVisits ?? []).slice(0, 5).map((visit: any) => (
                    <div key={visit.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{
                          visit.mood_observed === 'peaceful' ? '🕊️' :
                          visit.mood_observed === 'lonely' ? '🫂' :
                          visit.mood_observed === 'anxious' ? '😟' :
                          visit.mood_observed === 'encouraged' ? '😊' :
                          visit.mood_observed === 'tired' ? '😴' : '🤔'
                        }</span>
                        <span className="text-sm">{visit.mood_observed?.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(visit.visited_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pastoral Care */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cross className="h-4 w-4 text-muted-foreground" />
                Recent Pastoral Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSacraments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sacramental records yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentSacraments.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                      <Badge variant="outline">{record.sacrament_type?.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.administered_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Prompt Preview */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Formation Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic text-foreground leading-relaxed">
                "What did their face tell you that words didn't?"
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Each day, Vigilia offers a different prompt to guide your observation.
                The prompts teach you what to notice — and over time, how to see.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
