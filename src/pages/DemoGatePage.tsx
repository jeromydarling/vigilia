/**
 * DemoGatePage — Vigilia demo access with lead capture and bypass.
 *
 * - Prospects: fill out name/email/organization → enter demo
 * - Owner bypass: ?bypass=vigilia skips the form entirely
 * - Automated testing: ?bypass=vigilia&role=staff (or chaplain, volunteer, family, admin)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDemoMode, type DemoSession } from '@/contexts/DemoModeContext';
import { DEMO_ROLES, type DemoRoleKey } from '@/lib/demoSeedData';

export default function DemoGatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startDemo } = useDemoMode();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<DemoRoleKey>('staff');
  const [submitting, setSubmitting] = useState(false);

  const bypass = searchParams.get('bypass');
  const bypassRole = searchParams.get('role') as DemoRoleKey | null;

  // Auto-bypass for owner testing and automated browser testing
  useEffect(() => {
    if (bypass === 'vigilia') {
      const role = bypassRole && DEMO_ROLES.some((r) => r.key === bypassRole) ? bypassRole : 'admin';
      const session: DemoSession = {
        name: 'Demo User',
        email: 'demo@vigilia.care',
        location: 'Internal Testing',
        role: role === 'admin' ? 'steward' : role === 'chaplain' ? 'shepherd' : role === 'family' ? 'visitor' : 'companion',
        grantedAt: new Date().toISOString(),
      };
      startDemo(session);
      navigate('/community-tech-alliance', { replace: true });
    }
  }, [bypass, bypassRole, startDemo, navigate]);

  const isValid = name.trim().length > 0 && email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);

    try {
      // Fire-and-forget lead capture
      supabase.functions.invoke('demo-gate-submit', {
        body: {
          name: name.trim(),
          email: email.trim(),
          location: organization.trim(),
          role_selected: selectedRole,
        },
      }).catch(() => {});

      const roleMap: Record<DemoRoleKey, string> = {
        staff: 'companion',
        chaplain: 'shepherd',
        volunteer: 'companion',
        family: 'visitor',
        admin: 'steward',
      };

      const session: DemoSession = {
        name: name.trim(),
        email: email.trim(),
        location: organization.trim(),
        role: roleMap[selectedRole] as any,
        grantedAt: new Date().toISOString(),
      };

      startDemo(session);
      toast.success(`Welcome, ${name.split(' ')[0]}!`, {
        description: `Entering as ${DEMO_ROLES.find((r) => r.key === selectedRole)?.label}`,
      });

      navigate('/community-tech-alliance', { replace: true });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If bypass is active, show loading
  if (bypass === 'vigilia') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--marketing-surface))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--marketing-gold))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--marketing-surface))] p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-tan))] font-sans">
            Vigilia &middot; A Liturgy of Attention
          </p>
          <h1 className="text-3xl font-normal text-[hsl(var(--marketing-deep))]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Try It Out
          </h1>
          <p className="text-base text-[hsl(var(--marketing-muted))] leading-relaxed max-w-md mx-auto" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Explore a living demo of St. Joseph's Care Home — real workflows, real data,
            nothing hidden. Switch between roles to see every perspective.
          </p>
        </div>

        <Card className="border-[hsl(var(--marketing-border))] shadow-md bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Before you enter
            </CardTitle>
            <CardDescription style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Tell us about yourself so we can follow up. Then choose your starting role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Your Name</Label>
                <Input id="demo-name" placeholder="Sarah Williams" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" type="email" placeholder="sarah@stjosephs.org" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-org">Organization <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="demo-org" placeholder="St. Joseph's Care Home" value={organization} onChange={(e) => setOrganization(e.target.value)} maxLength={200} autoComplete="organization" />
              </div>

              {/* Role selector */}
              <div className="space-y-3">
                <Label>Start as</Label>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ROLES.map((role) => (
                    <button
                      key={role.key}
                      type="button"
                      onClick={() => setSelectedRole(role.key)}
                      className={`flex items-center gap-3 p-3 rounded border text-left transition-colors ${
                        selectedRole === role.key
                          ? 'border-[hsl(var(--marketing-gold))] bg-[hsl(var(--marketing-gold)/0.06)]'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <span className="text-lg w-8 text-center">{role.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{role.label}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full rounded-none border-2 border-[hsl(var(--marketing-deep))] bg-[hsl(var(--marketing-deep))] text-[hsl(var(--marketing-cream))] hover:bg-transparent hover:text-[hsl(var(--marketing-deep))] py-5 text-xs font-sans tracking-[0.18em] uppercase transition-colors duration-300 h-auto"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enter the Demo'}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Demo mode — all data is read-only. You can switch roles anytime inside.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
