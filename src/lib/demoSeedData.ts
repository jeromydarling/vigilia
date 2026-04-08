/**
 * demoSeedData — Realistic demo data for Vigilia Catholic eldercare.
 *
 * Provides a complete snapshot of St. Joseph's Care Home:
 * 6 residents, visit history, reflections, sacramental records,
 * weekly chapters, and volunteer schedules.
 */

export interface DemoResident {
  id: string;
  name: string;
  preferred_name: string;
  room_number: string;
  care_level: string;
  faith_tradition: string;
  parish_affiliation: string;
  admission_date: string;
  biography: string;
}

export interface DemoVisit {
  id: string;
  resident_id: string;
  visitor_name: string;
  visitor_role: string;
  mood: string;
  need: string;
  concern: string;
  voice_note_text: string;
  visited_at: string;
}

export interface DemoReflection {
  id: string;
  resident_id: string;
  text: string;
  published_at: string;
  season: string;
}

export interface DemoSacrament {
  id: string;
  resident_id: string;
  type: string;
  administered_by: string;
  date: string;
}

export interface DemoWeeklyChapter {
  id: string;
  resident_id: string;
  text: string;
  week_start: string;
}

export const DEMO_FACILITY = {
  id: 'demo-facility-001',
  name: "St. Joseph's Care Home",
  city: 'Denver, CO',
  diocese: 'Archdiocese of Denver',
};

export const DEMO_RESIDENTS: DemoResident[] = [
  {
    id: 'demo-res-001',
    name: 'Margaret Anne Williams',
    preferred_name: 'Margaret',
    room_number: '204',
    care_level: 'skilled_nursing',
    faith_tradition: 'Roman Catholic',
    parish_affiliation: 'Our Lady of Lourdes',
    admission_date: '2024-09-15',
    biography: 'Retired schoolteacher. Married 52 years to Robert (deceased 2023). Three children: Sarah, James, Elizabeth. Loves hymns, rosary, and tending houseplants.',
  },
  {
    id: 'demo-res-002',
    name: 'Joseph Francis Kowalski',
    preferred_name: 'Joe',
    room_number: '118',
    care_level: 'assisted',
    faith_tradition: 'Roman Catholic',
    parish_affiliation: 'St. Stanislaus',
    admission_date: '2025-01-10',
    biography: 'Korean War veteran. Widower. Two sons in Chicago. Plays harmonica. Tells the same three jokes every Tuesday. Polish heritage deeply tied to his faith.',
  },
  {
    id: 'demo-res-003',
    name: 'Rose Marie Delgado',
    preferred_name: 'Rosie',
    room_number: '310',
    care_level: 'memory_care',
    faith_tradition: 'Roman Catholic',
    parish_affiliation: 'Sacred Heart',
    admission_date: '2024-06-22',
    biography: 'Former church choir director for 30 years. Alzheimer\'s diagnosis 2023. Responds to music, especially Ave Maria. Daughter Maria visits Sundays.',
  },
  {
    id: 'demo-res-004',
    name: 'Thomas Edward Murphy',
    preferred_name: 'Tom',
    room_number: '215',
    care_level: 'hospice',
    faith_tradition: 'Roman Catholic',
    parish_affiliation: 'Immaculate Conception',
    admission_date: '2024-03-01',
    biography: 'Retired firefighter. Proud grandfather of 8. Wife Patricia visits daily. Entered hospice care March 2026. Family deeply faithful — rosary every evening at bedside.',
  },
  {
    id: 'demo-res-005',
    name: 'Helen Catherine O\'Brien',
    preferred_name: 'Helen',
    room_number: '127',
    care_level: 'skilled_nursing',
    faith_tradition: 'Roman Catholic',
    parish_affiliation: 'Christ the King',
    admission_date: '2025-06-14',
    biography: 'Former librarian. Voracious reader. Attends daily Mass when able. Niece Catherine is her primary contact. Sharp mind, limited mobility.',
  },
  {
    id: 'demo-res-006',
    name: 'Anthony Paul Russo',
    preferred_name: 'Tony',
    room_number: '302',
    care_level: 'assisted',
    faith_tradition: 'Roman Catholic',
    parish_affiliation: 'St. Anthony of Padua',
    admission_date: '2025-11-03',
    biography: 'Former restaurateur. Italian-American. Wife Maria passed 2024. Three daughters nearby. Loves cooking stories, Frank Sinatra, and feeding the birds outside his window.',
  },
];

export const DEMO_VISITS: DemoVisit[] = [
  // Margaret
  { id: 'dv-01', resident_id: 'demo-res-001', visitor_name: 'Sr. Ruth', visitor_role: 'chaplain', mood: 'peaceful', need: 'prayer', concern: 'no_concern', voice_note_text: 'She seemed very much at peace today. We prayed the rosary together and she held my hand through the sorrowful mysteries.', visited_at: '2026-04-07T10:30:00Z' },
  { id: 'dv-02', resident_id: 'demo-res-001', visitor_name: 'Maria C.', visitor_role: 'volunteer', mood: 'encouraged', need: 'company', concern: 'joyful_moment', voice_note_text: 'She was humming when I arrived — something from Mass. She told me about teaching second graders their first hymns. Her face just lit up.', visited_at: '2026-04-06T14:15:00Z' },
  { id: 'dv-03', resident_id: 'demo-res-001', visitor_name: 'James Williams', visitor_role: 'family', mood: 'tired', need: 'family_contact', concern: 'no_concern', voice_note_text: 'Mom was tired today but she knew me right away. She asked about the grandkids. I showed her pictures on my phone and she smiled at each one.', visited_at: '2026-04-05T16:00:00Z' },

  // Joe
  { id: 'dv-04', resident_id: 'demo-res-002', visitor_name: 'Deacon Mike', visitor_role: 'chaplain', mood: 'encouraged', need: 'sacramental_care', concern: 'no_concern', voice_note_text: 'Joe received communion today and asked me to pray for his boys in Chicago. He told me his harmonica joke again — I laughed like it was the first time.', visited_at: '2026-04-07T09:00:00Z' },
  { id: 'dv-05', resident_id: 'demo-res-002', visitor_name: 'Tom B.', visitor_role: 'volunteer', mood: 'peaceful', need: 'company', concern: 'no_concern', voice_note_text: 'We sat by the window and he played his harmonica for about twenty minutes. A couple other residents came to listen. It was really beautiful.', visited_at: '2026-04-04T15:30:00Z' },

  // Rose
  { id: 'dv-06', resident_id: 'demo-res-003', visitor_name: 'Sr. Ruth', visitor_role: 'chaplain', mood: 'peaceful', need: 'comfort', concern: 'withdrawal', voice_note_text: 'Rosie was inward today. She didn\'t speak much. But when I started humming Ave Maria she turned toward me and her eyes softened. She mouthed some of the words.', visited_at: '2026-04-07T11:00:00Z' },
  { id: 'dv-07', resident_id: 'demo-res-003', visitor_name: 'Maria Delgado', visitor_role: 'family', mood: 'lonely', need: 'family_contact', concern: 'family_strain', voice_note_text: 'Mom didn\'t recognize me at first today. That was hard. But then she reached for my hand and held it tight. I sang her favorite hymn and she seemed to come back a little.', visited_at: '2026-04-06T10:00:00Z' },

  // Tom (hospice)
  { id: 'dv-08', resident_id: 'demo-res-004', visitor_name: 'Fr. Daniel', visitor_role: 'chaplain', mood: 'peaceful', need: 'sacramental_care', concern: 'spiritual_request', voice_note_text: 'Administered the Anointing of the Sick. Tom was peaceful. Patricia was beside him. He asked me to read Psalm 23 and his lips moved with the words.', visited_at: '2026-04-07T08:00:00Z' },
  { id: 'dv-09', resident_id: 'demo-res-004', visitor_name: 'Patricia Murphy', visitor_role: 'family', mood: 'tired', need: 'prayer', concern: 'new_grief', voice_note_text: 'He slept most of today but squeezed my hand when I told him the grandkids made him a card. I read it to him. I think he heard.', visited_at: '2026-04-06T17:00:00Z' },

  // Helen
  { id: 'dv-10', resident_id: 'demo-res-005', visitor_name: 'Linda K.', visitor_role: 'volunteer', mood: 'encouraged', need: 'company', concern: 'joyful_moment', voice_note_text: 'Helen is reading Flannery O\'Connor again. She gave me a whole lecture on "A Good Man Is Hard to Find." Her mind is incredible. She asked me to bring her a new book next week.', visited_at: '2026-04-07T14:00:00Z' },

  // Tony
  { id: 'dv-11', resident_id: 'demo-res-006', visitor_name: 'Maria C.', visitor_role: 'volunteer', mood: 'lonely', need: 'company', concern: 'new_grief', voice_note_text: 'Tony was sitting by the window watching the birds. He told me about Maria\'s Sunday gravy recipe — the one she made for fifty years. His eyes got wet but he smiled through it.', visited_at: '2026-04-06T13:00:00Z' },
];

export const DEMO_REFLECTIONS: DemoReflection[] = [
  { id: 'dr-01', resident_id: 'demo-res-001', text: 'Margaret held Sister Ruth\'s hand through the sorrowful mysteries today, her lips moving quietly with each prayer. There was a deep, steady peace about her — the kind that comes from decades of faith worn smooth.', published_at: '2026-04-07T12:00:00Z', season: 'lent' },
  { id: 'dr-02', resident_id: 'demo-res-001', text: 'She was humming when the volunteer arrived — something from Sunday Mass. She told stories about teaching second graders their first hymns, and her face carried a light that no chart could capture.', published_at: '2026-04-06T16:00:00Z', season: 'lent' },
  { id: 'dr-03', resident_id: 'demo-res-001', text: 'James visited today and showed her photos of the grandchildren on his phone. She was tired, but she smiled at each face. She knew him immediately. That recognition is a gift the family can hold onto.', published_at: '2026-04-05T18:00:00Z', season: 'lent' },
  { id: 'dr-04', resident_id: 'demo-res-002', text: 'Joe received communion this morning and asked Deacon Mike to pray for his sons in Chicago. Then he told his harmonica joke — the one everyone knows by heart — and Deacon Mike laughed like it was the first time. That generosity of attention is its own kind of grace.', published_at: '2026-04-07T11:00:00Z', season: 'lent' },
  { id: 'dr-05', resident_id: 'demo-res-003', text: 'Rosie was inward today, her gaze distant. But when Sister Ruth began humming Ave Maria, she turned slowly and her eyes softened. Her lips formed some of the words. The music reached where conversation couldn\'t.', published_at: '2026-04-07T12:30:00Z', season: 'lent' },
  { id: 'dr-06', resident_id: 'demo-res-004', text: 'Father Daniel anointed Tom this morning while Patricia held his hand. He was peaceful. When Father read Psalm 23, Tom\'s lips moved with the words — the Lord is my shepherd — as if he were walking through the valley with ancient familiarity.', published_at: '2026-04-07T10:00:00Z', season: 'lent' },
  { id: 'dr-07', resident_id: 'demo-res-005', text: 'Helen is reading Flannery O\'Connor again and gave her volunteer a spirited lecture on grace and grotesque. Her mind is extraordinary. She asked for a new book next week — she finishes them faster than anyone can bring them.', published_at: '2026-04-07T16:00:00Z', season: 'lent' },
  { id: 'dr-08', resident_id: 'demo-res-006', text: 'Tony sat by the window watching the birds and told the volunteer about Maria\'s Sunday gravy — the recipe she made for fifty years. His eyes were wet but he smiled through the telling. Grief and gratitude, braided together.', published_at: '2026-04-06T15:00:00Z', season: 'lent' },
];

export const DEMO_WEEKLY_CHAPTERS: DemoWeeklyChapter[] = [
  { id: 'dwc-01', resident_id: 'demo-res-001', text: 'This week carried both tenderness and fatigue for Margaret. She prayed the rosary with Sister Ruth, held her son\'s hand while looking at photos of grandchildren, and was found humming hymns from her teaching days. The woman who taught hundreds of children to sing is still, in her own quiet way, making music.', week_start: '2026-03-30' },
  { id: 'dwc-02', resident_id: 'demo-res-004', text: 'Tom\'s week was marked by stillness and deep presence. Father Daniel anointed him on Monday. Patricia reads to him each afternoon. The grandchildren sent a card that was read aloud. His responses are smaller now — a squeeze of the hand, a movement of the lips — but each one carries the weight of a lifetime of love.', week_start: '2026-03-30' },
];

export const DEMO_SACRAMENTS: DemoSacrament[] = [
  { id: 'ds-01', resident_id: 'demo-res-001', type: 'communion', administered_by: 'Deacon Mike', date: '2026-04-06' },
  { id: 'ds-02', resident_id: 'demo-res-001', type: 'rosary', administered_by: 'Sr. Ruth', date: '2026-04-07' },
  { id: 'ds-03', resident_id: 'demo-res-002', type: 'communion', administered_by: 'Deacon Mike', date: '2026-04-07' },
  { id: 'ds-04', resident_id: 'demo-res-002', type: 'confession', administered_by: 'Fr. Daniel', date: '2026-04-03' },
  { id: 'ds-05', resident_id: 'demo-res-003', type: 'communion', administered_by: 'EM Linda K.', date: '2026-04-05' },
  { id: 'ds-06', resident_id: 'demo-res-003', type: 'blessing', administered_by: 'Sr. Ruth', date: '2026-04-07' },
  { id: 'ds-07', resident_id: 'demo-res-004', type: 'anointing_of_sick', administered_by: 'Fr. Daniel', date: '2026-04-07' },
  { id: 'ds-08', resident_id: 'demo-res-004', type: 'last_rites', administered_by: 'Fr. Daniel', date: '2026-04-01' },
  { id: 'ds-09', resident_id: 'demo-res-004', type: 'communion', administered_by: 'Deacon Mike', date: '2026-04-05' },
  { id: 'ds-10', resident_id: 'demo-res-005', type: 'communion', administered_by: 'EM Maria C.', date: '2026-04-06' },
  { id: 'ds-11', resident_id: 'demo-res-006', type: 'communion', administered_by: 'Deacon Mike', date: '2026-04-04' },
  { id: 'ds-12', resident_id: 'demo-res-006', type: 'rosary', administered_by: 'Volunteer group', date: '2026-04-02' },
];

export const DEMO_VOLUNTEERS = [
  { name: 'Maria Castellano', parish: 'Our Lady of Lourdes', ministry: 'Friendly Visitor', hours_month: 12 },
  { name: 'Tom Brennan', parish: 'St. Stanislaus', ministry: 'Eucharistic Minister', hours_month: 8 },
  { name: 'Linda Kim', parish: 'Christ the King', ministry: 'Reading Companion', hours_month: 6 },
  { name: 'Deacon Mike Reyes', parish: 'Sacred Heart', ministry: 'Eucharistic Minister', hours_month: 16 },
  { name: 'Catherine Walsh', parish: 'Immaculate Conception', ministry: 'Prayer Partner', hours_month: 4 },
];

export const DEMO_ROLES = [
  { key: 'staff', label: 'Staff', description: 'Care aide — daily visit rituals and voice notes', icon: '👤' },
  { key: 'chaplain', label: 'Chaplain', description: 'Fr. Daniel — sacraments, spiritual care, vigil', icon: '✝' },
  { key: 'volunteer', label: 'Volunteer', description: 'Maria C. — parish friendly visitor', icon: '🤝' },
  { key: 'family', label: 'Family', description: 'Sarah Williams — Margaret\'s daughter', icon: '💛' },
  { key: 'admin', label: 'Administrator', description: 'Mission leader — reports, oversight, settings', icon: '📊' },
] as const;

export type DemoRoleKey = typeof DEMO_ROLES[number]['key'];
