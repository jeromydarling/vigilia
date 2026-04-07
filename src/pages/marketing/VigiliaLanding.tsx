import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/seo/SeoHead';
import { ArrowRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Vigilia.care — "A Liturgy of Attention"

   This is NOT a SaaS product page. It is a family story page.
   It should feel like opening a prayer book, not browsing software.
   Every section leads with emotion, not features.

   Content sourced from Perplexity AI strategy thread.
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
  'Today she seemed peaceful.',
  'She brightened when music from church was mentioned.',
  'A volunteer sat with her after lunch.',
  'She asked quietly for prayer.',
  'Your brother visited this afternoon and she held his hand for a long time.',
];

const VALUE_POINTS = [
  {
    title: 'Family trust and satisfaction',
    body: 'When families can see a living story instead of sporadic updates, they worry less, call less in crisis, and are more likely to speak well of your care.',
  },
  {
    title: 'Staff time on communication',
    body: 'A shared narrative stream lets one small act of attention serve many: the family, the next shift, the chaplain, and leadership — saving minutes every day that add up to more than $13.',
  },
  {
    title: 'Continuity through turnover',
    body: 'Vigilia preserves the relational and spiritual story so new caregivers can read back through the weeks and meet the person, not just the chart.',
  },
  {
    title: 'Visible Catholic identity',
    body: 'Vigilia gives you something you can show sponsors, bishops, and families: real patterns of spiritual care, family accompaniment, and attention across the liturgical year.',
  },
  {
    title: 'Reputation and referrals',
    body: 'Families who receive a seasonal journal of their loved one\'s days are far more likely to say, "This place really sees my mom."',
  },
];

const VigiliaLanding = React.forwardRef<HTMLDivElement>(function VigiliaLanding(_props, ref) {
  return (
    <div ref={ref} className="bg-white">
      <SeoHead
        title="Vigilia.care — A Liturgy of Attention"
        description="A living bedside journal for Catholic eldercare. Families stay close to a loved one's daily reality through a journal built from small acts of attention by staff, chaplains, and volunteers."
        keywords={['Catholic senior care', 'pastoral care', 'elder care', 'family journal', 'nursing home', 'liturgy of attention']}
        canonical="/"
      />

      {/* ════════════════════════════════════════════════════════
          HERO — "A liturgy of attention"
          Not a feature announcement. An emotional promise.
          ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,20%,97%)] to-white" />
        <div className="relative max-w-[720px] mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 sm:pb-24 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[hsl(220,40%,16%)] leading-[1.15] mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            A liturgy of attention.
          </h1>
          <p
            className="text-xl sm:text-2xl text-[hsl(220,20%,40%)] leading-relaxed mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            A little book of your loved one's days.
          </p>
          <p
            className="text-lg text-[hsl(220,15%,55%)] leading-relaxed max-w-lg mx-auto mb-10"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Built from small acts of attention by staff, chaplains, volunteers, and parish companions —
            so families never feel far away.
          </p>
          <Link to="/contact">
            <Button className="bg-[hsl(220,40%,16%)] text-white hover:bg-[hsl(220,40%,22%)] rounded-full px-8 py-6 text-base">
              Start your 60-day pilot <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          THE FAMILY QUESTIONS — the emotional center
          ════════════════════════════════════════════════════════ */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="space-y-4 mb-10">
          {FAMILY_QUESTIONS.map((q) => (
            <p
              key={q}
              className="text-xl sm:text-2xl text-[hsl(220,20%,35%)] italic"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {q}
            </p>
          ))}
        </div>
        <p
          className="text-lg text-[hsl(220,40%,16%)] font-medium"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Vigilia answers these questions — not with data, but with a living story.
        </p>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHAT VIGILIA FEELS LIKE — not a dashboard
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(220,20%,97%)]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p
            className="text-lg sm:text-xl text-[hsl(220,15%,45%)] leading-relaxed mb-12"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Vigilia is a living bedside journal. Not a dashboard, a chart, a portal,
            or a communications utility. But a little book of accompaniment,
            a family journal of presence, a shared narrative of care.
          </p>

          {/* Example journal entries */}
          <div className="space-y-1">
            {EXAMPLE_ENTRIES.map((entry, i) => (
              <div
                key={i}
                className="py-4 border-b border-[hsl(220,15%,90%)] last:border-0"
              >
                <p
                  className="text-base sm:text-lg text-[hsl(220,25%,25%)]"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {entry}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          THE 30-SECOND RITUAL — invisible to families
          ════════════════════════════════════════════════════════ */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p
          className="text-sm font-medium tracking-widest uppercase text-[hsl(220,15%,55%)] mb-6"
        >
          How it works
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold text-[hsl(220,40%,16%)] mb-6 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tap, tap, tap. Voice note. Done.
        </h2>
        <p
          className="text-lg text-[hsl(220,15%,45%)] leading-relaxed mb-8"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          After every visit, staff and volunteers complete a tiny ritual of attention:
          three taps — spirit, need, notice — one optional follow-up action, and a brief voice note
          guided by a daily prompt that teaches them what to see.
        </p>
        <p
          className="text-lg text-[hsl(220,15%,45%)] leading-relaxed mb-8"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          Staff are not being asked to author essays. They contribute small fragments of reality
          that accumulate into the resident's living story. The wording of the prompts itself
          teaches the community what kind of care matters.
        </p>
        <div className="bg-[hsl(220,20%,97%)] rounded-2xl p-8 border border-[hsl(220,15%,90%)]">
          <p
            className="text-sm font-medium text-[hsl(220,15%,55%)] mb-4"
          >
            Today's prompt
          </p>
          <p
            className="text-xl italic text-[hsl(220,25%,25%)]"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            "What did their face tell you that words didn't?"
          </p>
          <p className="text-sm text-[hsl(220,15%,60%)] mt-3">
            Prompts rotate daily across nine dimensions of attention — surprise, face,
            family, spiritual, memory, joy, loss, daily life, accompaniment — so no two
            days produce the same story.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          THE PRINTED JOURNAL — the highest form
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(220,20%,97%)]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h2
            className="text-3xl sm:text-4xl font-bold text-[hsl(220,40%,16%)] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Four times a year, a small book arrives.
          </h2>
          <p
            className="text-lg text-[hsl(220,15%,45%)] leading-relaxed mb-6"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            At each threshold of the Church year — Advent, Lent, Easter, Ordinary Time —
            your family receives a printed journal of the season's reflections, opened
            with a prayer and filled with the moments that mattered.
          </p>
          <p
            className="text-lg text-[hsl(220,25%,25%)] leading-relaxed mb-10"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Most apps disappear when the screen closes. A printed journal says:
            <em> this life mattered, these visits mattered, these small moments were worth keeping.</em>
          </p>

          {/* Booklet preview */}
          <div className="bg-white rounded-2xl border border-[hsl(220,15%,88%)] p-8 sm:p-12 max-w-sm mx-auto text-center">
            <p className="text-xs font-medium tracking-widest uppercase text-[hsl(220,15%,60%)] mb-3">
              Seasonal Journal
            </p>
            <p
              className="text-lg font-semibold text-[hsl(220,40%,16%)] mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Margaret Anne Williams
            </p>
            <p className="text-sm text-[hsl(220,15%,55%)] mb-4">
              Easter 2026 · St. Joseph's Care Home
            </p>
            <div className="w-full h-px bg-[hsl(220,15%,90%)] mb-4" />
            <p
              className="text-sm italic text-[hsl(220,15%,45%)] leading-relaxed"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              "This week carried both tenderness and fatigue. She seemed more inward than usual,
              but moments of warmth returned through prayer, familiar music, and family presence."
            </p>
            <div className="mt-6 text-xs text-[hsl(220,15%,65%)]">
              5.5" × 8.5" · 24 pages · Saddle-stitched · Included in subscription
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TURNOVER CONTINUITY
          ════════════════════════════════════════════════════════ */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[hsl(220,40%,16%)] mb-6 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          When care changes hands, the story stays.
        </h2>
        <p
          className="text-lg text-[hsl(220,15%,45%)] leading-relaxed mb-6"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          One caregiver leaves. Another arrives. They don't inherit a blank slate —
          they inherit a living chapter. The next person steps into the story where it left off.
        </p>
        <p
          className="text-lg text-[hsl(220,15%,45%)] leading-relaxed"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          That is one of the deepest practical benefits of narrative continuity
          in long-term care.
        </p>
      </section>

      {/* ════════════════════════════════════════════════════════
          FORMATION — teaches people to see
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(220,20%,97%)]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <h2
            className="text-3xl sm:text-4xl font-bold text-[hsl(220,40%,16%)] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Vigilia forms better witnesses of a person's life.
          </h2>
          <p
            className="text-lg text-[hsl(220,15%,45%)] leading-relaxed mb-6"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Most senior-care systems teach people to document events.
            Vigilia teaches them to notice human moments faithfully.
          </p>
          <p
            className="text-lg text-[hsl(220,15%,45%)] leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            Every visit becomes part of a living family journal.
            A liturgy of attention for the people entrusted with care.
            So no chapter is lost when care changes hands.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          VALUE & ROI — site-ready copy from Perplexity
          ════════════════════════════════════════════════════════ */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p
          className="text-sm font-medium tracking-widest uppercase text-[hsl(220,15%,55%)] mb-4"
        >
          For administrators and mission leaders
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold text-[hsl(220,40%,16%)] mb-3 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          A small line item. A big change in how care feels.
        </h2>
        <p
          className="text-2xl font-bold text-[hsl(220,40%,16%)] mb-2"
        >
          $499 per community per month.
        </p>
        <p
          className="text-lg text-[hsl(220,15%,55%)] mb-10"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          About $13 a day. Includes four seasonal printed journals for every resident's family.
        </p>

        <div className="space-y-6 mb-10">
          <p
            className="text-base font-medium text-[hsl(220,15%,55%)]"
          >
            You're not buying another system. You're buying relief in five places you already feel pressure:
          </p>
          {VALUE_POINTS.map((vp) => (
            <div key={vp.title} className="border-b border-[hsl(220,15%,92%)] pb-5">
              <h3 className="text-base font-semibold text-[hsl(220,40%,16%)] mb-1">{vp.title}</h3>
              <p
                className="text-base text-[hsl(220,15%,45%)] leading-relaxed"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {vp.body}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-[hsl(220,20%,97%)] rounded-2xl p-8 border border-[hsl(220,15%,90%)]">
          <p
            className="text-base text-[hsl(220,15%,40%)] leading-relaxed"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            "If Vigilia prevents one family from leaving early, one potential lawsuit,
            or a fraction of your staff time spent on repetitive updates, it has already paid for itself."
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WORD OF MOUTH
          ════════════════════════════════════════════════════════ */}
      <section className="bg-[hsl(220,20%,97%)]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p
            className="text-xl sm:text-2xl italic text-[hsl(220,20%,35%)] leading-relaxed max-w-lg mx-auto"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            "This place has an app where every visit becomes part of my dad's story.
            I can actually feel what his days are like."
          </p>
          <p className="text-sm text-[hsl(220,15%,60%)] mt-4">
            That is a much more compelling testimonial than "they have good communication software."
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
          ════════════════════════════════════════════════════════ */}
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold text-[hsl(220,40%,16%)] mb-6 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          A liturgy of attention,<br />bound into memory.
        </h2>
        <p
          className="text-lg text-[hsl(220,15%,45%)] leading-relaxed max-w-md mx-auto mb-8"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
        >
          For roughly the cost of one modest expense per day, you can give families
          a living journal instead of a vague sense of distance. And make your Catholicity
          and humanity visible in the smallest, most ordinary moments of care.
        </p>
        <Link to="/contact">
          <Button className="bg-[hsl(220,40%,16%)] text-white hover:bg-[hsl(220,40%,22%)] rounded-full px-8 py-6 text-base">
            Start your 60-day pilot <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="text-xs text-[hsl(220,15%,65%)] mt-4">
          No credit card required. No commitment. Just attention.
        </p>
      </section>
    </div>
  );
});

export default VigiliaLanding;
