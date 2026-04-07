// Vigilia Brand Constants
// UI rebrand layer — database tables retain original Profunda names

export const brand = {
  appName: 'Vigilia',
  fullName: 'A Liturgy of Attention',
  assistantName: 'Neary',
  assistantFullName: 'NRI — Narrative Relational Intelligence',
  tagline: 'Catholic Senior Care Hospitality',
  positioning: 'Vigilia is the fastest way for staff, chaplains, and volunteers to record what mattered in a visit — so no resident\'s story, spiritual need, or quiet loneliness is missed.',
  domain: 'vigilia.care',
} as const;

export const modules = {
  civitas: { label: 'Civitas', description: 'Community layer — metros, pulse, narrative' },
  signum: { label: 'Signum', description: 'Signals & discovery intelligence' },
  testimonium: { label: 'Testimonium', description: 'Narrative storytelling & insight layer' },
  impulsus: { label: 'Impulsus', description: 'Private impact scrapbook journal' },
  relatio: { label: 'Relatio', description: 'Integrations & migration bridges' },
  voluntarium: { label: 'Voluntārium', description: 'Volunteer management & hours tracking' },
  provisio: { label: 'Prōvīsiō', description: 'Technology provisions & orders' },
} as const;

export const tiers = {
  core: {
    name: 'Vigilia',
    tagline: 'A liturgy of attention for Catholic senior care.',
    price: 499,
    priceLabel: '$499/month',
    priceDaily: '$13/day',
    includes: [
      'Resident Story & Narrative Continuity',
      '30-Second Visit Ritual',
      'Family Journal (living narrative)',
      'Four Seasonal Printed Journals per resident',
      'Pastoral Care & Sacramental Tracking',
      'Family Circle & Communication',
      'Drift & Loneliness Watch',
      'Volunteer & Parish Coordination',
      'Visitor Mode & Voice Notes',
      'Events & Calendar',
      'Staff Continuity through Turnover',
    ],
  },
} as const;

export const archetypes = {
  church: {
    name: 'Church / Faith Community',
    tagline: 'Often led by Shepherds, sustained by Companions, and lived out through Visitors.',
  },
  digital_inclusion: {
    name: 'Digital Inclusion Nonprofit',
    tagline: 'Companions and Visitors carry most of the daily relationship work — Shepherds guide the strategy.',
  },
  social_enterprise: {
    name: 'Social Enterprise',
    tagline: 'Shepherds guide growth while Companions maintain community trust.',
  },
  workforce: {
    name: 'Workforce Development',
    tagline: 'Stay close to employers, learners, and local shifts that change demand.',
  },
  refugee_support: {
    name: 'Refugee Support Organization',
    tagline: 'Welcome and integrate refugee communities with gentle continuity.',
  },
  education_access: {
    name: 'Education Access Program',
    tagline: 'Expand equitable access to learning across your region.',
  },
  library_system: {
    name: 'Library System',
    tagline: 'Companions and Visitors carry most of the daily relationship work.',
  },
  caregiver_solo: {
    name: 'Caregiver (Solo)',
    tagline: 'A private space for independent caregivers to remember, reflect, and stay present.',
  },
  caregiver_agency: {
    name: 'Caregiver Agency',
    tagline: 'Dignified visibility into care patterns — without surveillance.',
  },
  missionary_org: {
    name: 'Missionary Organization',
    tagline: 'Serve cross-cultural fields with country-level awareness and relationship memory.',
  },
  retreat_center: {
    name: 'Retreat Center',
    tagline: 'Hold the thread of every retreat journey — remember the people who return.',
  },
} as const;

export type ArchetypeKey = keyof typeof archetypes;
export type TierKey = keyof typeof tiers;
export type ModuleKey = keyof typeof modules;
