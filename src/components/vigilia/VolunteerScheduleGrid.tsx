/**
 * VolunteerScheduleGrid — Weekly grid for parish volunteer scheduling.
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = ['morning', 'afternoon', 'evening'];
const SLOT_LABELS: Record<string, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

interface Schedule {
  id: string;
  volunteer_contact_id: string;
  day_of_week: number;
  time_slot: string;
  volunteer_name?: string;
}

interface VolunteerScheduleGridProps {
  schedules: Schedule[];
  onCellClick: (dayOfWeek: number, timeSlot: string) => void;
  onAssignmentClick: (schedule: Schedule) => void;
}

export default function VolunteerScheduleGrid({ schedules, onCellClick, onAssignmentClick }: VolunteerScheduleGridProps) {
  const getSchedulesForCell = (day: number, slot: string) =>
    schedules.filter((s) => s.day_of_week === day && s.time_slot === slot);

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-medium text-muted-foreground w-24" />
              {DAYS.map((d, i) => (
                <th key={i} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((slot) => (
              <tr key={slot}>
                <td className="p-2 text-xs font-medium text-muted-foreground border-r">{SLOT_LABELS[slot]}</td>
                {DAYS.map((_, dayIdx) => {
                  const cellSchedules = getSchedulesForCell(dayIdx, slot);
                  return (
                    <td key={dayIdx} className="p-1.5 border border-border/30 align-top min-h-[60px] h-16">
                      <div className="space-y-1">
                        {cellSchedules.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => onAssignmentClick(s)}
                            className="block w-full text-left"
                          >
                            <Badge variant="secondary" className="text-[10px] w-full justify-start truncate cursor-pointer hover:bg-secondary/80">
                              {s.volunteer_name ?? 'Volunteer'}
                            </Badge>
                          </button>
                        ))}
                        {cellSchedules.length === 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-muted-foreground/40 hover:text-muted-foreground"
                            onClick={() => onCellClick(dayIdx, slot)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-4">
        {DAYS.map((day, dayIdx) => {
          const daySchedules = schedules.filter((s) => s.day_of_week === dayIdx);
          if (daySchedules.length === 0) return null;
          return (
            <div key={dayIdx}>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">{day}</p>
              <div className="space-y-1">
                {daySchedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                    <span className="text-sm">{s.volunteer_name ?? 'Volunteer'}</span>
                    <Badge variant="outline" className="text-[10px]">{SLOT_LABELS[s.time_slot]}</Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
