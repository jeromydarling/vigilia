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
import { Users, Calendar, Church, BarChart3, Plus } from 'lucide-react';
import {
  useVolunteerSchedules, useCreateVolunteerSchedule, useDeleteVolunteerSchedule,
  useParishLinks, useCreateParishLink, useParishVolunteerStats,
} from '@/hooks/useParishVolunteers';
import VolunteerScheduleGrid from '@/components/vigilia/VolunteerScheduleGrid';
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

  const [scheduleDialog, setScheduleDialog] = useState<{ day: number; slot: string } | null>(null);
  const [parishDialog, setParishDialog] = useState(false);
  const [volunteerName, setVolunteerName] = useState('');
  const [parishName, setParishName] = useState('');

  const handleAddSchedule = () => {
    if (!scheduleDialog || !volunteerName.trim()) return;
    createSchedule.mutate({
      volunteerContactId: volunteerName.trim(), // Would be a contact lookup in production
      facilityAnchorId: '',
      dayOfWeek: scheduleDialog.day,
      timeSlot: scheduleDialog.slot,
    }, {
      onSuccess: () => {
        setScheduleDialog(null);
        setVolunteerName('');
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
                  volunteer_name: s.volunteer_contact_id?.slice(0, 8),
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
                <Badge variant="outline">{stats?.activeVolunteers ?? 0} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(schedules ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No volunteers scheduled yet. Use the Schedule tab to assign volunteers.
                </p>
              ) : (
                <div className="space-y-2">
                  {(schedules ?? []).map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{s.volunteer_contact_id?.slice(0, 8) ?? 'Volunteer'}</p>
                        <p className="text-xs text-muted-foreground">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.day_of_week]} &middot; {s.time_slot}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Eucharistic Minister</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
          <Input
            placeholder="Volunteer name or ID"
            value={volunteerName}
            onChange={(e) => setVolunteerName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog(null)}>Cancel</Button>
            <Button onClick={handleAddSchedule} disabled={!volunteerName.trim()}>Assign</Button>
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
