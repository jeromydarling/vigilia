/**
 * ParishVolunteerPortal — Scheduling and coordination for parish volunteers.
 *
 * "No scheduling tool understands Extraordinary Minister certification,
 *  Safe Environment Training, or liturgical calendar constraints."
 */

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Church, BarChart3, Plus, ShieldCheck } from 'lucide-react';
import {
  useVolunteerSchedules, useCreateVolunteerSchedule, useDeleteVolunteerSchedule,
  useParishLinks, useCreateParishLink, useParishVolunteerStats,
} from '@/hooks/useParishVolunteers';
import { useVolunteers, type Volunteer } from '@/hooks/useVolunteers';
import VolunteerScheduleGrid from '@/components/vigilia/VolunteerScheduleGrid';
import VolunteerSearchSelect from '@/components/vigilia/VolunteerSearchSelect';
import SafeEnvironmentCard from '@/components/vigilia/SafeEnvironmentCard';
import BulletinSummaryGenerator from '@/components/vigilia/BulletinSummaryGenerator';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function ParishVolunteerPortal() {
  const { data: schedules } = useVolunteerSchedules();
  const createSchedule = useCreateVolunteerSchedule();
  const deleteSchedule = useDeleteVolunteerSchedule();
  const { data: parishes } = useParishLinks();
  const createParish = useCreateParishLink();
  const { data: stats } = useParishVolunteerStats();

  const { data: allVolunteers } = useVolunteers('active');

  const [scheduleDialog, setScheduleDialog] = useState<{ day: number; slot: string } | null>(null);
  const [parishDialog, setParishDialog] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [parishName, setParishName] = useState('');

  // Build a lookup map for volunteer names from IDs in schedules
  const volunteerNameMap = new Map<string, string>();
  for (const v of (allVolunteers ?? []) as Volunteer[]) {
    volunteerNameMap.set(v.id, `${v.first_name} ${v.last_name}`);
  }

  const handleAddSchedule = () => {
    if (!scheduleDialog || !selectedVolunteer) return;
    createSchedule.mutate({
      volunteerContactId: selectedVolunteer.id,
      facilityAnchorId: '',
      dayOfWeek: scheduleDialog.day,
      timeSlot: scheduleDialog.slot,
    }, {
      onSuccess: () => {
        setScheduleDialog(null);
        setSelectedVolunteer(null);
      },
    });
  };

  const handleAddParish = () => {
    if (!parishName.trim()) return;
    createParish.mutate({
      parishName: parishName.trim(),
      facilityAnchorId: '',
      relationshipType: 'primary_parish',
    }, {
      onSuccess: () => {
        setParishDialog(false);
        setParishName('');
      },
    });
  };

  return (
    <MainLayout title="Parish Volunteers" subtitle="Ministry coordination & scheduling">
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Volunteers
          </TabsTrigger>
          <TabsTrigger value="parishes" className="gap-1.5">
            <Church className="h-3.5 w-3.5" />
            Parishes
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weekly Ministry Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <VolunteerScheduleGrid
                schedules={(schedules ?? []).map((s: any) => ({
                  ...s,
                  volunteer_name: volunteerNameMap.get(s.volunteer_contact_id) ?? 'Volunteer',
                }))}
                onCellClick={(day, slot) => setScheduleDialog({ day, slot })}
                onAssignmentClick={(s) => {
                  if (confirm('Remove this assignment?')) {
                    deleteSchedule.mutate(s.id);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Volunteers</CardTitle>
                <Badge variant="outline">{(allVolunteers as Volunteer[] ?? []).length} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(allVolunteers as Volunteer[] ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active volunteers. Add volunteers from the main Volunteers page.
                </p>
              ) : (
                <div className="space-y-2">
                  {(allVolunteers as Volunteer[] ?? []).map((v) => (
                    <div key={v.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{v.first_name} {v.last_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.email ?? 'No email'}
                          {v.phone && <span> &middot; {v.phone}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={v.status === 'active' ? 'secondary' : 'outline'} className="text-[10px]">
                          {v.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <SafeEnvironmentCard />
        </TabsContent>

        {/* Parishes Tab */}
        <TabsContent value="parishes" className="space-y-6">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => setParishDialog(true)}>
              <Plus className="h-3.5 w-3.5" />
              Connect Parish
            </Button>
          </div>
          {(parishes ?? []).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Church className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No parishes connected yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(parishes ?? []).map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <p className="font-medium">{p.parish_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.relationship_type?.replace(/_/g, ' ')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Visits This Month" value={stats.visitsThisMonth} />
              <StatCard label="Residents Visited" value={stats.uniqueResidentsThisMonth} />
              <StatCard label="Active Volunteers" value={stats.activeVolunteers} />
              <StatCard label="Connected Parishes" value={stats.connectedParishes} />
            </div>
          )}
          <BulletinSummaryGenerator />
        </TabsContent>
      </Tabs>

      {/* Add Schedule Dialog */}
      <Dialog open={!!scheduleDialog} onOpenChange={(open) => !open && setScheduleDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Volunteer</DialogTitle>
          </DialogHeader>
          <VolunteerSearchSelect
            value=""
            onSelect={(v) => setSelectedVolunteer(v)}
            placeholder="Search by name or email..."
          />
          {selectedVolunteer && (
            <p className="text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedVolunteer.first_name} {selectedVolunteer.last_name}</span>
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setScheduleDialog(null); setSelectedVolunteer(null); }}>Cancel</Button>
            <Button onClick={handleAddSchedule} disabled={!selectedVolunteer}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Parish Dialog */}
      <Dialog open={parishDialog} onOpenChange={setParishDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Connect Parish</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Parish name"
            value={parishName}
            onChange={(e) => setParishName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setParishDialog(false)}>Cancel</Button>
            <Button onClick={handleAddParish} disabled={!parishName.trim()}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
