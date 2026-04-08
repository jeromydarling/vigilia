/**
 * Security — Vigilia trust & safety page.
 *
 * Rebuilt for Catholic eldercare: HIPAA, pastoral care data,
 * family privacy, sacramental record protection.
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/seo/SeoHead';
import { Shield, Lock, Eye, Heart, BookOpen, Users, Cross, FileText } from 'lucide-react';

/* ── Decorative SVGs ── */

function ShieldSvg({ className = '' }: { className?: string }) {
  return (
    <svg width="80" height="96" viewBox="0 0 80 96" fill="none" className={className} aria-hidden>
      <path d="M40 4 L72 18 V52 C72 72 56 88 40 92 C24 88 8 72 8 52 V18 Z" stroke="currentColor" strokeWidth="1" fill="none" />
      <line x1="40" y1="36" x2="40" y2="60" stroke="currentColor" strokeWidth="0.8" />
      <line x1="30" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="40" cy="46" r="3" stroke="currentColor" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

function KeySvg({ className = '' }: { className?: string }) {
  return (
    <svg width="60" height="28" viewBox="0 0 60 28" fill="none" className={className} aria-hidden>
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <line x1="24" y1="14" x2="56" y2="14" stroke="currentColor" strokeWidth="0.8" />
      <line x1="44" y1="14" x2="44" y2="20" stroke="currentColor" strokeWidth="0.6" />
      <line x1="50" y1="14" x2="50" y2="18" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

const SECURITY_SECTIONS = [
  {
    icon: Lock,
    title: 'HIPAA-grade data boundaries',
    body: 'Every visit ritual, voice note, and sacramental record is tenant-scoped with row-level security. Staff see their residents. Families see their loved one. Chaplains see their assignments. Nobody sees more than they need.',
  },
  {
    icon: Shield,
    title: 'Pastoral care data protection',
    body: 'Spiritual care records — confessions noted, anointing dates, prayer requests — are treated with the same rigor as clinical PHI. Access is logged, scoped, and auditable. The seal of confession is never compromised by technology.',
  },
  {
    icon: Heart,
    title: 'Family privacy by design',
    body: 'Family journal reflections are composed by AI from visit fragments — no raw staff notes are ever exposed. Families receive a warm, curated narrative. Voice recordings stay internal. The family sees the story, not the process.',
  },
  {
    icon: Eye,
    title: 'Role-based access control',
    body: 'Five distinct roles — Staff, Chaplain, Volunteer, Family, Administrator — each with precisely scoped permissions. Volunteers cannot see medical data. Families cannot see other residents. Chaplains see spiritual care across their assignments.',
  },
  {
    icon: Users,
    title: 'Volunteer credential verification',
    body: 'Safe Environment Training dates, expiration tracking, and certification status for every parish volunteer. Ensure diocesan compliance before anyone ministers to residents. Expired certifications are flagged automatically.',
  },
  {
    icon: BookOpen,
    title: 'Audit trail for every access',
    body: 'Every view, edit, and export of resident data is logged with timestamp, user, and action type. PHI access logs are retained for six years per HIPAA requirements. Administrators can review access patterns without seeing content.',
  },
  {
    icon: Cross,
    title: 'ERD-aligned data governance',
    body: 'Data handling practices align with the Ethical and Religious Directives for Catholic Health Care Services (7th Edition, USCCB 2025). Spiritual care data is never sold, shared with advertisers, or used for purposes beyond the resident\'s care.',
  },
  {
    icon: FileText,
    title: 'AI transparency',
    body: 'Narrative synthesis uses AI to compose reflections from visit data. The AI never invents facts — it only weaves what was observed. Every reflection traces back to specific visit rituals. Families can trust that what they read is real.',
  },
];

export default function Security() {
  return (
    <div className="bg-[hsl(var(--marketing-surface))]">
      <SeoHead
        title="Trust & Safety — Vigilia"
        description="How Vigilia protects pastoral care data, family privacy, and sacramental records with HIPAA-grade security, role-based access, and full audit trails."
        canonical="/security"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative SVG background instead of image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          <ShieldSvg className="text-[hsl(var(--marketing-deep))]" />
        </div>
        <div className="absolute top-20 left-[15%] opacity-[0.06] pointer-events-none hidden lg:block">
          <KeySvg className="text-[hsl(var(--marketing-gold))]" />
        </div>
        <div className="absolute bottom-16 right-[12%] opacity-[0.06] pointer-events-none hidden lg:block rotate-12">
          <KeySvg className="text-[hsl(var(--marketing-gold))]" />
        </div>

        <div className="relative max-w-[720px] mx-auto px-6 sm:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20 text-center">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
            Trust &amp; Safety
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[hsl(var(--marketing-deep))] leading-[1.15] tracking-[-0.02em] mb-6">
            The data behind the care<br className="hidden sm:block" /> is as sacred as the care itself.
          </h1>
          <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] max-w-xl mx-auto leading-relaxed">
            Vigilia is built so that pastoral care data, family trust, and sacramental records
            are never at risk. Here's how we protect what matters.
          </p>
        </div>
      </section>

      {/* Security sections */}
      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20 sm:pb-28">
        <div className="space-y-10">
          {SECURITY_SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-5 reveal-on-scroll">
                <div className="w-10 h-10 rounded-none border border-[hsl(var(--marketing-border)/0.5)] bg-[hsl(var(--marketing-cream)/0.5)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-[hsl(var(--marketing-gold))]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-[hsl(var(--marketing-deep))] mb-2">{s.title}</h3>
                  <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* HIPAA callout */}
        <div className="mt-16 bg-[hsl(var(--marketing-cream))] border border-[hsl(var(--marketing-border)/0.5)] p-8 sm:p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--marketing-gold)/0.4)]" />
          <h3 className="font-serif text-lg font-normal text-[hsl(var(--marketing-deep))] mb-4">
            HIPAA Compliance
          </h3>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7] mb-4">
            Vigilia treats pastoral and spiritual care data with the same rigor as protected health information.
            While spiritual care records occupy a regulatory gray area, we choose the stricter standard:
            encrypted at rest and in transit, access-logged, scoped by role, and retained per HIPAA timelines.
          </p>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">
            Our infrastructure runs on Supabase (SOC 2 Type II certified) with row-level security policies
            enforced at the database level — not in application code. Even if the application layer were compromised,
            the database would still enforce tenant and role boundaries.
          </p>
        </div>

        {/* AI Stewardship */}
        <div className="mt-16 pt-14 border-t border-[hsl(var(--marketing-border)/0.5)]">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[hsl(var(--marketing-deep))] mb-4">
            AI Stewardship
          </h2>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7] max-w-xl mb-8">
            AI serves the story — never the other way around.
          </p>
          <div className="space-y-4">
            {[
              'AI-composed reflections trace back to specific visit rituals. Nothing is invented.',
              'Voice transcripts are processed and discarded — only the narrative remains.',
              'No resident data is used to train models. Ever.',
              'Families can distinguish AI-composed text from direct staff messages.',
              'Human review is always possible. AI assists; humans decide.',
            ].map((item) => (
              <div key={item} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--marketing-gold)/0.5)] mt-2.5 flex-shrink-0" />
                <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 pt-10 border-t border-[hsl(var(--marketing-border)/0.5)] text-center">
          <p className="font-serif-body text-sm text-[hsl(var(--marketing-muted))] mb-6">
            Questions about security, HIPAA compliance, or data governance?
          </p>
          <Link to="/contact">
            <Button className="rounded-none border-2 border-[hsl(var(--marketing-deep))] bg-[hsl(var(--marketing-deep))] text-[hsl(var(--marketing-cream))] hover:bg-transparent hover:text-[hsl(var(--marketing-deep))] px-8 py-4 text-xs font-sans tracking-[0.15em] uppercase transition-colors duration-300 h-auto">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
