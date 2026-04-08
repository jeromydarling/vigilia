/**
 * VolunteerSearchSelect — Searchable dropdown for selecting a volunteer.
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { useVolunteers, type Volunteer } from '@/hooks/useVolunteers';

interface VolunteerSearchSelectProps {
  value: string;
  onSelect: (volunteer: Volunteer) => void;
  placeholder?: string;
}

export default function VolunteerSearchSelect({ value, onSelect, placeholder }: VolunteerSearchSelectProps) {
  const { data: volunteers } = useVolunteers('active');
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim() || !volunteers) return volunteers ?? [];
    const q = query.toLowerCase();
    return (volunteers as Volunteer[]).filter(
      (v) =>
        v.first_name.toLowerCase().includes(q) ||
        v.last_name.toLowerCase().includes(q) ||
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q),
    );
  }, [volunteers, query]);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder ?? 'Search volunteers...'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 10).map((v) => (
            <button
              key={v.id}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              onClick={() => {
                onSelect(v);
                setQuery(`${v.first_name} ${v.last_name}`);
                setOpen(false);
              }}
            >
              <span className="font-medium">{v.first_name} {v.last_name}</span>
              {v.email && <span className="text-muted-foreground ml-2 text-xs">{v.email}</span>}
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-border rounded shadow-lg p-3 text-sm text-muted-foreground">
          No volunteers found
        </div>
      )}
    </div>
  );
}
