import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/seo/SeoHead';
import {
  ArrowRight,
  Heart,
  BookOpen,
  Users,
  Eye,
  Shield,
  Calendar,
  Mic,
  Clock,
  ChevronRight,
  Cross,
  HandHeart,
  Bell,
  UserCheck,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Vigilia.care — "A Liturgy of Attention"
   Landing page for Catholic senior care hospitality platform
   ═══════════════════════════════════════════════════════════ */

const MODULES = [
  {
    icon: BookOpen,
    title: 'Resident Story',
    description:
      'Preserve biography, faith, losses, and joys across staff turnover. Every resident\'s story travels with them — never lost to a shift change.',
  },
  {
    icon: Cross,
    title: 'Pastoral Care',
    description:
      'Track sacramental life — Communion, confession, anointing — and route spiritual needs to chaplains automatically.',
  },
  {
    icon: Users,
    title: 'Family Circle',
    description:
      'Map family relationships, communication preferences, and surface strain signals before they become crises.',
  },
  {
    icon: Mic,
    title: 'Visitor Mode',
    description:
      'Eucharistic ministers and volunteers capture what mattered in a visit with one voice note — guided by a daily prompt that teaches them what to notice.',
  },
  {
    icon: Eye,
    title: 'Drift & Loneliness Watch',
    description:
      'Pattern detection for isolation risk. When visits drop, moods shift, or family contact fades — Vigilia notices before anyone else.',
  },
  {
    icon: Calendar,
    title: 'Volunteer & Parish Coordination',
    description:
      'Schedule Eucharistic ministers, coordinate parish visitors, and ensure no resident goes unvisited.',
  },
];

const RITUAL_STEPS = [
  {
    step: '1',
    label: 'Spirit',
    question: 'How were they today?',
    options: ['Peaceful', 'Lonely', 'Anxious', 'Encouraged', 'Tired', 'Hard to tell'],
  },
  {
    step: '2',
    label: 'Need',
    question: 'What seemed most needed?',
    options: ['Company', 'Prayer', 'Family contact', 'Sacramental care', 'Comfort', 'Staff follow-up'],
  },
  {
    step: '3',
    label: 'Notice',
    question: 'What deserves notice?',
    options: ['New grief', 'Withdrawal', 'Joyful moment', 'Family strain', 'Spiritual request', 'No concern'],
  },
  {
    step: '4',
    label: 'Route',
    question: 'Who should know?',
    options: ['Tell chaplain', 'Contact family', 'Ask volunteer visit', 'No follow-up needed'],
  },
];

const PRICING_TIERS = [
  {
    name: 'Small Community',
    price: 299,
    description: 'For intimate care homes with deep relational bonds.',
    features: [
      'Up to 50 residents',
      'Visitor Mode + Voice Notes',
      'Resident Story',
      'Family Circle',
      'Drift & Loneliness Watch',
      'Email support',
    ],
  },
  {
    name: 'Standard',
    price: 399,
    description: 'For established Catholic communities with active parish partnerships.',
    features: [
      'Up to 120 residents',
      'Everything in Small Community',
      'Pastoral Care tracking',
      'Volunteer & Parish Coordination',
      'Chaplain routing & signals',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Large Campus',
    price: 599,
    description: 'For multi-building campuses and diocesan networks.',
    features: [
      'Unlimited residents',
      'Everything in Standard',
      'FHIR integration (PointClickCare, MatrixCare)',
      'Multi-facility dashboard',
      'Diocese-level reporting',
      'Dedicated onboarding',
    ],
  },
];

const VOICE_PROMPT_EXAMPLES = [
  { category: 'Surprise', prompt: 'What surprised you about them today?' },
  { category: 'Face', prompt: 'What did their face tell you that words didn\'t?' },
  { category: 'Family', prompt: 'What would their family want to know about today?' },
  { category: 'Spiritual', prompt: 'Was there a moment of grace?' },
  { category: 'Memory', prompt: 'Did they share a memory? What was it about?' },
  { category: 'Joy', prompt: 'What made them smile?' },
  { category: 'Loss', prompt: 'What grief seemed present today?' },
  { category: 'Accompaniment', prompt: 'What will you remember about this visit?' },
];

const VigiliaLanding = React.forwardRef<HTMLDivElement>(function VigiliaLanding(_props, ref) {
  return (
    <div ref={ref} className="bg-white">
      <SeoHead
        title="Vigilia.care — A Liturgy of Attention"
        description="The fastest way for staff, chaplains, and volunteers to record what mattered in a visit, so no resident's story, spiritual need, or quiet loneliness is missed."
        keywords={['Catholic senior care', 'pastoral care software', 'elder care technology', 'Catholic nursing home', 'chaplain software', 'loneliness detection']}
        canonical="/"
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--marketing-surface))] to-white" />
        <div className="relative max-w-[960px] mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-14 sm:pb-20 text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--marketing-blue))] mb-4">
            A Liturgy of Attention
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[hsl(var(--marketing-navy))] leading-tight mb-6">
            Every visit tells a story.
            <br className="hidden sm:block" />
            <span className="text-[hsl(var(--marketing-blue))]">Vigilia remembers.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[hsl(var(--marketing-navy)/0.55)] max-w-2xl mx-auto mb-10 leading-relaxed">
            The fastest way for staff, chaplains, and volunteers to record what mattered in a visit — so no resident's story, spiritual need, or quiet loneliness is missed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button className="bg-[hsl(var(--marketing-navy))] text-white hover:bg-[hsl(var(--marketing-navy)/0.9)] rounded-full px-8 py-6 text-base">
                Start your 60-day pilot <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#the-ritual">
              <Button variant="outline" className="rounded-full px-8 py-6 text-base border-[hsl(var(--marketing-navy)/0.2)]">
                See the 30-second ritual
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="rounded-2xl border border-[hsl(var(--marketing-border))] p-8 sm:p-12 bg-[hsl(var(--marketing-surface))]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--marketing-navy))] mb-6">
              Clinical systems track vitals.
              <br />
              Who tracks the soul?
            </h2>
            <p className="text-[hsl(var(--marketing-navy)/0.6)] leading-relaxed mb-6">
              PointClickCare handles billing. MatrixCare manages medications. LifeLoop coordinates activities.
              But when a volunteer visits Margaret on Tuesday and notices she hasn't mentioned her grandchildren
              in weeks — no system captures that. When a Eucharistic minister senses that Frank's faith is
              wavering after his wife's passing — that observation walks out the door with them.
            </p>
            <p className="text-[hsl(var(--marketing-navy))] font-medium">
              Vigilia captures what clinical systems can't: the human, spiritual, relational signals
              that tell you who needs attention — before it's too late.
            </p>
          </div>
        </div>
      </section>

      {/* ── The Ritual ── */}
      <section id="the-ritual" className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--marketing-blue))] mb-3">
            The 30-Second Ritual
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
            Three taps. One voice note.
            <br />
            A story no one else would tell.
          </h2>
          <p className="text-[hsl(var(--marketing-navy)/0.55)] max-w-lg mx-auto">
            After every visit, staff and volunteers complete a brief, intentional ritual.
            The taps create signals. The voice note preserves what matters.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {RITUAL_STEPS.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-[hsl(var(--marketing-border))] p-6 hover:border-[hsl(var(--marketing-blue)/0.3)] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[hsl(var(--marketing-navy))] text-white flex items-center justify-center text-sm font-bold">
                  {step.step}
                </span>
                <span className="text-xs font-medium tracking-widest uppercase text-[hsl(var(--marketing-blue))]">
                  {step.label}
                </span>
              </div>
              <p className="font-semibold text-[hsl(var(--marketing-navy))] mb-3">{step.question}</p>
              <div className="flex flex-wrap gap-1.5">
                {step.options.map((opt) => (
                  <span
                    key={opt}
                    className="text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--marketing-surface))] text-[hsl(var(--marketing-navy)/0.6)] border border-[hsl(var(--marketing-border))]"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Voice note — the real product */}
        <div className="rounded-2xl border-2 border-[hsl(var(--marketing-blue)/0.3)] p-8 sm:p-10 bg-gradient-to-br from-white to-[hsl(var(--marketing-surface))]">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--marketing-blue)/0.1)] flex items-center justify-center shrink-0">
              <Mic className="h-6 w-6 text-[hsl(var(--marketing-blue))]" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-[hsl(var(--marketing-blue))] mb-1">
                Step 5 — The Story
              </p>
              <h3 className="text-xl font-bold text-[hsl(var(--marketing-navy))]">
                A voice note guided by today's prompt
              </h3>
            </div>
          </div>
          <p className="text-[hsl(var(--marketing-navy)/0.6)] mb-6 leading-relaxed">
            This is the heart of Vigilia. Each day, the system offers a different prompt — drawn from
            nine categories of Ignatian-inspired observation. The prompts teach staff and volunteers
            <strong className="text-[hsl(var(--marketing-navy))]"> what to notice and how to tell the story</strong>.
            No two days produce the same entry. After 30 days, you don't have 30 checkbox entries saying
            "peaceful, no concern." You have 30 unique stories that reveal who this person truly is.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {VOICE_PROMPT_EXAMPLES.map((vp) => (
              <div
                key={vp.category}
                className="rounded-xl bg-white border border-[hsl(var(--marketing-border))] p-4"
              >
                <p className="text-xs font-medium text-[hsl(var(--marketing-blue))] mb-1.5">{vp.category}</p>
                <p className="text-sm text-[hsl(var(--marketing-navy))] italic">"{vp.prompt}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Six Modules ── */}
      <section className="bg-[hsl(var(--marketing-surface))]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
              Six modules. One mission.
            </h2>
            <p className="text-[hsl(var(--marketing-navy)/0.55)] max-w-md mx-auto">
              Every module serves the same purpose: ensuring no resident's story, need, or quiet loneliness goes unnoticed.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((mod) => (
              <div
                key={mod.title}
                className="rounded-2xl border border-[hsl(var(--marketing-border))] p-6 sm:p-8 bg-white hover:border-[hsl(var(--marketing-blue)/0.3)] hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--marketing-blue)/0.1)] flex items-center justify-center mb-4">
                  <mod.icon className="h-5 w-5 text-[hsl(var(--marketing-blue))]" />
                </div>
                <h3 className="text-lg font-bold text-[hsl(var(--marketing-navy))] mb-2">{mod.title}</h3>
                <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)] leading-relaxed">{mod.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works (Formation) ── */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
            The tool teaches what matters.
          </h2>
          <p className="text-[hsl(var(--marketing-navy)/0.55)] max-w-lg mx-auto">
            Vigilia is not just software — it's a formation practice. The wording of every prompt,
            the structure of every tap, and the routing of every follow-up embody Catholic anthropology.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--marketing-surface))] flex items-center justify-center mx-auto mb-4">
              <HandHeart className="h-7 w-7 text-[hsl(var(--marketing-navy))]" />
            </div>
            <h3 className="font-bold text-[hsl(var(--marketing-navy))] mb-2">Trains observation</h3>
            <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)]">
              Daily prompts teach volunteers and staff what kind of attention the institution values.
              Each visit sharpens the eye of the heart.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--marketing-surface))] flex items-center justify-center mx-auto mb-4">
              <Bell className="h-7 w-7 text-[hsl(var(--marketing-navy))]" />
            </div>
            <h3 className="font-bold text-[hsl(var(--marketing-navy))] mb-2">Routes follow-up</h3>
            <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)]">
              Chaplains see sacramental needs. Family liaisons see contact requests.
              Mission leaders see drift patterns. The right signal reaches the right person.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--marketing-surface))] flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-7 w-7 text-[hsl(var(--marketing-navy))]" />
            </div>
            <h3 className="font-bold text-[hsl(var(--marketing-navy))] mb-2">Preserves continuity</h3>
            <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)]">
              When staff turns over, the resident's story stays. New caregivers inherit not just a chart,
              but a living narrative of who this person is and what they need.
            </p>
          </div>
        </div>
      </section>

      {/* ── Complements, Doesn't Compete ── */}
      <section className="bg-[hsl(var(--marketing-surface))]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
              Sits beside your clinical system.
              <br />
              Never replaces it.
            </h2>
            <p className="text-[hsl(var(--marketing-navy)/0.55)] leading-relaxed mb-8">
              Vigilia is complementary — it captures the relational and spiritual signals that PointClickCare,
              MatrixCare, and LifeLoop don't. It connects via FHIR APIs, sharing what's needed,
              keeping what's sacred separate.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[hsl(var(--marketing-navy)/0.4)]">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> HIPAA-aware
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> FHIR-compatible
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> 30-second workflow
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest uppercase text-[hsl(var(--marketing-blue))] mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
            Too cheap to refuse.
          </h2>
          <p className="text-[hsl(var(--marketing-navy)/0.55)] max-w-lg mx-auto">
            This is a mission budget decision, not an IT transformation.
            Start with a free 60-day pilot — no credit card, no commitment.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-6 sm:p-8 transition-all ${
                tier.featured
                  ? 'border-[hsl(var(--marketing-blue))] shadow-md bg-white relative'
                  : 'border-[hsl(var(--marketing-border))] bg-white hover:border-[hsl(var(--marketing-blue)/0.3)] hover:shadow-sm'
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1 rounded-full bg-[hsl(var(--marketing-blue))] text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-[hsl(var(--marketing-navy))] mb-1">{tier.name}</h3>
              <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)] mb-4">{tier.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-[hsl(var(--marketing-navy))]">${tier.price}</span>
                <span className="text-[hsl(var(--marketing-navy)/0.4)]">/month</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[hsl(var(--marketing-navy)/0.7)]">
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--marketing-blue))] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/contact">
                <Button
                  className={`w-full rounded-full ${
                    tier.featured
                      ? 'bg-[hsl(var(--marketing-navy))] text-white hover:bg-[hsl(var(--marketing-navy)/0.9)]'
                      : ''
                  }`}
                  variant={tier.featured ? 'default' : 'outline'}
                >
                  Start free pilot
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Allies ── */}
      <section className="bg-[hsl(var(--marketing-surface))]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
            Built for the Catholic care community.
          </h2>
          <p className="text-[hsl(var(--marketing-navy)/0.55)] max-w-lg mx-auto mb-10">
            Vigilia is designed in partnership with Catholic healthcare leaders and informed by the
            pastoral wisdom of organizations serving elderly communities across the United States.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <div className="rounded-2xl border border-[hsl(var(--marketing-border))] p-6 bg-white">
              <h3 className="font-bold text-[hsl(var(--marketing-navy))] mb-2">Catholic Health Association</h3>
              <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)]">
                Representing 1,600+ long-term care facilities across the U.S.
              </p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--marketing-border))] p-6 bg-white">
              <h3 className="font-bold text-[hsl(var(--marketing-navy))] mb-2">Curatio Apostolate</h3>
              <p className="text-sm text-[hsl(var(--marketing-navy)/0.55)]">
                Faith formation partner for Catholic healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--marketing-navy))] mb-4">
          Attention itself is an act of love.
        </h2>
        <p className="text-[hsl(var(--marketing-navy)/0.55)] max-w-lg mx-auto mb-8">
          Every person has a story. Spiritual needs matter. Family and community are essential.
          Vigilia is the practice of remembering — one visit at a time.
        </p>
        <Link to="/contact">
          <Button className="bg-[hsl(var(--marketing-navy))] text-white hover:bg-[hsl(var(--marketing-navy)/0.9)] rounded-full px-8 py-6 text-base">
            Start your 60-day pilot <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="text-xs text-[hsl(var(--marketing-navy)/0.35)] mt-4">
          No credit card required. No commitment. Just attention.
        </p>
      </section>
    </div>
  );
});

export default VigiliaLanding;
