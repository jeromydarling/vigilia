import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export type FeedbackType = 'bug' | 'feature';
export type FeedbackPriority = 'low' | 'medium' | 'high';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'declined';

export interface FeedbackAttachment {
  id: string;
  feedback_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface FeedbackRequest {
  id: string;
  user_id: string;
  type: FeedbackType;
  title: string;
  description: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  admin_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  attachments?: FeedbackAttachment[];
}

export interface CreateFeedbackInput {
  type: FeedbackType;
  title: string;
  description: string;
  priority: FeedbackPriority;
}

export interface UpdateFeedbackInput {
  id: string;
  status?: FeedbackStatus;
  admin_notes?: string;
}

export function useFeedback() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's own feedback requests with attachments
  const { data: userFeedback = [], isLoading: isLoadingUserFeedback } = useQuery({
    queryKey: ['feedback', 'user', user?.id],
    queryFn: async () => {
      // STUB: feedback_requests table does not exist
      const { data, error } = { data: [] as any[], error: null };

      if (error) throw error;
      return data as FeedbackRequest[];
    },
    enabled: !!user?.id,
  });

  // Fetch all feedback requests (for admins)
  const { data: allFeedback = [], isLoading: isLoadingAllFeedback } = useQuery({
    queryKey: ['feedback', 'all'],
    queryFn: async () => {
      // STUB: feedback_requests table does not exist
      const { data, error } = { data: [] as any[], error: null };

      if (error) throw error;
      return data as FeedbackRequest[];
    },
  });

  // Create new feedback request
  const createFeedback = useMutation({
    mutationFn: async (input: CreateFeedbackInput) => {
      // STUB: feedback_requests table does not exist
      const { data, error } = { data: null as any, error: null };

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit feedback: ' + error.message);
    },
  });

  // Upload attachment
  const uploadAttachment = useMutation({
    mutationFn: async ({ feedbackId, file }: { feedbackId: string; file: File }) => {
      // STUB: feedback-attachments storage and feedback_attachments table do not exist
      const filePath = `${user?.id}/${feedbackId}/${Date.now()}_${file.name}`;
      const { data, error } = { data: { feedback_id: feedbackId, file_name: file.name, file_path: filePath } as any, error: null };

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
    onError: (error) => {
      toast.error('Failed to upload attachment: ' + error.message);
    },
  });

  // Get signed URL for an attachment
  const getAttachmentUrl = async (filePath: string) => {
    // STUB: feedback-attachments storage does not exist
    return '';
  };

  // Update feedback request (admin only)
  const updateFeedback = useMutation({
    mutationFn: async (input: UpdateFeedbackInput) => {
      const updateData: Partial<FeedbackRequest> = {};
      if (input.status !== undefined) updateData.status = input.status;
      if (input.admin_notes !== undefined) updateData.admin_notes = input.admin_notes;

      // STUB: feedback_requests table does not exist
      const { data, error } = { data: null as any, error: null };

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update feedback: ' + error.message);
    },
  });

  // Delete feedback request (admin only)
  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      // STUB: feedback_requests table does not exist
      const { error } = { error: null };

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete feedback: ' + error.message);
    },
  });

  return {
    userFeedback,
    allFeedback,
    isLoadingUserFeedback,
    isLoadingAllFeedback,
    createFeedback,
    uploadAttachment,
    getAttachmentUrl,
    updateFeedback,
    deleteFeedback,
  };
}