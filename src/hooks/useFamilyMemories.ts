/**
 * useFamilyMemories — Family-contributed photos and memories for the journal.
 *
 * "Make the journal bidirectional — not just facility→family but family→resident."
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export interface FamilyMemory {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  contributed_by: string;
  contributor_name: string | null;
  memory_type: 'photo' | 'story' | 'greeting';
  content_text: string | null;
  photo_url: string | null;
  created_at: string;
}

export function useFamilyMemories(residentContactId?: string) {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['family-memories', tenantId, residentContactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('family_memories')
        .select('*')
        .eq('tenant_id', tenantId!)
        .eq('resident_contact_id', residentContactId!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as FamilyMemory[];
    },
    enabled: !!tenantId && !!residentContactId,
  });
}

export function useAddFamilyMemory() {
  const { tenantId } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      residentContactId: string;
      memoryType: 'photo' | 'story' | 'greeting';
      contentText?: string;
      photoFile?: File;
      contributorName?: string;
    }) => {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (params.photoFile) {
        const ext = params.photoFile.name.split('.').pop() ?? 'jpg';
        const path = `family-memories/${tenantId}/${params.residentContactId}/${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('family-memories')
          .upload(path, params.photoFile);

        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from('family-memories').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('family_memories').insert({
        tenant_id: tenantId!,
        resident_contact_id: params.residentContactId,
        contributed_by: user!.id,
        contributor_name: params.contributorName ?? null,
        memory_type: params.memoryType,
        content_text: params.contentText ?? null,
        photo_url: photoUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-memories'] });
      toast.success('Memory added to the journal');
    },
    onError: () => {
      toast.error('Failed to add memory');
    },
  });
}
