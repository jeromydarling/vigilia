/**
 * Archetype Comparisons — Content for /compare/:slug pages.
 *
 * WHAT: Archetype-specific comparison narratives showing Vigilia vs traditional approaches.
 * WHERE: Powers CompareArchetypePage at /compare/:slug.
 * WHY: SEO authority through archetype-specific comparison content.
 */

export interface ComparisonRow {
  dimension: string;
  traditional: string;
  vigilia: string;
}

export interface ArchetypeComparison {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  archetypeKey: string;
  intro: string;
  rows: ComparisonRow[];
  closing: string;
}

export const archetypeComparisons: ArchetypeComparison[] = [
  {
    slug: 'church-vs-spreadsheets',
    title: 'Parish Outreach vs Spreadsheets',
    description: 'Churches often rely on spreadsheets and email chains for pastoral care. See how Vigilia™ replaces scattered tools with relationship memory.',
    keywords: ['church CRM', 'parish management', 'pastoral care software', 'church spreadsheet alternative'],
    archetypeKey: 'church',
    intro: 'Most churches track attendance in spreadsheets, prayer requests in email chains, and volunteer hours on paper sign-up sheets. The information exists — but the story gets lost between tabs.',
    rows: [
      { dimension: 'Pastoral Follow-up', traditional: 'Sticky notes and memory', vigilia: 'NRI gently flags who needs a visit' },
      { dimension: 'Newcomer Tracking', traditional: 'Connection cards filed in a drawer', vigilia: 'Journey chapters that show the arc of belonging' },
      { dimension: 'Volunteer Hours', traditional: 'Paper sign-up sheets', vigilia: 'Voluntarium with automatic recognition' },
      { dimension: 'Community Awareness', traditional: 'Word of mouth at staff meetings', vigilia: 'Signum monitors local news and events' },
      { dimension: 'Ministry Reflection', traditional: 'Annual reports from memory', vigilia: 'Reflections captured in real-time, narratives generated weekly' },
      { dimension: 'Hospital Visits', traditional: 'Pastor remembers (or forgets)', vigilia: 'Visitor voice notes logged in 30 seconds' },
    ],
    closing: 'A spreadsheet can store data. It cannot remember that Marcus was stressed, that the Garza family returned, or that the food pantry needs restocking. Vigilia™ remembers.',
  },
  {
    slug: 'nonprofit-vs-bloated-crm',
    title: 'Nonprofit Programs vs Bloated CRMs',
    description: 'Enterprise CRMs force nonprofits into sales pipelines. Vigilia™ was designed for mission-driven relationship work — not deal tracking.',
    keywords: ['nonprofit CRM alternative', 'Salesforce alternative nonprofit', 'mission-driven CRM', 'community relationship tool'],
    archetypeKey: 'digital_inclusion',
    intro: 'Most enterprise CRMs were designed to track sales pipelines — not community relationships. Nonprofits end up paying for features they don\'t need while missing the ones they do.',
    rows: [
      { dimension: 'Core Model', traditional: 'Sales pipeline with stages', vigilia: 'Journey chapters with human milestones' },
      { dimension: 'Contact Records', traditional: 'Lead scoring and deal values', vigilia: 'Relationship memory and reflections' },
      { dimension: 'Reporting', traditional: 'Revenue dashboards', vigilia: 'Narrative summaries and story exports' },
      { dimension: 'Mobile Experience', traditional: 'Scaled-down desktop app', vigilia: 'Mobile-first with voice notes' },
      { dimension: 'Community Signals', traditional: 'Not available', vigilia: 'Signum monitors local shifts automatically' },
      { dimension: 'Pricing', traditional: '$25-150/user/month', vigilia: 'Mission-friendly tiers starting at Core' },
    ],
    closing: 'You shouldn\'t need a Salesforce administrator to remember that Mrs. Rivera\'s kids are doing homework online for the first time.',
  },
  {
    slug: 'social-enterprise-vs-pipeline',
    title: 'Social Enterprise vs Pipeline Tools',
    description: 'Social enterprises need more than deal tracking. Vigilia™ connects mission impact with partner relationships in one calm system.',
    keywords: ['social enterprise CRM', 'impact tracking', 'mission-driven business tools', 'community commerce'],
    archetypeKey: 'social_enterprise',
    intro: 'Pipeline tools measure conversion rates. Social enterprises need to measure something harder: whether the community is actually better off.',
    rows: [
      { dimension: 'Success Metric', traditional: 'Deal closed / revenue', vigilia: 'Relationship deepened / community impact' },
      { dimension: 'Partner View', traditional: 'Account with dollar value', vigilia: 'Journey with narrative context' },
      { dimension: 'Team Coordination', traditional: 'Assigned leads', vigilia: 'Shepherd / Companion / Visitor roles' },
      { dimension: 'Intelligence', traditional: 'AI-generated sales emails', vigilia: 'NRI-powered narrative awareness' },
      { dimension: 'Community Context', traditional: 'None', vigilia: 'Signum and Metro Narrative' },
      { dimension: 'Reporting', traditional: 'Pipeline forecasts', vigilia: 'Impact narratives and story exports' },
    ],
    closing: 'If your mission is community impact, your tools should measure community impact — not just revenue.',
  },
];
