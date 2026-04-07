/**
 * narrativeCompanionCopy — Archetype-aware language for Narrative Companion Mode.
 *
 * WHAT: Dynamic copy that adjusts based on tenant's mission archetype.
 * WHERE: Guided Activation, Settings → Integrations, Operator suggestions.
 * WHY: Vigilia speaks differently to a parish than to a workforce dev org.
 */

export type ArchetypeKey =
  | 'church'
  | 'digital_inclusion'
  | 'social_enterprise'
  | 'workforce_dev'
  | 'refugee_support'
  | 'education_access'
  | 'library_system'
  | 'housing_shelter'
  | 'government_civic'
  | 'ministry_outreach'
  | 'community_network';

interface CompanionCopy {
  headline: string;
  subtitle: string;
  setupPrompt: string;
  listeningLabel: string;
}

const DEFAULT_COPY: CompanionCopy = {
  headline: 'Let Vigilia listen alongside your system',
  subtitle: 'We observe gently — never change your tools.',
  setupPrompt: 'Connect your existing system so Vigilia can surface what matters.',
  listeningLabel: 'Listening',
};

export const NARRATIVE_COMPANION_COPY: Record<string, CompanionCopy> = {
  church: {
    headline: 'Bring narrative insight alongside ParishSoft or Planning Center',
    subtitle: 'Vigilia listens to your ministry rhythm — without replacing anything.',
    setupPrompt: 'Connect your church management system so Vigilia can notice patterns of care.',
    listeningLabel: 'Listening',
  },
  ministry_outreach: {
    headline: 'Let Vigilia quietly accompany your outreach tools',
    subtitle: 'Your existing system stays in charge. Vigilia adds narrative awareness.',
    setupPrompt: 'Connect your ministry platform so Vigilia can surface relationship signals.',
    listeningLabel: 'Listening',
  },
  digital_inclusion: {
    headline: 'Let Vigilia quietly observe your existing system and surface what matters',
    subtitle: 'No migration. No disruption. Just narrative insight.',
    setupPrompt: 'Connect your CRM so Vigilia can generate relationship signals.',
    listeningLabel: 'Listening',
  },
  social_enterprise: {
    headline: 'Vigilia listens alongside your tools — adding human context',
    subtitle: 'Your operations stay unchanged. Vigilia adds narrative depth.',
    setupPrompt: 'Connect your system and let Vigilia surface community patterns.',
    listeningLabel: 'Listening',
  },
  workforce_dev: {
    headline: 'Vigilia listens gently without changing the tools you already trust',
    subtitle: 'Your case management stays intact. Vigilia adds relationship memory.',
    setupPrompt: 'Connect your workforce system for narrative awareness.',
    listeningLabel: 'Listening',
  },
  refugee_support: {
    headline: 'Vigilia accompanies your care system with gentle awareness',
    subtitle: 'No data migration. Just quiet observation and narrative signals.',
    setupPrompt: 'Connect your case system so Vigilia can notice family movement.',
    listeningLabel: 'Listening',
  },
  education_access: {
    headline: 'Let Vigilia observe your system and surface community patterns',
    subtitle: 'Your tools stay in place. Vigilia adds narrative intelligence.',
    setupPrompt: 'Connect your platform for relationship-aware signals.',
    listeningLabel: 'Listening',
  },
  library_system: {
    headline: 'Vigilia listens alongside your library management system',
    subtitle: 'No changes to your workflow. Just narrative insight.',
    setupPrompt: 'Connect your system so Vigilia can surface community signals.',
    listeningLabel: 'Listening',
  },
  housing_shelter: {
    headline: 'Vigilia accompanies your shelter system with care',
    subtitle: 'Your tools remain. Vigilia adds gentle family context.',
    setupPrompt: 'Connect your system for household-aware narrative signals.',
    listeningLabel: 'Listening',
  },
  government_civic: {
    headline: 'Vigilia provides narrative awareness alongside civic systems',
    subtitle: 'No integration disruption. Just human-first insight.',
    setupPrompt: 'Connect your system so Vigilia can surface community patterns.',
    listeningLabel: 'Listening',
  },
  community_network: {
    headline: 'Vigilia listens alongside your network tools',
    subtitle: 'Your existing systems stay. Vigilia adds relational depth.',
    setupPrompt: 'Connect your platform for cross-network narrative awareness.',
    listeningLabel: 'Listening',
  },
};

export function getCompanionCopy(archetype?: string | null): CompanionCopy {
  if (!archetype) return DEFAULT_COPY;
  return NARRATIVE_COMPANION_COPY[archetype] ?? DEFAULT_COPY;
}
