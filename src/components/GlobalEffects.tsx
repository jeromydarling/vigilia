import { useGlobalAnalytics } from '@/hooks/useGlobalAnalytics';
import { useSessionIdleTimeout } from '@/hooks/useSessionIdleTimeout';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Invisible component that activates global side-effects (analytics, security, etc.)
 * Renders nothing — mount once inside the provider tree.
 */
export function GlobalEffects() {
  useGlobalAnalytics();
  useSessionIdleTimeout();
  useOnlineStatus();
  return null;
}
