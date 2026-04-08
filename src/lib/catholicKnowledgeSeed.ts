/**
 * catholicKnowledgeSeed — Seed data for the Catholic health knowledge base.
 *
 * Sources:
 * - USCCB Ethical and Religious Directives for Catholic Health Care Services (7th Edition, 2025)
 * - CHA Essential Services for Spiritual Care (2022)
 * - CHA Ministry Identity Assessment / Shared Statement of Identity
 * - CHA 2025 Spiritual Care Survey
 */

export interface KnowledgeSeedEntry {
  source: string;
  source_reference: string;
  topic: string;
  title: string;
  content: string;
  application_note: string;
  relevance_tags: string[];
  sort_order: number;
}

export const KNOWLEDGE_SEED: KnowledgeSeedEntry[] = [
  // ═══════════════════════════════════════════════════
  // ERD — Part One: General Introduction
  // ═══════════════════════════════════════════════════
  {
    source: 'erd_7th_edition',
    source_reference: 'Part One Introduction',
    topic: 'catholic_identity',
    title: 'The Catholic health ministry as continuation of Christ\'s healing',
    content: 'The Catholic health care ministry is rooted in a commitment to promote and defend human dignity. This is the foundation of its concern to respect the sacredness of every human life from the moment of conception until death. The Church\'s healing ministry is an extension of Christ\'s mission, carried out through institutions committed to compassionate care.',
    application_note: 'Every visit ritual in Vigilia is an act of this healing ministry. The 30-second capture is not documentation — it is participation in Christ\'s mission of attention to the suffering.',
    relevance_tags: ['identity', 'mission', 'dignity'],
    sort_order: 1,
  },

  // ═══════════════════════════════════════════════════
  // ERD — Part Three: Professional-Patient Relationship
  // ═══════════════════════════════════════════════════
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 31',
    topic: 'spiritual_care',
    title: 'Right to information and spiritual counsel',
    content: 'The free and informed health care decision of the person or the person\'s surrogate is to be followed so long as it does not contradict Catholic principles. Patients should be provided with the spiritual means to prepare for death, including the opportunity to receive the sacraments.',
    application_note: 'Vigilia\'s sacrament tracker ensures no resident is denied access to spiritual preparation. The dashboard flags residents who haven\'t received communion in 14+ days.',
    relevance_tags: ['sacraments', 'patient_rights', 'spiritual_preparation'],
    sort_order: 10,
  },
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 35',
    topic: 'family_engagement',
    title: 'Family participation in care decisions',
    content: 'The well-being of the whole person requires that family members and loved ones be involved as appropriate in the care of the patient. Catholic health care institutions should make every effort to foster family involvement and communication.',
    application_note: 'The weekly family digest and family journal portal exist to fulfill this directive. Families who receive regular narrative updates are more involved in care decisions and experience less anxiety.',
    relevance_tags: ['family', 'communication', 'involvement'],
    sort_order: 11,
  },

  // ═══════════════════════════════════════════════════
  // ERD — Part Five: Care for the Seriously Ill and Dying
  // ═══════════════════════════════════════════════════
  {
    source: 'erd_7th_edition',
    source_reference: 'Part Five Introduction',
    topic: 'end_of_life',
    title: 'The dying person\'s right to spiritual care',
    content: 'Christ\'s redemption and salvation include the promise of bodily resurrection. The Church\'s teaching affirms that life is a gift from God and that we are stewards, not owners, of the life God has entrusted to us. Catholic health care institutions must provide patients with the spiritual means to prepare for death.',
    application_note: 'Vigil Mode is Vigilia\'s response to this directive. When a resident enters their final days, the app shifts to heightened pastoral attention, increased family communication, and sacramental readiness.',
    relevance_tags: ['end_of_life', 'dying', 'vigil', 'spiritual_preparation'],
    sort_order: 20,
  },
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 55',
    topic: 'end_of_life',
    title: 'Catholic identity in end-of-life care',
    content: 'Catholic health care institutions should provide the means for patients to receive the sacrament of the Anointing of the Sick and Viaticum. They should ensure that patients are given the opportunity to receive these sacraments in a timely manner and that pastoral care personnel are available.',
    application_note: 'Vigilia tracks Anointing of the Sick and Last Rites administration with date, minister, and notes. The sacrament tracker alerts chaplains when a hospice resident has not received anointing.',
    relevance_tags: ['anointing', 'viaticum', 'last_rites', 'hospice'],
    sort_order: 21,
  },
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 56',
    topic: 'end_of_life',
    title: 'Ordinary and extraordinary means of preserving life',
    content: 'A person may forgo extraordinary or disproportionate means of preserving life. Disproportionate means are those that in the patient\'s judgment do not offer a reasonable hope of benefit or entail an excessive burden, or impose excessive expense on the family or the community.',
    application_note: 'Vigilia does not make clinical decisions. But the visit ritual captures the spiritual and emotional context that informs these decisions — the resident\'s peace, their family\'s presence, their expressed wishes.',
    relevance_tags: ['end_of_life', 'proportionate_means', 'care_decisions'],
    sort_order: 22,
  },
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 58',
    topic: 'palliative_care',
    title: 'Palliative care and comfort',
    content: 'Patients should be kept as free of pain as possible so that they may die comfortably and with dignity, and in the place where they wish to die. The truth about their condition should be communicated in a way that respects their right to know.',
    application_note: 'The visit ritual\'s mood observation (peaceful/anxious/tired) helps track comfort over time. The family journal communicates the resident\'s daily reality with honesty and gentleness.',
    relevance_tags: ['palliative', 'comfort', 'dignity', 'pain_management'],
    sort_order: 23,
  },
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 61',
    topic: 'end_of_life',
    title: 'Pastoral care for the dying',
    content: 'Pastoral care personnel should be available to minister to the dying and their families. They should help patients and families deal with questions about death and dying, provide spiritual support, and facilitate access to the sacraments.',
    application_note: 'Vigilia\'s chaplain assignment system ensures every facility has pastoral coverage. Vigil Mode prompts focus chaplain attention on presence, prayer, and sacramental readiness.',
    relevance_tags: ['pastoral_care', 'chaplain', 'dying', 'family_support'],
    sort_order: 24,
  },

  // ═══════════════════════════════════════════════════
  // ERD — Sacramental Care
  // ═══════════════════════════════════════════════════
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 12',
    topic: 'sacramental_care',
    title: 'Provision of the sacraments',
    content: 'Catholic health care institutions should make the sacraments and other spiritual ministries available to patients and staff. Special attention should be given to providing for the sacrament of the Anointing of the Sick and the sacrament of Penance.',
    application_note: 'Vigilia tracks all sacrament types: communion, confession, anointing, last rites, rosary, blessings. The Diocese Report aggregates sacramental coverage percentage across the facility.',
    relevance_tags: ['sacraments', 'anointing', 'confession', 'communion', 'provision'],
    sort_order: 30,
  },
  {
    source: 'erd_7th_edition',
    source_reference: 'Directive 13',
    topic: 'sacramental_care',
    title: 'Eucharistic ministry to the sick',
    content: 'Catholic health care institutions should ensure that patients have regular access to the Eucharist. Extraordinary Ministers of Holy Communion may be employed to bring communion to patients who cannot attend Mass.',
    application_note: 'The Parish Volunteer Portal coordinates Extraordinary Ministers across parishes and facilities. Weekly scheduling ensures consistent communion delivery to all residents.',
    relevance_tags: ['communion', 'eucharistic_minister', 'volunteer', 'parish'],
    sort_order: 31,
  },

  // ═══════════════════════════════════════════════════
  // CHA — Essential Services for Spiritual Care (2022)
  // ═══════════════════════════════════════════════════
  {
    source: 'cha_essential_services',
    source_reference: 'Category 1: Spiritual Health Assessment',
    topic: 'spiritual_care',
    title: 'Spiritual health assessment for all residents',
    content: 'Every patient/resident should receive a spiritual health screening upon admission and a comprehensive spiritual assessment as clinically indicated. Spiritual care should be integrated into the interdisciplinary care plan.',
    application_note: 'Vigilia\'s resident profile includes faith tradition, parish affiliation, and faith history (baptism, communion, confirmation). The visit ritual\'s daily prompts provide ongoing spiritual assessment through observation.',
    relevance_tags: ['assessment', 'screening', 'admission', 'care_plan'],
    sort_order: 40,
  },
  {
    source: 'cha_essential_services',
    source_reference: 'Category 2: Sacramental and Worship',
    topic: 'sacramental_care',
    title: 'Access to sacraments and worship',
    content: 'Continuing care facilities should provide regular access to Mass, the sacraments, and communal prayer. This includes communion services, anointing of the sick, reconciliation, and devotional practices such as the rosary.',
    application_note: 'The sacrament tracker documents all of these. The Diocese Report provides evidence of compliance with this standard.',
    relevance_tags: ['sacraments', 'mass', 'worship', 'rosary', 'devotion'],
    sort_order: 41,
  },
  {
    source: 'cha_essential_services',
    source_reference: 'Category 3: Pastoral Presence',
    topic: 'spiritual_care',
    title: 'Ongoing pastoral presence and visitation',
    content: 'Spiritual care providers should maintain a visible, consistent presence in the facility. Regular pastoral visits help residents feel accompanied in their spiritual journey, especially during times of transition, illness, or grief.',
    application_note: 'Vigilia\'s visit ritual is the primary mechanism for documenting pastoral presence. The loneliness watch / drift detection system ensures no resident goes unvisited for extended periods.',
    relevance_tags: ['visitation', 'presence', 'companionship', 'loneliness'],
    sort_order: 42,
  },
  {
    source: 'cha_essential_services',
    source_reference: 'Category 4: End-of-Life Spiritual Care',
    topic: 'end_of_life',
    title: 'Spiritual support for dying residents and families',
    content: 'Facilities should provide intensified spiritual support for residents approaching death and their families. This includes ensuring access to Last Rites, facilitating family presence, and offering bereavement support.',
    application_note: 'Vigil Mode activates this intensified care. Family messaging, daily updates, sacrament tracking, and memorial journal generation all serve this standard.',
    relevance_tags: ['end_of_life', 'vigil', 'bereavement', 'family', 'last_rites'],
    sort_order: 43,
  },
  {
    source: 'cha_essential_services',
    source_reference: 'Category 5: Staff and Volunteer Support',
    topic: 'spiritual_care',
    title: 'Formation and support for caregivers',
    content: 'Spiritual care should extend to staff and volunteers. Facilities should provide opportunities for faith formation, prayer, and reflection for those who provide direct care.',
    application_note: 'Vigilia\'s daily voice prompts serve as a formation practice. The rotating Ignatian-inspired prompts teach staff and volunteers to notice human moments — what surprised them, where grace appeared, what the family would want to know.',
    relevance_tags: ['formation', 'staff', 'volunteer', 'prayer', 'ignatian'],
    sort_order: 44,
  },
  {
    source: 'cha_essential_services',
    source_reference: 'Category 6: Family Communication',
    topic: 'family_engagement',
    title: 'Proactive family spiritual communication',
    content: 'Families should receive regular communication about their loved one\'s spiritual well-being, not only clinical updates. Facilities should create channels for families to participate in the spiritual life of the resident even when they cannot visit.',
    application_note: 'The weekly family digest email, family journal portal, and family memory upload feature all fulfill this standard. The printed seasonal journal is the ultimate expression of it.',
    relevance_tags: ['family', 'communication', 'journal', 'digest', 'engagement'],
    sort_order: 45,
  },

  // ═══════════════════════════════════════════════════
  // CHA — Ministry Identity Assessment
  // ═══════════════════════════════════════════════════
  {
    source: 'cha_identity',
    source_reference: 'Shared Statement of Identity',
    topic: 'catholic_identity',
    title: 'We are Catholic',
    content: 'Catholic health care ministry is an expression of the healing ministry of Jesus Christ. We are called to be a transforming, healing presence within our communities, bringing together people of diverse faiths and backgrounds in a shared commitment to compassionate care.',
    application_note: 'Vigilia makes this identity visible through documented pastoral care, sacramental records, and family narratives. The Mission Report provides evidence of Catholic identity in action — not just policy documents.',
    relevance_tags: ['identity', 'mission', 'catholic', 'healing'],
    sort_order: 50,
  },
  {
    source: 'cha_identity',
    source_reference: 'Shared Statement of Identity',
    topic: 'catholic_identity',
    title: 'We act in communion with the Church',
    content: 'Catholic health care ministries act in communion with the Church through collaboration with bishops, religious sponsors, and the broader Catholic health community. They uphold the Ethical and Religious Directives as normative standards.',
    application_note: 'The Diocese Report generator creates evidence-based reports that bishops and sponsors can actually use. Sacramental coverage percentages, visit frequency, and volunteer participation are the metrics that demonstrate communion.',
    relevance_tags: ['bishop', 'diocese', 'communion', 'erd_compliance'],
    sort_order: 51,
  },
  {
    source: 'cha_identity',
    source_reference: 'Shared Statement of Identity',
    topic: 'catholic_identity',
    title: 'We promote and defend human dignity',
    content: 'Every person is created in the image of God and possesses inherent dignity that must be respected throughout life, from conception to natural death. Special care is owed to the most vulnerable — the elderly, the dying, the forgotten.',
    application_note: 'The loneliness watch and drift detection system exists because of this principle. No resident should drift into isolation without someone being alerted. The journal itself is an act of dignifying — saying this life mattered, these moments were worth keeping.',
    relevance_tags: ['dignity', 'vulnerable', 'elderly', 'dying', 'isolation'],
    sort_order: 52,
  },

  // ═══════════════════════════════════════════════════
  // CHA — 2025 Spiritual Care Survey Findings
  // ═══════════════════════════════════════════════════
  {
    source: 'cha_spiritual_survey',
    source_reference: '2025 Survey Finding',
    topic: 'spiritual_care',
    title: 'No consistent documentation standard exists',
    content: 'The 2025 CHA/CARA Spiritual Care Survey found that Catholic health ministries lack a consistent, widely-adopted language for spiritual care assessment, documentation, and communication. Most facilities rely on ad hoc methods with no standardized metrics.',
    application_note: 'Vigilia\'s visit ritual (spirit/need/notice/route/story) is a proposed standard for spiritual care documentation in eldercare. The 9 prompt categories (surprise, face, family, spiritual, memory, joy, loss, daily life, accompaniment) provide the consistent language the survey found missing.',
    relevance_tags: ['documentation', 'standardization', 'assessment', 'survey'],
    sort_order: 60,
  },
  {
    source: 'cha_spiritual_survey',
    source_reference: '2025 Survey Finding',
    topic: 'spiritual_care',
    title: 'Chaplain staffing is declining',
    content: 'The survey revealed that the number of board-certified chaplains serving Catholic health facilities has declined. Many facilities rely on part-time chaplains, deacons, religious sisters, and trained volunteers for spiritual care delivery.',
    application_note: 'Vigilia\'s parish volunteer coordination and chaplain assignment systems are designed for this reality. The app doesn\'t require a full-time chaplain — it amplifies the attention of whoever is present: staff, volunteers, family, deacons.',
    relevance_tags: ['chaplain', 'staffing', 'volunteer', 'deacon'],
    sort_order: 61,
  },
  {
    source: 'cha_spiritual_survey',
    source_reference: '2025 Survey Finding',
    topic: 'catholic_identity',
    title: 'Lay leadership needs mission formation tools',
    content: 'As religious orders that historically ran facilities shrink, lay leaders increasingly manage Catholic health ministries. These leaders struggle with integrating mission within an increasingly diverse culture and need practical tools for demonstrating Catholic identity.',
    application_note: 'Vigilia is that tool. The daily prompts are formation. The Diocese Report is evidence. The printed journal is witness. Lay leaders don\'t need theology degrees — they need a system that makes Catholic identity visible in daily operations.',
    relevance_tags: ['lay_leadership', 'mission', 'formation', 'identity'],
    sort_order: 62,
  },
];
