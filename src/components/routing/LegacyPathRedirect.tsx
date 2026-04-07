import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Catches legacy bare paths (e.g. /dashboard, /opportunities) and redirects
 * to the tenant-prefixed version (e.g. /my-org/dashboard).
 * Only fires for authenticated users with an active tenant.
 */
export function LegacyPathRedirect() {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading || tenantLoading) return;
    if (!user || !tenant) return;

    // If we're on a bare app path (not marketing, not auth, not already tenant-prefixed)
    const path = location.pathname;
    const marketingPaths = ['/', '/manifesto', '/pricing', '/archetypes', '/security', '/contact', '/nri', '/cros', '/profunda', '/impulsus', '/testimonium-feature', '/communio-feature', '/signum', '/voluntarium', '/provisio', '/relatio-campaigns', '/integrations', '/case-study-humanity', '/proof', '/compare', '/see-people', '/roles', '/roles/shepherd', '/roles/companion', '/roles/visitor', '/roles/steward', '/archetypes/church-week', '/archetypes/nonprofit-week', '/archetypes/social-enterprise-week', '/archetypes/community-network-week', '/archetypes/ministry-outreach-week', '/archetypes/caregiver-solo-week', '/archetypes/caregiver-agency-week', '/archetypes/missionary-org-week', '/features', '/the-model'];
    const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/onboarding'];
    
    if (marketingPaths.includes(path) || authPaths.includes(path) || path.startsWith('/insights') || path.startsWith('/stories') || path.startsWith('/roles/') || path.startsWith('/metros/') || path.startsWith('/path/') || path.startsWith('/calling/') || path.startsWith('/library') || path.startsWith('/network/') || path.startsWith('/public/') || path.startsWith('/week/') || path.startsWith('/essays') || path.startsWith('/field-notes-library') || path.startsWith('/reflections') || path.startsWith('/field-journal') || path.startsWith('/lexicon') || path.startsWith('/mission-atlas') || path.startsWith('/compare/') || path.startsWith('/archetypes/') || path.startsWith('/legal/') || path.startsWith('/fundraising') || path.startsWith('/authority') || path.startsWith('/events/') || path === '/sitemap.xml') return;
    if (path.startsWith('/admin')) return; // Master CROS admin console — no tenant prefix
    if (path.startsWith('/operator')) return; // Operator console — no tenant prefix
    if (path.startsWith(`/${tenant.slug}`)) return;
    
    // If the bare path matches a known tenant slug (e.g. navigating to "/bridge-social-enterprise"),
    // don't double-prefix — redirect to the tenant root instead
    const bareSegment = path.replace(/^\//, '').split('/')[0];
    if (bareSegment === tenant.slug) {
      navigate(`/${tenant.slug}/`, { replace: true });
      return;
    }
    
    // Redirect bare path to tenant-prefixed
    navigate(`/${tenant.slug}${path}`, { replace: true });
  }, [user, tenant, authLoading, tenantLoading, location.pathname, navigate]);

  return null;
}
