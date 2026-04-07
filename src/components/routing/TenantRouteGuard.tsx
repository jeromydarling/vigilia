/**
 * TenantRouteGuard — Validates tenant slug and redirects as needed.
 *
 * WHAT: Ensures URL tenant slug matches the user's tenant; redirects to
 *       onboarding or sponsored setup when needed.
 * WHERE: Wraps all /:tenantSlug/* routes.
 * WHY: Single checkpoint for tenant validation, onboarding gating, and
 *       first-login setup for operator-granted tenants.
 */

import { useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useDemoMode } from '@/contexts/DemoModeContext';

export function TenantRouteGuard() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { tenant, isLoading } = useTenant();
  const { isDemoMode, demoTenantSlug } = useDemoMode();
  const navigate = useNavigate();

  const isDemoBypass = isDemoMode && tenantSlug === demoTenantSlug;

  const { data: onboardingState, isLoading: isLoadingOnboarding } = useQuery({
    queryKey: ['tenant-onboarding-state', tenant?.id],
    enabled: !isDemoBypass && !!tenant?.id && tenant?.is_operator_granted === true,
    queryFn: async () => {
      const { data } = await supabase
        .from('tenant_onboarding_state')
        .select('completed')
        .eq('tenant_id', tenant!.id)
        .maybeSingle();
      return data ?? null;
    },
  });

  useEffect(() => {
    if (isDemoBypass || isLoading) return;

    if (!tenant) {
      navigate('/onboarding', { replace: true });
      return;
    }

    if (tenantSlug && tenantSlug !== tenant.slug) {
      const rest = window.location.pathname.replace(`/${tenantSlug}`, '');
      navigate(`/${tenant.slug}${rest || '/'}`, { replace: true });
      return;
    }

    if (
      tenant.is_operator_granted &&
      !isLoadingOnboarding &&
      onboardingState &&
      onboardingState.completed === false
    ) {
      navigate('/sponsored-setup', { replace: true });
    }
  }, [tenant, tenantSlug, isLoading, isLoadingOnboarding, onboardingState, navigate, isDemoBypass]);

  if (isDemoBypass) return <Outlet />;
  if (isLoading) return null;
  if (!tenant) return null;
  if (tenant.is_operator_granted && isLoadingOnboarding) return null;

  return <Outlet />;
}
