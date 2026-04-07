import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { ContactModal } from './ContactModal';
import { PendingCallModal } from './PendingCallModal';

/** Rendered once at App level so entity modals survive route changes. */
export function GlobalModals() {
  const {
    contactModalOpen,
    contactModalEntity,
    closeContactModal,
  } = useGlobalModal();

  return (
    <>
      <PendingCallModal />
      <ContactModal
        open={contactModalOpen}
        onOpenChange={(open) => { if (!open) closeContactModal(); }}
        contact={contactModalEntity as any}
      />
    </>
  );
}
