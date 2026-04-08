/**
 * DemoToolbar — Floating toolbar for switching roles and exiting demo mode.
 *
 * Sticky bottom bar that lets prospects (and testers) switch between
 * Staff, Chaplain, Volunteer, Family, and Admin perspectives.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ROLES, type DemoRoleKey } from '@/lib/demoSeedData';
import type { LensRole } from '@/lib/ministryRole';

const ROLE_TO_LENS: Record<DemoRoleKey, LensRole> = {
  staff: 'companion',
  chaplain: 'shepherd',
  volunteer: 'companion',
  family: 'visitor',
  admin: 'steward',
};

const LENS_TO_DEMO: Record<string, DemoRoleKey> = {
  companion: 'staff',
  shepherd: 'chaplain',
  visitor: 'family',
  steward: 'admin',
};

export default function DemoToolbar() {
  const { isDemoMode, demoSession, demoRole, setDemoRole, endDemo } = useDemoMode();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!isDemoMode) return null;

  const currentDemoRole = LENS_TO_DEMO[demoRole] ?? 'staff';
  const currentRoleInfo = DEMO_ROLES.find((r) => r.key === currentDemoRole) ?? DEMO_ROLES[0];

  const handleRoleSwitch = (roleKey: DemoRoleKey) => {
    setDemoRole(ROLE_TO_LENS[roleKey]);
    setExpanded(false);
  };

  const handleExit = () => {
    endDemo();
    navigate('/', { replace: true });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] print:hidden">
      {/* Expanded role picker */}
      {expanded && (
        <div className="bg-white border-t border-border shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">Switch Role</p>
            <div className="grid grid-cols-5 gap-2">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => handleRoleSwitch(role.key)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded transition-colors text-center ${
                    currentDemoRole === role.key
                      ? 'bg-[hsl(var(--marketing-gold)/0.1)] border border-[hsl(var(--marketing-gold)/0.3)]'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                >
                  <span className="text-lg">{role.icon}</span>
                  <span className="text-[10px] font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main bar */}
      <div className="bg-[hsl(var(--marketing-deep))] text-[hsl(var(--marketing-cream))]">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-[hsl(var(--marketing-gold)/0.15)] text-[hsl(var(--marketing-cream))] border-[hsl(var(--marketing-gold)/0.3)] text-[10px] tracking-wider uppercase">
              Demo
            </Badge>
            <span className="text-sm">
              <span className="text-[hsl(var(--marketing-tan))]">Viewing as</span>
              {' '}
              <span className="font-medium">{currentRoleInfo.icon} {currentRoleInfo.label}</span>
            </span>
            {demoSession?.name && demoSession.name !== 'Demo User' && (
              <span className="text-xs text-[hsl(var(--marketing-tan))] hidden sm:inline">
                &middot; {demoSession.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[hsl(var(--marketing-cream))] hover:bg-[hsl(var(--marketing-brown))] text-xs gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              Switch Role
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[hsl(var(--marketing-tan))] hover:bg-[hsl(var(--marketing-brown))] text-xs gap-1"
              onClick={handleExit}
            >
              <X className="h-3 w-3" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
