import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/seo/SeoHead';
import { Sun, Music, Users, HandHeart, Heart } from 'lucide-react';
import rosaryBg from '@/assets/favpng_cc25f9f12bccfd7f3ea23547764b705f.png';

/* ═══════════════════════════════════════════════════════════
   Vigilia.care — "A Liturgy of Attention"

   Design: Da Maria Roma–inspired editorial warmth.
   Warm Ignatian palette, asymmetric editorial grids,
   generous whitespace, serif-dominant typography.
   Feels like opening a prayer book, not browsing software.
   ═══════════════════════════════════════════════════════════ */

const FAMILY_QUESTIONS = [
  'How is my mom really doing today?',
  'Did anyone notice her?',
  'Is she lonely?',
  'Did she smile?',
  'Did someone pray with her?',
  'Does this place really know her?',
];

const EXAMPLE_ENTRIES = [
  { text: 'Today she seemed peaceful.', date: 'Monday', icon: Sun },
  { text: 'She brightened when music from church was mentioned.', date: 'Tuesday', icon: Music },
  { text: 'A volunteer sat with her after lunch.', date: 'Wednesday', icon: Users },
  { text: 'She asked quietly for prayer.', date: 'Thursday', icon: HandHeart },
  { text: 'Your brother visited this afternoon and she held his hand for a long time.', date: 'Friday', icon: Heart },
];

const VALUE_POINTS = [
  {
    num: '01',
    title: 'Family trust and satisfaction',
    body: 'When families can see a living story instead of sporadic updates, they worry less, call less in crisis, and are more likely to speak well of your care.',
  },
  {
    num: '02',
    title: 'Staff time on communication',
    body: 'A shared narrative stream lets one small act of attention serve many: the family, the next shift, the chaplain, and leadership.',
  },
  {
    num: '03',
    title: 'Continuity through turnover',
    body: 'Vigilia preserves the relational and spiritual story so new caregivers can read back through the weeks and meet the person, not just the chart.',
  },
  {
    num: '04',
    title: 'Visible Catholic identity',
    body: 'Real patterns of spiritual care, family accompaniment, and attention across the liturgical year — something you can show sponsors, bishops, and families.',
  },
  {
    num: '05',
    title: 'Diocese-ready reporting',
    body: 'One-click mission reports with sacramental coverage, visit frequency, volunteer participation, and ERD compliance — evidence your bishop can actually use.',
  },
];

const PLATFORM_FEATURES = [
  {
    tag: 'Vigil Mode',
    title: 'When the end comes, the journal becomes a memorial.',
    body: 'End-of-life mode heightens pastoral attention, increases family communication, and weaves the final chapter with dignity. After death, the journal becomes a keepsake the family keeps forever.',
    details: ['Tender family messaging', 'Chaplain-focused prompts', 'Sacrament tracking', 'Memorial journal'],
  },
  {
    tag: 'Weekly Digest',
    title: 'The story comes to the family.',
    body: 'Families don\'t log into apps. Each week, a digest arrives by email with selected reflections, a mood summary, and a seasonal prayer. One tap to reply with a note for Mom.',
    details: ['2-3 curated reflections', 'Mood summary', 'Seasonal prayer', 'One-tap reply'],
  },
  {
    tag: 'Mission Report',
    title: 'Turn Catholic identity from an assertion into evidence.',
    body: 'One-click reports for your bishop, sponsor, or board. Total visits, sacraments by type, sacramental coverage percentage, family engagement, volunteer hours — aligned with the ERDs (7th Edition, USCCB 2025).',
    details: ['Sacramental coverage %', 'Visit frequency metrics', 'ERD compliance note', 'Print-ready'],
  },
  {
    tag: 'Parish Volunteers',
    title: 'The first scheduling tool built for ministry.',
    body: 'Coordinate Extraordinary Ministers, friendly visitors, and prayer partners across parishes. Track Safe Environment Training, auto-generate parish bulletin summaries, and ensure no resident falls through the cracks.',
    details: ['Weekly scheduling grid', 'Multi-parish coordination', 'Bulletin text generator', 'Visit tracking'],
  },
];

/* ── SVG Illustrations ── */
function CandleSvg({ className = '', size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 30 48" fill="none" className={className} aria-hidden>
      <path d="M15 2c1.5 3 3 6 3 9-0.5 2-2 3-3 3s-2.5-1-3-3c0-3 1.5-6 3-9z" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <ellipse cx="15" cy="14" rx="1.2" ry="2" fill="currentColor" opacity="0.3" />
      <line x1="15" y1="14" x2="15" y2="20" stroke="currentColor" strokeWidth="0.8" />
      <rect x="11" y="20" width="8" height="24" rx="1" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <line x1="11" y1="26" x2="19" y2="26" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <line x1="11" y1="32" x2="19" y2="32" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <line x1="11" y1="38" x2="19" y2="38" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
      <path d="M9 44h12" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function OliveBranchSvg({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden>
      <path d="M4 32 Q30 28 60 20 Q90 12 116 8" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <ellipse cx="25" cy="26" rx="6" ry="3" transform="rotate(-20 25 26)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <ellipse cx="42" cy="22" rx="6" ry="3" transform="rotate(-15 42 22)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <ellipse cx="60" cy="18" rx="6" ry="3" transform="rotate(-12 60 18)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <ellipse cx="78" cy="14" rx="6" ry="3" transform="rotate(-10 78 14)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <ellipse cx="96" cy="10" rx="6" ry="3" transform="rotate(-8 96 10)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <circle cx="30" cy="29" r="1.5" stroke="currentColor" strokeWidth="0.4" fill="none" />
      <circle cx="52" cy="22" r="1.5" stroke="currentColor" strokeWidth="0.4" fill="none" />
      <circle cx="85" cy="13" r="1.5" stroke="currentColor" strokeWidth="0.4" fill="none" />
    </svg>
  );
}

function CrossOrnateSvg({ className = '' }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="0.8" />
      <line x1="8" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="16" cy="12" r="2" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <path d="M14 4 Q16 2 18 4" stroke="currentColor" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

/* ── Mini browser window for features section ── */
function BrowserFrame({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg overflow-hidden border border-[hsl(var(--marketing-border))] shadow-lg bg-white ${className}`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--marketing-surface))] border-b border-[hsl(var(--marketing-border)/0.6)]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--marketing-tan)/0.5)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--marketing-tan)/0.3)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--marketing-tan)/0.3)]" />
        </div>
        <div className="flex-1 mx-8">
          <div className="bg-white rounded-md px-3 py-1 text-[10px] font-sans text-[hsl(var(--marketing-tan))] text-center border border-[hsl(var(--marketing-border)/0.4)]">
            vigilia.care/{title.toLowerCase().replace(/\s+/g, '-')}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-5 sm:p-6 bg-[hsl(var(--marketing-surface))]">
        {children}
      </div>
    </div>
  );
}

/* ── Decorative divider ── */
function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 justify-center ${className}`}>
      <div className="flex-1 max-w-[80px] h-px bg-[hsl(var(--marketing-tan))]" />
      <span className="text-[hsl(var(--marketing-tan))] text-sm select-none">&#10013;</span>
      <div className="flex-1 max-w-[80px] h-px bg-[hsl(var(--marketing-tan))]" />
    </div>
  );
}

function ThinRule({ className = '' }: { className?: string }) {
  return <div className={`w-24 h-px bg-[hsl(var(--marketing-tan)/0.5)] mx-auto ${className}`} />;
}

const VigiliaLanding = React.forwardRef<HTMLDivElement>(function VigiliaLanding(_props, ref) {
  /* Scroll reveal */
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
      <SeoHead
        title="Vigilia.care — A Liturgy of Attention"
        description="A living bedside journal for Catholic eldercare. Families stay close to a loved one's daily reality through a journal built from small acts of attention by staff, chaplains, and volunteers."
        keywords={['Catholic senior care', 'pastoral care', 'elder care', 'family journal', 'nursing home', 'liturgy of attention']}
        canonical="/"
      />

      {/* ════════════════════════════════════════════════════════
          HERO — editorial, left-aligned, generous
          ════════════════════════════════════════════════════════ */}
      <section className="reveal-on-scroll">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-28 sm:pt-32 md:pt-40 pb-20 sm:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 md:col-start-1">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-8">
                Catholic Eldercare &middot; A Living Journal
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-normal text-[hsl(var(--marketing-deep))] leading-[1.08] tracking-[-0.02em] mb-10">
                A liturgy<br className="hidden sm:block" /> of attention.
              </h1>
              <p className="font-serif-body text-xl sm:text-2xl text-[hsl(var(--marketing-brown))] leading-[1.6] mb-4 max-w-[540px]">
                A little book of your loved one's days.
              </p>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] leading-[1.8] max-w-[500px] mb-12">
                Built from small acts of attention by staff, chaplains, volunteers, and parish companions —
                so families never feel far away.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button className="rounded-none border-2 border-[hsl(var(--marketing-deep))] bg-[hsl(var(--marketing-deep))] text-[hsl(var(--marketing-cream))] hover:bg-transparent hover:text-[hsl(var(--marketing-deep))] px-10 py-5 text-xs font-sans tracking-[0.18em] uppercase transition-colors duration-300 h-auto">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" className="rounded-none border-2 border-[hsl(var(--marketing-deep))] bg-transparent text-[hsl(var(--marketing-deep))] hover:bg-[hsl(var(--marketing-deep))] hover:text-[hsl(var(--marketing-cream))] px-10 py-5 text-xs font-sans tracking-[0.18em] uppercase transition-colors duration-300 h-auto">
                    Try It Out
                  </Button>
                </Link>
              </div>
            </div>
            {/* Right column — journal page illustration */}
            <div className="hidden md:flex md:col-span-4 md:col-start-9 items-center justify-center">
              <div className="relative w-full max-w-[260px]">
                {/* Shadow page behind */}
                <div className="absolute -bottom-3 -right-3 w-full h-full bg-[hsl(var(--marketing-cream))] border border-[hsl(var(--marketing-border)/0.5)]" />
                {/* Main page */}
                <div className="relative bg-white border border-[hsl(var(--marketing-border))] p-6 shadow-md" style={{ aspectRatio: '5 / 6.5' }}>
                  <div className="h-[2px] bg-[hsl(var(--marketing-gold)/0.5)] mb-5" />
                  <CrossOrnateSvg className="text-[hsl(var(--marketing-gold)/0.3)] mx-auto mb-4" />
                  <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-tan))] text-center mb-4">
                    Wednesday, March 11
                  </p>
                  <div className="space-y-3">
                    <div className="border-l border-[hsl(var(--marketing-gold)/0.3)] pl-3">
                      <p className="font-serif-body text-[11px] text-[hsl(var(--marketing-deep))] leading-[1.7] italic">
                        "She brightened when a volunteer mentioned the hymn from Sunday's Mass. She hummed a few bars."
                      </p>
                    </div>
                    <div className="border-l border-[hsl(var(--marketing-gold)/0.3)] pl-3">
                      <p className="font-serif-body text-[11px] text-[hsl(var(--marketing-deep))] leading-[1.7] italic">
                        "Your brother visited this afternoon. She held his hand for a long time and said his name clearly."
                      </p>
                    </div>
                    <div className="border-l border-[hsl(var(--marketing-gold)/0.15)] pl-3 opacity-40">
                      <p className="font-serif-body text-[11px] text-[hsl(var(--marketing-muted))] leading-[1.7] italic">
                        "She asked quietly for prayer..."
                      </p>
                    </div>
                  </div>
                  <OliveBranchSvg className="text-[hsl(var(--marketing-tan)/0.2)] mx-auto mt-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider className="my-0" />

      {/* ════════════════════════════════════════════════════════
          FAMILY QUESTIONS — asymmetric editorial
          ════════════════════════════════════════════════════════ */}
      <section className="reveal-on-scroll relative overflow-hidden">
        {/* Rosary placement 1: beads peeking from right, tilted */}
        <img src={rosaryBg} alt="" aria-hidden className="pointer-events-none absolute z-0 opacity-[0.07] w-[600px] sm:w-[800px] lg:w-[1000px]" style={{ top: '-100px', right: '-250px', transform: 'rotate(-15deg)' }} />
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left column — pull quote intro */}
            <div className="md:col-span-4">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                Every family carries these
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[hsl(var(--marketing-deep))] leading-[1.15] tracking-[-0.01em]">
                Questions that keep them up at night.
              </h2>
            </div>
            {/* Right column — staggered questions */}
            <div className="md:col-span-7 md:col-start-6 space-y-6">
              {FAMILY_QUESTIONS.map((q, i) => (
                <p
                  key={q}
                  className="font-serif-body text-xl sm:text-2xl italic text-[hsl(var(--marketing-brown))] border-l-2 border-[hsl(var(--marketing-gold-light)/0.5)] pl-6 reveal-on-scroll"
                  style={{
                    transitionDelay: `${i * 80}ms`,
                    marginLeft: [0, 16, 8, 24, 0, 12][i],
                  }}
                >
                  {q}
                </p>
              ))}
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-deep))] font-medium pt-4 pl-6">
                Vigilia answers these questions — not with data, but with a living story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHAT VIGILIA FEELS LIKE — journal entries
          ════════════════════════════════════════════════════════ */}
      <section id="the-journal" className="bg-[hsl(var(--marketing-cream)/0.88)] reveal-on-scroll">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          {/* Large pull quote */}
          <p className="font-serif-body text-2xl sm:text-3xl text-[hsl(var(--marketing-brown))] leading-[1.5] max-w-[720px] mb-20">
            A living bedside journal. Not a dashboard, a chart, a portal, or a communications utility.
            A little book of accompaniment, a family journal of presence.
          </p>

          {/* Journal entries — two-column editorial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
            {EXAMPLE_ENTRIES.map((entry, i) => {
              const Icon = entry.icon;
              return (
                <div
                  key={i}
                  className={`py-6 border-b border-[hsl(var(--marketing-border)/0.6)] reveal-on-scroll ${
                    i % 2 === 0 ? 'md:border-r md:border-[hsl(var(--marketing-border)/0.4)] md:pr-16' : ''
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-3.5 w-3.5 text-[hsl(var(--marketing-gold)/0.6)]" />
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-tan))]">
                      {entry.date}
                    </p>
                  </div>
                  <p className="font-serif-body text-lg text-[hsl(var(--marketing-deep))] leading-[1.7]">
                    {entry.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ThinRule className="my-0 py-8 bg-[hsl(var(--marketing-surface))]" />

      {/* ════════════════════════════════════════════════════════
          THE 30-SECOND RITUAL — two-column
          ════════════════════════════════════════════════════════ */}
      <section className="reveal-on-scroll" id="the-ritual">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left — text */}
            <div className="md:col-span-5">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                How it works
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal text-[hsl(var(--marketing-deep))] mb-8 leading-[1.15] tracking-[-0.01em]">
                Tap, tap, tap.<br />Voice note. Done.
              </h2>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] leading-[1.8] mb-6">
                After every visit, staff and volunteers complete a tiny ritual of attention:
                three taps — spirit, need, notice — one optional follow-up action, and a brief voice note
                guided by a daily prompt that teaches them what to see.
              </p>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] leading-[1.8]">
                Staff are not being asked to author essays. They contribute small fragments of reality
                that accumulate into the resident's living story.
              </p>
            </div>

            {/* Right — prompt card */}
            <div className="md:col-span-6 md:col-start-7 md:mt-[-1rem]">
              <div className="bg-[hsl(var(--marketing-cream))] p-10 sm:p-12 border border-[hsl(var(--marketing-border)/0.6)] relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--marketing-gold))]" />
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                  Today's prompt
                </p>
                <p className="font-serif-body text-2xl italic text-[hsl(var(--marketing-deep))] leading-[1.5] mb-6">
                  "What did their face tell you that words didn't?"
                </p>
                <p className="font-serif-body text-sm text-[hsl(var(--marketing-muted))] leading-[1.7]">
                  Prompts rotate daily across nine dimensions of attention — surprise, face,
                  family, spiritual, memory, joy, loss, daily life, accompaniment — so no two
                  days produce the same story.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES — mini browser windows showing the app
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(var(--marketing-cream)/0.88)] reveal-on-scroll">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          <div className="text-center mb-16 sm:mb-20">
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
              What it looks like
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[hsl(var(--marketing-deep))] leading-[1.15] tracking-[-0.01em]">
              Simple tools, deep attention.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Visit Ritual */}
            <div className="reveal-on-scroll" style={{ transitionDelay: '0ms' }}>
              <BrowserFrame title="visit">
                <div className="space-y-3">
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--marketing-tan))]">Visit Ritual</p>
                  <p className="font-serif text-sm text-[hsl(var(--marketing-deep))]">Margaret Williams</p>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[hsl(var(--marketing-gold)/0.15)] flex items-center justify-center text-[8px]">&#9829;</div>
                      <span className="font-sans text-xs text-[hsl(var(--marketing-muted))]">Spirit</span>
                      <div className="ml-auto flex gap-1">
                        {['Peaceful', 'Restless', 'Joyful'].map((m) => (
                          <span key={m} className={`text-[9px] font-sans px-2 py-0.5 rounded-sm border ${m === 'Peaceful' ? 'bg-[hsl(var(--marketing-gold)/0.12)] border-[hsl(var(--marketing-gold)/0.3)] text-[hsl(var(--marketing-brown))]' : 'border-[hsl(var(--marketing-border)/0.5)] text-[hsl(var(--marketing-tan))]'}`}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[hsl(var(--marketing-gold)/0.15)] flex items-center justify-center text-[8px]">&#9734;</div>
                      <span className="font-sans text-xs text-[hsl(var(--marketing-muted))]">Need</span>
                      <div className="ml-auto flex gap-1">
                        {['Comfort', 'Prayer', 'Company'].map((m) => (
                          <span key={m} className={`text-[9px] font-sans px-2 py-0.5 rounded-sm border ${m === 'Prayer' ? 'bg-[hsl(var(--marketing-gold)/0.12)] border-[hsl(var(--marketing-gold)/0.3)] text-[hsl(var(--marketing-brown))]' : 'border-[hsl(var(--marketing-border)/0.5)] text-[hsl(var(--marketing-tan))]'}`}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[hsl(var(--marketing-border)/0.3)] mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400/60 animate-pulse" />
                      <span className="font-serif-body text-xs italic text-[hsl(var(--marketing-muted))]">"She asked for prayer and seemed at peace..."</span>
                    </div>
                  </div>
                </div>
              </BrowserFrame>
              <p className="font-sans text-xs text-[hsl(var(--marketing-tan))] mt-4 text-center tracking-wide">
                The 30-second ritual
              </p>
            </div>

            {/* Family Journal */}
            <div className="reveal-on-scroll" style={{ transitionDelay: '120ms' }}>
              <BrowserFrame title="family">
                <div className="space-y-3">
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--marketing-tan))]">Lent 2026</p>
                  <p className="font-serif text-sm text-[hsl(var(--marketing-deep))]">Margaret's Journal</p>
                  <div className="space-y-3 pt-2">
                    <div className="border-l-2 border-[hsl(var(--marketing-gold)/0.3)] pl-3">
                      <p className="font-sans text-[9px] text-[hsl(var(--marketing-tan))] mb-1">Monday, March 9</p>
                      <p className="font-serif-body text-[11px] text-[hsl(var(--marketing-deep))] leading-[1.6]">She seemed peaceful today. A volunteer sat with her after lunch and they listened to hymns together.</p>
                    </div>
                    <div className="border-l-2 border-[hsl(var(--marketing-gold)/0.3)] pl-3">
                      <p className="font-sans text-[9px] text-[hsl(var(--marketing-tan))] mb-1">Wednesday, March 11</p>
                      <p className="font-serif-body text-[11px] text-[hsl(var(--marketing-deep))] leading-[1.6]">Your brother visited and she held his hand for a long time. She spoke his name clearly.</p>
                    </div>
                    <div className="border-l-2 border-[hsl(var(--marketing-gold)/0.15)] pl-3 opacity-50">
                      <p className="font-sans text-[9px] text-[hsl(var(--marketing-tan))] mb-1">Friday, March 13</p>
                      <p className="font-serif-body text-[11px] text-[hsl(var(--marketing-muted))] leading-[1.6]">She asked quietly for prayer...</p>
                    </div>
                  </div>
                </div>
              </BrowserFrame>
              <p className="font-sans text-xs text-[hsl(var(--marketing-tan))] mt-4 text-center tracking-wide">
                The family journal
              </p>
            </div>

            {/* Dashboard */}
            <div className="reveal-on-scroll" style={{ transitionDelay: '240ms' }}>
              <BrowserFrame title="dashboard">
                <div className="space-y-3">
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--marketing-tan))]">Care Overview</p>
                  <p className="font-serif text-sm text-[hsl(var(--marketing-deep))]">St. Joseph's</p>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-[hsl(var(--marketing-muted))]">Visits today</span>
                      <span className="text-[hsl(var(--marketing-deep))] font-medium">14</span>
                    </div>
                    <div className="w-full h-1 bg-[hsl(var(--marketing-border)/0.4)] rounded-full">
                      <div className="h-full w-[70%] bg-[hsl(var(--marketing-gold)/0.6)] rounded-full" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-[hsl(var(--marketing-muted))]">Loneliness watch</span>
                      <span className="text-[hsl(var(--marketing-gold-light))] font-medium">3 residents</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-sans">
                      <span className="text-[hsl(var(--marketing-muted))]">Reflections pending</span>
                      <span className="text-[hsl(var(--marketing-deep))] font-medium">6</span>
                    </div>
                    <div className="border-t border-[hsl(var(--marketing-border)/0.3)] pt-2 mt-2">
                      <p className="text-[10px] font-sans text-[hsl(var(--marketing-tan))]">Easter journal</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-[hsl(var(--marketing-border)/0.4)] rounded-full">
                          <div className="h-full w-[85%] bg-[hsl(var(--marketing-gold))] rounded-full" />
                        </div>
                        <span className="text-[9px] font-sans text-[hsl(var(--marketing-muted))]">85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </BrowserFrame>
              <p className="font-sans text-xs text-[hsl(var(--marketing-tan))] mt-4 text-center tracking-wide">
                The care dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MID-PAGE CTA — visual break with sign-up prompt
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(var(--marketing-deep)/0.92)] reveal-on-scroll">
        <div className="max-w-[900px] mx-auto px-6 sm:px-8 py-14 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <CandleSvg className="text-[hsl(var(--marketing-gold)/0.6)] hidden sm:block" size={24} />
            <p className="font-serif-body text-lg sm:text-xl text-[hsl(var(--marketing-cream))] leading-snug text-center sm:text-left">
              Ready to give families a living journal of their loved one's days?
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/demo">
              <Button variant="outline" className="rounded-none border-2 border-[hsl(var(--marketing-cream))] bg-transparent text-[hsl(var(--marketing-cream))] hover:bg-[hsl(var(--marketing-cream))] hover:text-[hsl(var(--marketing-deep))] px-8 py-4 text-xs font-sans tracking-[0.15em] uppercase transition-colors duration-300 h-auto">
                Try It Out
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-none border-2 border-[hsl(var(--marketing-cream))] bg-[hsl(var(--marketing-cream))] text-[hsl(var(--marketing-deep))] hover:bg-transparent hover:text-[hsl(var(--marketing-cream))] px-8 py-4 text-xs font-sans tracking-[0.15em] uppercase transition-colors duration-300 h-auto">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          THE PRINTED JOURNAL — editorial spread with illustrations
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(var(--marketing-cream)/0.88)] reveal-on-scroll relative">

        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
            {/* Left — text */}
            <div className="md:col-span-6">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                The Printed Journal
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal text-[hsl(var(--marketing-deep))] mb-10 leading-[1.15] tracking-[-0.01em]">
                Four times a year,<br />a small book arrives.
              </h2>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] leading-[1.8] mb-6">
                At each threshold of the Church year — Advent, Lent, Easter, Ordinary Time —
                your family receives a printed journal of the season's reflections, opened
                with a prayer and filled with the moments that mattered.
              </p>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-deep))] leading-[1.8] mb-10">
                Most apps disappear when the screen closes. A printed journal says:
                <em> this life mattered, these visits mattered, these small moments were worth keeping.</em>
              </p>
              {/* Seasons row */}
              <div className="flex flex-wrap gap-6 text-center">
                {['Advent', 'Lent', 'Easter', 'Ordinary Time'].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <CrossOrnateSvg className="text-[hsl(var(--marketing-gold)/0.5)]" />
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--marketing-tan))]">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — booklet mockup with candle illustration */}
            <div className="md:col-span-5 md:col-start-8">
              {/* Candle illustration floating above */}
              <div className="flex justify-center mb-8 text-[hsl(var(--marketing-gold)/0.35)]">
                <CandleSvg size={36} />
              </div>
              <div className="relative">
                {/* Third page (deepest) */}
                <div className="absolute -bottom-5 -right-5 w-full h-full border border-[hsl(var(--marketing-border)/0.4)] bg-[hsl(var(--marketing-surface)/0.5)]" />
                {/* Second page */}
                <div className="absolute -bottom-3 -right-3 w-full h-full border border-[hsl(var(--marketing-border)/0.7)] bg-[hsl(var(--marketing-surface))]" />
                {/* Main booklet */}
                <div className="relative bg-[hsl(var(--marketing-cream))] border border-[hsl(var(--marketing-border))] p-8 sm:p-10 text-center shadow-[-4px_6px_16px_-4px_rgba(0,0,0,0.12)] transform md:rotate-[-1.5deg]"
                  style={{ aspectRatio: '5.5 / 7' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--marketing-gold))]" />
                  <div className="flex flex-col justify-center h-full">
                    <CrossOrnateSvg className="text-[hsl(var(--marketing-gold)/0.3)] mx-auto mb-3" />
                    <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-tan))] mb-4">
                      Seasonal Journal
                    </p>
                    <p className="font-serif text-lg text-[hsl(var(--marketing-deep))] mb-1">
                      Margaret Anne Williams
                    </p>
                    <p className="font-sans text-xs text-[hsl(var(--marketing-muted))] mb-6 tracking-wide">
                      Easter 2026 &middot; St. Joseph's Care Home
                    </p>
                    <OliveBranchSvg className="text-[hsl(var(--marketing-tan)/0.25)] mx-auto mb-4" />
                    <p className="font-serif-body text-sm italic text-[hsl(var(--marketing-muted))] leading-relaxed px-2">
                      "This week carried both tenderness and fatigue. She seemed more inward than usual,
                      but moments of warmth returned through prayer, familiar music, and family presence."
                    </p>
                    <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mt-8">
                      5.5" &times; 8.5" &middot; Saddle-stitched &middot; Included
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CONTINUITY + FORMATION — side by side, editorial
          ════════════════════════════════════════════════════════ */}
      <section id="continuity" className="reveal-on-scroll relative overflow-hidden">
        {/* Rosary placement 2: chain curving from left edge, mirrored */}
        <img src={rosaryBg} alt="" aria-hidden className="pointer-events-none absolute z-0 opacity-[0.06] w-[700px] sm:w-[900px] lg:w-[1100px]" style={{ top: '-80px', left: '-300px', transform: 'rotate(25deg) scaleX(-1)' }} />
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
            {/* Left — Continuity */}
            <div className="border-t-2 border-[hsl(var(--marketing-gold)/0.4)] pt-10">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                Continuity
              </p>
              {/* Illustration: timeline of care handoffs */}
              <div className="mb-8 flex items-center gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                  <div key={d} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[9px] font-sans ${
                      i < 3
                        ? 'border-[hsl(var(--marketing-gold)/0.5)] bg-[hsl(var(--marketing-gold)/0.08)] text-[hsl(var(--marketing-brown))]'
                        : 'border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-cream))] text-[hsl(var(--marketing-muted))]'
                    }`}>
                      {i < 3 ? 'SR' : 'JM'}
                    </div>
                    <span className="text-[8px] font-sans text-[hsl(var(--marketing-tan))] tracking-wide">{d}</span>
                    {i < 4 && <div className="hidden sm:block absolute" />}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-8">
                <div className="flex-1 h-px bg-[hsl(var(--marketing-gold)/0.3)]" />
                <span className="text-[8px] font-sans tracking-[0.2em] uppercase text-[hsl(var(--marketing-tan))]">story continues</span>
                <div className="flex-1 h-px bg-[hsl(var(--marketing-gold)/0.3)]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[hsl(var(--marketing-deep))] mb-8 leading-[1.2] tracking-[-0.01em]">
                When care changes hands, the story stays.
              </h2>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] leading-[1.8] mb-6">
                One caregiver leaves. Another arrives. They don't inherit a blank slate —
                they inherit a living chapter. The next person steps into the story where it left off.
              </p>
              <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.8]">
                That is one of the deepest practical benefits of narrative continuity
                in long-term care.
              </p>
            </div>
            {/* Right — Formation */}
            <div className="border-t-2 border-[hsl(var(--marketing-gold)/0.4)] pt-10">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                Formation
              </p>
              {/* Illustration: attention dimensions */}
              <div className="mb-8 grid grid-cols-3 gap-2">
                {['Surprise', 'Face', 'Family', 'Spiritual', 'Memory', 'Joy', 'Loss', 'Daily Life', 'Accompany'].map((dim, i) => (
                  <div
                    key={dim}
                    className="text-center py-2.5 px-1 border border-[hsl(var(--marketing-border)/0.5)] bg-[hsl(var(--marketing-cream)/0.5)]"
                    style={{ opacity: 0.5 + (i % 3) * 0.2 }}
                  >
                    <span className="text-[9px] font-sans tracking-wide text-[hsl(var(--marketing-brown))]">{dim}</span>
                  </div>
                ))}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[hsl(var(--marketing-deep))] mb-8 leading-[1.2] tracking-[-0.01em]">
                Vigilia forms better witnesses of a person's life.
              </h2>
              <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] leading-[1.8] mb-6">
                Most senior-care systems teach people to document events.
                Vigilia teaches them to notice human moments faithfully.
              </p>
              <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.8]">
                Every visit becomes part of a living family journal.
                A liturgy of attention for the people entrusted with care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          THE FULL PLATFORM — feature showcase
          ════════════════════════════════════════════════════════ */}
      <section id="platform" className="bg-[hsl(var(--marketing-cream)/0.88)] reveal-on-scroll">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          <div className="text-center mb-16">
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
              Beyond the journal
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal text-[hsl(var(--marketing-deep))] leading-[1.15] tracking-[-0.01em] max-w-[640px] mx-auto">
              A complete platform for Catholic eldercare.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {PLATFORM_FEATURES.map((feat, i) => (
              <div
                key={feat.tag}
                className="bg-[hsl(var(--marketing-surface))] border border-[hsl(var(--marketing-border)/0.6)] p-8 sm:p-10 relative reveal-on-scroll"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--marketing-gold)/0.4)]" />
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-gold-light))] mb-4">
                  {feat.tag}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[hsl(var(--marketing-deep))] mb-4 leading-[1.25]">
                  {feat.title}
                </h3>
                <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7] mb-6">
                  {feat.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {feat.details.map((d) => (
                    <span key={d} className="text-[10px] font-sans px-3 py-1 border border-[hsl(var(--marketing-border)/0.5)] text-[hsl(var(--marketing-brown))] tracking-wide">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sacrament tracker callout */}
          <div className="mt-10 md:mt-12 bg-[hsl(var(--marketing-surface))] border border-[hsl(var(--marketing-border)/0.6)] p-8 sm:p-10 relative reveal-on-scroll">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--marketing-gold))]" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--marketing-gold-light))] mb-4">
                  Sacrament Tracker
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[hsl(var(--marketing-deep))] mb-4 leading-[1.25]">
                  Every communion, confession, anointing — documented.
                </h3>
                <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">
                  No nursing home EHR tracks sacramental care. Vigilia does. Log communion visits,
                  confession availability, Anointing of the Sick, Last Rites, rosary, and blessings
                  with date, minister, and notes. Know which residents haven't received communion in two weeks.
                  Give your chaplain a dashboard, not a clipboard.
                </p>
              </div>
              <div className="md:col-span-4 md:col-start-9">
                <div className="space-y-3">
                  {[
                    { sac: 'Holy Communion', count: '142', period: 'this season' },
                    { sac: 'Anointing of the Sick', count: '8', period: 'this season' },
                    { sac: 'Confession', count: '23', period: 'this season' },
                    { sac: 'Last Rites', count: '2', period: 'this season' },
                  ].map((row) => (
                    <div key={row.sac} className="flex items-center justify-between py-2 border-b border-[hsl(var(--marketing-border)/0.3)]">
                      <span className="text-sm font-serif-body text-[hsl(var(--marketing-deep))]">{row.sac}</span>
                      <span className="text-sm font-sans text-[hsl(var(--marketing-muted))]">{row.count}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-sans text-[hsl(var(--marketing-tan))]">Sacramental coverage</span>
                    <span className="text-sm font-semibold font-sans text-[hsl(var(--marketing-deep))]">94%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          VALUE & ROI — editorial two-column
          ════════════════════════════════════════════════════════ */}
      <section id="pricing" className="reveal-on-scroll">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left — price callout */}
            <div className="md:col-span-4">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
                For administrators &amp; mission leaders
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[hsl(var(--marketing-deep))] mb-8 leading-[1.15] tracking-[-0.01em]">
                A small line item. A big change in how care feels.
              </h2>
              <p className="font-serif text-5xl font-normal text-[hsl(var(--marketing-deep))] mb-3 tracking-[-0.02em]">
                $499
              </p>
              <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">
                Per community, per month.<br />
                About $13 a day. Seasonal printed journals included for every resident's family.
              </p>
            </div>

            {/* Right — value points */}
            <div className="md:col-span-7 md:col-start-6">
              <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] mb-10">
                You're not buying another system. You're buying relief in five places you already feel pressure:
              </p>
              <div className="space-y-8">
                {VALUE_POINTS.map((vp) => (
                  <div key={vp.title} className="grid grid-cols-[40px_1fr] gap-4 reveal-on-scroll" style={{ transitionDelay: '50ms' }}>
                    <span className="font-sans text-xs tracking-[0.2em] text-[hsl(var(--marketing-tan))] pt-1">
                      {vp.num}
                    </span>
                    <div className="border-b border-[hsl(var(--marketing-border)/0.5)] pb-6">
                      <h3 className="font-sans text-sm font-semibold text-[hsl(var(--marketing-deep))] mb-2 tracking-wide">
                        {vp.title}
                      </h3>
                      <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">
                        {vp.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-[hsl(var(--marketing-cream))] p-8 border border-[hsl(var(--marketing-border)/0.5)] relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-[hsl(var(--marketing-gold)/0.4)]" />
                <p className="font-serif-body text-base italic text-[hsl(var(--marketing-brown))] leading-[1.7]">
                  "If Vigilia prevents one family from leaving early, one potential lawsuit,
                  or a fraction of your staff time spent on repetitive updates, it has already paid for itself."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WORD OF MOUTH — full-bleed cream, large quote
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(var(--marketing-cream)/0.88)] reveal-on-scroll">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8 py-16 sm:py-20 md:py-24 text-center">
          <div className="w-16 h-px bg-[hsl(var(--marketing-tan))] mx-auto mb-12" />
          <p className="font-serif-body text-2xl sm:text-3xl italic text-[hsl(var(--marketing-brown))] leading-[1.5] mb-6">
            "This place has an app where every visit becomes part of my dad's story.
            I can actually feel what his days are like."
          </p>
          <div className="w-16 h-px bg-[hsl(var(--marketing-tan))] mx-auto mt-12 mb-8" />
          <p className="font-serif-body text-sm text-[hsl(var(--marketing-muted))]">
            That is a much more compelling testimonial than "they have good communication software."
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA — inverted deep brown, book-end
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(var(--marketing-deep)/0.92)] reveal-on-scroll relative overflow-hidden">
        {/* Rosary placement 3: rotated so the cross appears, right side */}
        <img src={rosaryBg} alt="" aria-hidden className="pointer-events-none absolute z-0 opacity-[0.12] w-[500px] sm:w-[700px] lg:w-[900px] invert" style={{ bottom: '-120px', right: '-200px', transform: 'rotate(40deg)' }} />
        <div className="relative z-10 max-w-[680px] mx-auto px-6 sm:px-8 py-20 sm:py-24 md:py-32 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] font-normal text-[hsl(var(--marketing-cream))] mb-10 leading-[1.15] tracking-[-0.01em]">
            A liturgy of attention,<br />bound into memory.
          </h2>
          <p className="font-serif-body text-lg text-[hsl(var(--marketing-tan))] leading-[1.8] max-w-md mx-auto mb-12">
            The visit ritual. The family journal. Vigil mode. Sacrament tracking.
            Diocese reporting. Parish volunteer coordination. Everything a Catholic
            care community needs to make its identity visible and its families close.
          </p>
          <Link to="/signup">
            <Button className="rounded-none border-2 border-[hsl(var(--marketing-cream))] bg-[hsl(var(--marketing-cream))] text-[hsl(var(--marketing-deep))] hover:bg-transparent hover:text-[hsl(var(--marketing-cream))] px-10 py-5 text-xs font-sans tracking-[0.18em] uppercase transition-colors duration-300 h-auto">
              Sign Up
            </Button>
          </Link>
        </div>
      </section>
      </div>{/* end content z-10 wrapper */}
    </div>
  );
});

export default VigiliaLanding;
