/**
 * Vigilia Toast — Charter-compliant notification system.
 *
 * WHAT: Wraps sonner toast with Vigilia vocabulary enforcement.
 * WHERE: Import this instead of raw `toast` from sonner in all components.
 * WHY: Prevents SaaS-tone drift in confirmation and error messages.
 */
import { toast as sonnerToast, ExternalToast } from 'sonner';
import { vigiliaText, FRICTION_COPY } from '@/lib/toneCharter';

type ToastData = ExternalToast;

/**
 * Vigilia-compliant toast functions.
 *
 * Usage:
 *   import { vigiliaToast } from '@/lib/vigiliaToast';
 *   vigiliaToast.held();              // silent "Held." confirmation
 *   vigiliaToast.noted();             // "Noted."
 *   vigiliaToast.updated();           // "Updated."
 *   vigiliaToast.recorded();          // "Recorded."
 *   vigiliaToast.removed();           // "Removed."
 *   vigiliaToast.gentle(message);     // gentle system message (errors)
 *   vigiliaToast.info(message);       // neutral informational
 */
export const vigiliaToast = {
  /** Autosave / save confirmation */
  held: (opts?: ToastData) =>
    sonnerToast('Held.', { duration: 1500, ...opts }),

  /** Generic acknowledgment */
  noted: (description?: string, opts?: ToastData) =>
    sonnerToast('Noted.', { description, duration: 2000, ...opts }),

  /** Update confirmation */
  updated: (description?: string, opts?: ToastData) =>
    sonnerToast('Updated.', { description, duration: 2000, ...opts }),

  /** Action recorded */
  recorded: (description?: string, opts?: ToastData) =>
    sonnerToast('Recorded.', { description, duration: 2000, ...opts }),

  /** Deletion / removal */
  removed: (description?: string, opts?: ToastData) =>
    sonnerToast('Removed.', { description, duration: 2000, ...opts }),

  /** Gentle error — replaces toast.error */
  gentle: (message?: string, opts?: ToastData) =>
    sonnerToast(message || FRICTION_COPY.systemError, {
      duration: 4000,
      ...opts,
    }),

  /** Neutral info */
  info: (message: string, opts?: ToastData) =>
    sonnerToast(vigiliaText(message), { duration: 2500, ...opts }),

  /** Fallback: raw toast with vocabulary filter */
  raw: (message: string, opts?: ToastData) =>
    sonnerToast(vigiliaText(message), opts),
};
