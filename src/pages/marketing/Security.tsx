/**
 * Security — Vigilia trust & safety page.
 *
 * Honest about what's built, what's planned, and what's the customer's responsibility.
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SeoHead from '@/components/seo/SeoHead';
import { Shield, Lock, Eye, Heart, BookOpen, Users, Cross, FileText, AlertTriangle } from 'lucide-react';

const BUILT_TODAY = [
  {
    icon: Lock,
    title: 'Row-level security on every table',
    body: 'Supabase enforces tenant and role boundaries at the database level — not in application code. Even if the app layer were compromised, the database would still prevent cross-tenant data access. Every resident, visit, and reflection is scoped to its tenant.',
  },
  {
    icon: Shield,
    title: 'Encryption at rest and in transit',
    body: 'All data is encrypted via TLS in transit and AES-256 at rest. This is handled by our infrastructure provider (Supabase), which maintains SOC 2 Type II certification for their platform.',
  },
  {
    icon: Eye,
    title: 'Role-based access control',
    body: 'Five distinct roles — Staff, Chaplain, Volunteer, Family, Administrator — each with precisely scoped database permissions. Volunteers cannot see care levels. Families see only their loved one\'s journal. Chaplains see spiritual care across their facility assignments.',
  },
  {
    icon: Heart,
    title: 'Family privacy by design',
    body: 'Families never see raw staff notes or voice transcripts. They receive AI-composed reflections — warm, curated narratives built from visit data. The family experience is a journal, not a surveillance feed.',
  },
  {
    icon: Users,
    title: 'Volunteer credential tracking',
    body: 'Safe Environment Training dates and expiration status are tracked for every parish volunteer. Expired certifications are flagged. This helps facilities maintain diocesan compliance for anyone ministering to residents.',
  },
  {
    icon: FileText,
    title: 'AI transparency',
    body: 'Every AI-composed reflection traces back to a specific visit ritual. The AI weaves what was observed — it does not invent details. No resident data is used to train AI models.',
  },
];

const PLANNED = [
  {
    title: 'Formal HIPAA compliance program',
    body: 'We plan to complete a formal risk assessment, establish a BAA process for customers, and implement breach notification procedures. Today, we design with HIPAA requirements in mind but have not completed formal certification.',
  },
  {
    title: 'PHI access audit logging',
    body: 'We plan to implement comprehensive access logging for all views, edits, and exports of resident data, retained for six years per HIPAA requirements. The data model exists but the logging pipeline is not yet active.',
  },
  {
    title: 'Voice transcript lifecycle management',
    body: 'Voice transcripts are used to generate family reflections and are then deleted from storage. Only the AI-composed narrative remains. This minimizes the risk of sensitive health information persisting in voice data.',
  },
];

export default function Security() {
  return (
    <div className="bg-[hsl(var(--marketing-surface))]">
      <SeoHead
        title="Trust & Safety — Vigilia"
        description="How Vigilia protects pastoral care data, family privacy, and resident information. What's built today and what's planned."
        canonical="/security"
      />

      {/* Hero */}
      <section>
        <div className="max-w-[720px] mx-auto px-6 sm:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16 text-center">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-[hsl(var(--marketing-tan))] mb-6">
            Trust &amp; Safety
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[hsl(var(--marketing-deep))] leading-[1.15] tracking-[-0.02em] mb-6">
            What we protect<br className="hidden sm:block" /> and how we protect it.
          </h1>
          <p className="font-serif-body text-lg text-[hsl(var(--marketing-muted))] max-w-xl mx-auto leading-relaxed">
            Vigilia handles sensitive information about vulnerable people.
            We take that seriously. Here's an honest account of where we are.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 pb-20 sm:pb-28">

        {/* What's sensitive */}
        <div className="bg-[hsl(var(--marketing-cream))] border border-[hsl(var(--marketing-border)/0.5)] p-6 sm:p-8 mb-12">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-[hsl(var(--marketing-gold))] shrink-0 mt-0.5" />
            <h2 className="font-serif text-lg font-normal text-[hsl(var(--marketing-deep))]">
              What makes this data sensitive
            </h2>
          </div>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7] mb-4">
            Catholic nursing homes are HIPAA-covered entities. Vigilia processes resident names,
            room numbers, care levels, mood observations, and sacramental records on their behalf — which
            likely makes us a Business Associate under HIPAA.
          </p>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">
            Voice notes are the highest-risk data we handle. Staff recording a 30-second visit may mention
            medications, diagnoses, or clinical details. We treat all voice data as if it contains PHI
            and delete transcripts after the AI reflection is composed.
          </p>
        </div>

        {/* What's built today */}
        <h2 className="font-serif text-2xl font-normal text-[hsl(var(--marketing-deep))] mb-8">
          What's built today
        </h2>
        <div className="space-y-8 mb-16">
          {BUILT_TODAY.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex gap-5">
                <div className="w-10 h-10 border border-[hsl(var(--marketing-border)/0.5)] bg-[hsl(var(--marketing-cream)/0.5)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-[hsl(var(--marketing-gold))]" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-normal text-[hsl(var(--marketing-deep))] mb-2">{s.title}</h3>
                  <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* What's planned */}
        <div className="border-t border-[hsl(var(--marketing-border)/0.5)] pt-12 mb-16">
          <h2 className="font-serif text-2xl font-normal text-[hsl(var(--marketing-deep))] mb-3">
            What's planned
          </h2>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7] mb-8">
            We're building toward formal HIPAA compliance. These items are designed but not yet fully operational.
          </p>
          <div className="space-y-6">
            {PLANNED.map((item) => (
              <div key={item.title} className="border-l-2 border-[hsl(var(--marketing-gold)/0.3)] pl-5">
                <h3 className="font-serif text-base font-normal text-[hsl(var(--marketing-deep))] mb-2">{item.title}</h3>
                <p className="font-serif-body text-sm text-[hsl(var(--marketing-muted))] leading-[1.7]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer responsibility */}
        <div className="border-t border-[hsl(var(--marketing-border)/0.5)] pt-12 mb-16">
          <h2 className="font-serif text-2xl font-normal text-[hsl(var(--marketing-deep))] mb-3">
            Your facility's responsibility
          </h2>
          <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7] mb-6">
            Security is shared. Here's what we need from you:
          </p>
          <div className="space-y-3">
            {[
              'Train staff that voice notes may contain PHI and should focus on emotional and spiritual observations, not clinical details.',
              'Manage user accounts — deactivate staff who leave, keep volunteer certifications current.',
              'Ensure family portal access is granted only to verified family members.',
              'Review the diocese report periodically to confirm data accuracy.',
              'Contact us immediately if you suspect unauthorized access.',
            ].map((item) => (
              <div key={item} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--marketing-gold)/0.5)] mt-2.5 flex-shrink-0" />
                <p className="font-serif-body text-base text-[hsl(var(--marketing-muted))] leading-[1.7]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ERD note */}
        <div className="bg-[hsl(var(--marketing-cream))] border border-[hsl(var(--marketing-border)/0.5)] p-6 sm:p-8 mb-12">
          <div className="flex items-start gap-3 mb-3">
            <Cross className="h-5 w-5 text-[hsl(var(--marketing-gold))] shrink-0 mt-0.5" />
            <h3 className="font-serif text-base font-normal text-[hsl(var(--marketing-deep))]">
              Catholic identity &amp; the ERDs
            </h3>
          </div>
          <p className="font-serif-body text-sm text-[hsl(var(--marketing-muted))] leading-[1.7]">
            Vigilia's data governance aligns with the spirit of the Ethical and Religious Directives
            for Catholic Health Care Services (7th Edition, USCCB 2025). Spiritual care data is never
            sold, shared with advertisers, or used beyond the resident's care. We recognize the
            sacramental seal — Vigilia never captures or stores the content of confessions.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-10 border-t border-[hsl(var(--marketing-border)/0.5)] text-center">
          <p className="font-serif-body text-sm text-[hsl(var(--marketing-muted))] mb-6">
            Questions about security, data handling, or compliance?
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
