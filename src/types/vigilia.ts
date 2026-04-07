/**
 * Vigilia Types — Domain types for Catholic senior care hospitality.
 *
 * WHAT: Defines Vigilia-specific interfaces for residents, visits, pastoral care,
 *       family circles, drift detection, and volunteer coordination.
 * WHERE: Import from '@/types/vigilia' in all Vigilia feature code.
 * WHY: Clean domain model for the "liturgy of attention" — separate from legacy CRM types.
 */

// ── Visit Ritual (the 30-second bedside capture) ──

export type MoodObserved = 'peaceful' | 'lonely' | 'anxious' | 'encouraged' | 'tired' | 'hard_to_tell';
export type NeedObserved = 'company' | 'prayer' | 'family_contact' | 'sacramental_care' | 'comfort' | 'staff_followup';
export type ConcernNoted = 'new_grief' | 'withdrawal' | 'joyful_moment' | 'family_strain' | 'spiritual_request' | 'no_concern';
export type FollowupAction = 'tell_chaplain' | 'contact_family' | 'ask_volunteer_visit' | 'no_followup';

export interface VisitRitual {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  visitor_user_id: string;
  visited_at: string;
  mood_observed: MoodObserved;
  need_observed: NeedObserved;
  concern_noted: ConcernNoted;
  followup_action: FollowupAction;
  voice_note_url: string | null;
  voice_prompt_id: string | null;
  voice_prompt_text: string | null;
  duration_seconds: number | null;
  facility_anchor_id: string | null;
  created_at: string;
}

// ── Voice Prompts (rotating Ignatian formation prompts) ──

export type VoicePromptCategory =
  | 'surprise'
  | 'face'
  | 'family'
  | 'spiritual'
  | 'memory'
  | 'joy'
  | 'loss'
  | 'daily_life'
  | 'accompaniment';

export interface VoicePrompt {
  id: string;
  category: VoicePromptCategory;
  prompt_text: string;
  /** When this prompt is especially appropriate */
  best_when: string | null;
  /** Liturgical season affinity (ordinary, advent, lent, easter, etc.) */
  liturgical_affinity: string | null;
  active: boolean;
  sort_order: number;
}

// ── Resident (extended contact fields) ──

export type CareLevel = 'independent' | 'assisted' | 'memory_care' | 'skilled_nursing' | 'hospice';

export interface ResidentProfile {
  /** Same as contacts.id — resident is a contact with person_type = 'resident' */
  contact_id: string;
  tenant_id: string;
  preferred_name: string | null;
  room_number: string | null;
  admission_date: string | null;
  care_level: CareLevel | null;
  faith_tradition: string | null;
  parish_affiliation: string | null;
  dietary_notes: string | null;
  mobility_notes: string | null;
  biography: string | null;
}

// ── Resident Faith History ──

export type FaithEventType =
  | 'baptism'
  | 'first_communion'
  | 'confirmation'
  | 'marriage'
  | 'ordination'
  | 'conversion'
  | 'religious_vows'
  | 'other';

export interface ResidentFaithEvent {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  event_type: FaithEventType;
  event_date: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

// ── Resident Losses & Joys ──

export interface ResidentLoss {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  loss_type: string; // "spouse", "child", "friend", "sibling", "pet", etc.
  person_name: string | null;
  relationship: string | null;
  date_of_loss: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface ResidentJoy {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  joy_type: string; // "grandchild_born", "anniversary", "hobby", "friendship", etc.
  description: string;
  observed_date: string | null;
  reported_by: string;
  created_at: string;
}

// ── Pastoral Care ──

export type SacramentType =
  | 'communion'
  | 'confession'
  | 'anointing_of_sick'
  | 'last_rites'
  | 'rosary'
  | 'blessing'
  | 'other';

export interface SacramentalRecord {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  sacrament_type: SacramentType;
  administered_by: string | null;
  administered_at: string;
  location: string | null;
  notes: string | null;
  next_scheduled: string | null;
  created_at: string;
}

export interface ChaplainAssignment {
  id: string;
  tenant_id: string;
  facility_anchor_id: string;
  chaplain_user_id: string;
  assignment_type: string; // "primary", "backup", "visiting"
  schedule_json: Record<string, unknown> | null;
  active: boolean;
  created_at: string;
}

// ── Family Circle (extends contact_household_members) ──

export type CommunicationPreference = 'call' | 'text' | 'email' | 'in_person' | 'video_call';

export interface FamilyRelationship {
  /** Same as contact_household_members.id */
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  family_contact_id: string | null;
  name: string;
  relationship: string | null;
  communication_preference: CommunicationPreference | null;
  is_emergency_contact: boolean;
  is_primary_contact: boolean;
  contact_frequency_preference: string | null; // "daily", "weekly", "monthly", "as_needed"
  last_contacted_at: string | null;
  notes: string | null;
}

export interface FamilyStrainSignal {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  family_relationship_id: string | null;
  signal_type: string; // "no_contact_14d", "visit_cancelled", "frustration_noted", "conflict_observed"
  severity: 'low' | 'medium' | 'high';
  observed_at: string;
  observed_by: string;
  notes: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
}

// ── Drift & Loneliness Watch ──

export type DriftStatus = 'present' | 'quiet' | 'drifting' | 'distant';

export interface LonelinessScore {
  id: string;
  tenant_id: string;
  resident_contact_id: string;
  score_date: string;
  isolation_score: number; // 0-100 (higher = more isolated)
  visit_frequency_7d: number;
  visit_frequency_30d: number;
  family_contact_frequency: number;
  mood_trend_7d: string | null; // "improving", "stable", "declining"
  contributing_factors: Record<string, unknown>;
  drift_status: DriftStatus;
  computed_at: string;
}

// ── Volunteer & Parish Coordination ──

export type MinistryType =
  | 'eucharistic_minister'
  | 'prayer_partner'
  | 'friendly_visitor'
  | 'music_ministry'
  | 'reading_companion'
  | 'other';

export interface EucharisticMinisterSchedule {
  id: string;
  tenant_id: string;
  volunteer_contact_id: string;
  facility_anchor_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  time_slot: string; // "morning", "afternoon", "evening"
  resident_assignments: string[]; // contact IDs
  active: boolean;
  created_at: string;
}

export interface ParishFacilityLink {
  id: string;
  tenant_id: string;
  parish_name: string;
  parish_territory_id: string | null;
  facility_anchor_id: string;
  relationship_type: string; // "primary_parish", "visiting_parish", "diocese"
  created_at: string;
}

// ── PHI Access Audit (HIPAA) ──

export interface PhiAccessLog {
  id: string;
  user_id: string;
  tenant_id: string;
  resource_type: string; // "visit_ritual", "sacramental_record", "resident_profile", etc.
  resource_id: string;
  action: 'view' | 'create' | 'update' | 'delete' | 'export';
  accessed_at: string;
  ip_address: string | null;
}
