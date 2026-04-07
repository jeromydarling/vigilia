import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TenantRouteGuard } from '@/components/routing/TenantRouteGuard';
import { LegacyPathRedirect } from '@/components/routing/LegacyPathRedirect';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/layout/MainLayout';

// Marketing layout + pages (public)
import PublicLayout from '@/components/marketing/PublicLayout';
import VigiliaLanding from '@/pages/marketing/VigiliaLanding';
import Contact from '@/pages/marketing/Contact';
import Security from '@/pages/marketing/Security';
import LegalTerms from '@/pages/marketing/legal/LegalTerms';
import LegalPrivacy from '@/pages/marketing/legal/LegalPrivacy';
import LegalDPA from '@/pages/marketing/legal/LegalDPA';
import LegalAcceptableUse from '@/pages/marketing/legal/LegalAcceptableUse';
import LegalAITransparency from '@/pages/marketing/legal/LegalAITransparency';
import CommunioProfileSetupWizard from '@/components/communio/CommunioProfileSetupWizard';

// Auth pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import JoinPage from '@/pages/JoinPage';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Onboarding from '@/pages/Onboarding';
import SponsoredSetup from '@/pages/SponsoredSetup';
import NotFound from '@/pages/NotFound';
import DemoGatePage from '@/pages/DemoGatePage';
import { SubscriptionGate } from '@/components/gates/SubscriptionGate';
import { FeatureGate } from '@/components/gates/FeatureGate';

// Stub pages
import RelatioMarketplace from '@/pages/RelatioMarketplace';
import ImportWizard from '@/pages/relatio/ImportWizard';
import ImportJobDetail from '@/pages/relatio/ImportJobDetail';
import Communio from '@/pages/Communio';
import CaregiverNetworkPage from '@/pages/CaregiverNetworkPage';
import OnboardingGuide from '@/pages/OnboardingGuide';
import EnneagramAssessmentPage from '@/pages/EnneagramAssessmentPage';

// App pages (kept for Vigilia)
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Anchors from '@/pages/Anchors';
import People from '@/pages/People';
import PersonDetail from '@/pages/PersonDetail';
import FindPeople from '@/pages/FindPeople';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import FindEvents from '@/pages/FindEvents';
import CalendarPage from '@/pages/Calendar';
import CalendarEventPage from '@/pages/CalendarEventPage';
import Activities from '@/pages/Activities';
import Volunteers from '@/pages/Volunteers';
import VolunteerDetail from '@/pages/VolunteerDetail';
import VolunteerHoursInbox from '@/pages/VolunteerHoursInbox';
import FieldNotesPage from '@/components/fieldnotes/FieldNotesPage';
import Visits from '@/pages/Visits';
import DioceseReport from '@/pages/DioceseReport';
import ParishVolunteerPortal from '@/pages/ParishVolunteerPortal';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Testimonium from '@/pages/Testimonium';
import TestimoniumReport from '@/pages/TestimoniumReport';
import TestimoniumExports from '@/pages/TestimoniumExports';
import Reports from '@/pages/Reports';
import ImportCenter from '@/pages/ImportCenter';
import Playbooks from '@/pages/Playbooks';
import Settings from '@/pages/Settings';
import VoiceSettings from '@/pages/settings/VoiceSettings';
import ImpactDimensionsPage from '@/pages/settings/ImpactDimensionsPage';
import MyActivity from '@/pages/MyActivity';
import Help from '@/pages/Help';
import AdoptionHub from '@/pages/help/AdoptionHub';
import Feedback from '@/pages/Feedback';
import FamilyPortal from '@/pages/FamilyPortal';

// Tenant admin pages
import Admin from '@/pages/Admin';
import Activation from '@/pages/admin/Activation';
import TeamManagement from '@/pages/admin/TeamManagement';
import AdminHowTo from '@/pages/admin/AdminHowTo';
import FlocknoteImportWizard from '@/pages/admin/FlocknoteImportWizard';
import DoNotEmail from '@/pages/admin/DoNotEmail';
import EmailProviders from '@/pages/admin/EmailProviders';
import GuidedActivationPrep from '@/pages/admin/GuidedActivationPrep';

// Operator layout (eagerly loaded — thin wrapper)
import { OperatorLayout } from '@/components/layout/OperatorLayout';

// ── Lazy-loaded operator pages (code-split for bundle size) ──
import {
  OperatorOverview, OperatorTenantsPage, OperatorTenantDetailPage,
  OperatorIntakePage, OperatorAutomationPage, OperatorSystemPage,
  OperatorIntegrationsPage, OperatorPlatformPage, OperatorCommunioPage,
  OperatorTestimoniumPage, ScenarioLabPage, TourRunnerPage,
  OperatorHowToPage, OperatorSchedulingPage,
  OperatorTimeMachinePage, OperatorOverridesPage,
  OperatorAnnouncementsPage, OperatorEcosystemPage, OperatorActivationPage,
  ErrorDeskPage, OperatorQAPage, OperatorManualsPage, OnboardingFlowGuide,
  OperatorSettingsPage, OperatorSeoPage, OperatorPeoplePage, AIObservatoryPage, OrientationDebugPage,
  // Nexus
  OperatorNexusHome, OperatorPlaybooks, OperatorSupportInbox,
  OperatorExpansionWatch, OperatorKnowledge, OperatorRhythmPage,
  OperatorPresencePage, OperatorSignumPage, OperatorGuidancePage,
  OperatorLumenPage, ArrivalFlow, OperatorRecovery,
  OperatorNarrativePage, OperatorNarrativeStudio, OperatorCivitasStudio,
  OperatorNarrativeEcosystem, OperatorAdoptionPage, OperatorStabilityPage,
  OperatorSimulationPage, OperatorContentStudio, OperatorNotificationsPage,
  OperatorAnalyticsPage, OperatorDiscoveryInsights, OperatorLivingLibrary,
  OperatorGardenPage, MorningExamenPage, EveningExamenPage,
  GardenPulsePage, GardenerStudioPage, GardenerInboxPage,
} from '@/components/routing/LazyOperatorPages';

/**
 * Suspense fallback for lazy-loaded operator pages.
 */
function OperatorFallback() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}

/**
 * Root redirect logic:
 * - Not authenticated → marketing landing
 * - Authenticated + no tenant → onboarding
 * - Authenticated + tenant → redirect to /:slug/
 */
function RootRedirect() {
  // Always show the marketing homepage — authenticated users navigate via sidebar
  return <MarketingLanding />;
}

function MarketingLanding() {
  return (
    <PublicLayout>
      <VigiliaLanding />
    </PublicLayout>
  );
}

/** Wraps operator pages in OperatorLayout + Suspense */
function OperatorShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <OperatorLayout>
        <Suspense fallback={<OperatorFallback />}>
          {children}
        </Suspense>
      </OperatorLayout>
    </ProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <>
      <LegacyPathRedirect />
      <Routes>
        {/* Root: marketing OR redirect to tenant */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public marketing routes — Vigilia.care */}
        <Route element={<PublicLayout />}>
          <Route path="/contact" element={<Contact />} />
          <Route path="/security" element={<Security />} />
          <Route path="/legal/terms" element={<LegalTerms />} />
          <Route path="/legal/privacy" element={<LegalPrivacy />} />
          <Route path="/legal/data-processing" element={<LegalDPA />} />
          <Route path="/legal/acceptable-use" element={<LegalAcceptableUse />} />
          <Route path="/legal/ai-transparency" element={<LegalAITransparency />} />
        </Route>
        

        {/* Public event registration — TODO: rebuild for Vigilia */}

        {/* Demo gate */}
        <Route path="/demo" element={<DemoGatePage />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/sponsored-setup" element={<ProtectedRoute><SponsoredSetup /></ProtectedRoute>} />

        {/* Operator Console (top-level, admin-only, lazy-loaded) */}
        <Route path="/operator" element={<OperatorShell><OperatorOverview /></OperatorShell>} />
        <Route path="/operator/tenants" element={<OperatorShell><OperatorTenantsPage /></OperatorShell>} />
        <Route path="/operator/tenants/:tenantId" element={<OperatorShell><OperatorTenantDetailPage /></OperatorShell>} />
        <Route path="/operator/intake" element={<OperatorShell><OperatorIntakePage /></OperatorShell>} />
        <Route path="/operator/automation" element={<OperatorShell><OperatorAutomationPage /></OperatorShell>} />
        <Route path="/operator/system" element={<OperatorShell><OperatorSystemPage /></OperatorShell>} />
        <Route path="/operator/machina/ai-observatory" element={<OperatorShell><AIObservatoryPage /></OperatorShell>} />
        <Route path="/operator/machina/orientation" element={<OperatorShell><OrientationDebugPage /></OperatorShell>} />
        <Route path="/operator/integrations" element={<OperatorShell><OperatorIntegrationsPage /></OperatorShell>} />
        <Route path="/operator/platform" element={<OperatorShell><OperatorPlatformPage /></OperatorShell>} />
        <Route path="/operator/communio" element={<OperatorShell><OperatorCommunioPage /></OperatorShell>} />
        <Route path="/operator/testimonium" element={<OperatorShell><OperatorTestimoniumPage /></OperatorShell>} />
        <Route path="/operator/scenario-lab" element={<OperatorShell><ScenarioLabPage /></OperatorShell>} />
        <Route path="/operator/sweeps" element={<Navigate to="/operator/system?tab=sweep" replace />} />
        <Route path="/operator/tour" element={<OperatorShell><TourRunnerPage /></OperatorShell>} />
        <Route path="/operator/how-to" element={<OperatorShell><OperatorHowToPage /></OperatorShell>} />
        <Route path="/operator/scheduling" element={<OperatorShell><OperatorSchedulingPage /></OperatorShell>} />
        <Route path="/operator/time-machine" element={<OperatorShell><OperatorTimeMachinePage /></OperatorShell>} />
        <Route path="/operator/overrides" element={<OperatorShell><OperatorOverridesPage /></OperatorShell>} />
        <Route path="/operator/announcements" element={<OperatorShell><OperatorAnnouncementsPage /></OperatorShell>} />
        <Route path="/operator/ecosystem" element={<OperatorShell><OperatorEcosystemPage /></OperatorShell>} />
        <Route path="/operator/activation" element={<OperatorShell><OperatorActivationPage /></OperatorShell>} />
        <Route path="/operator/error-desk" element={<OperatorShell><ErrorDeskPage /></OperatorShell>} />
        <Route path="/operator/qa" element={<OperatorShell><OperatorQAPage /></OperatorShell>} />
        <Route path="/operator/manuals" element={<OperatorShell><OperatorManualsPage /></OperatorShell>} />
        <Route path="/operator/onboarding-guide" element={<OperatorShell><OnboardingFlowGuide /></OperatorShell>} />
        <Route path="/operator/people" element={<OperatorShell><OperatorPeoplePage /></OperatorShell>} />
        <Route path="/operator/find-people" element={<OperatorShell><FindPeople /></OperatorShell>} />
        <Route path="/operator/find-events" element={<OperatorShell><FindEvents /></OperatorShell>} />
        <Route path="/operator/events" element={<OperatorShell><Events /></OperatorShell>} />
        <Route path="/operator/events/:slug" element={<OperatorShell><EventDetail /></OperatorShell>} />
        <Route path="/operator/activities" element={<OperatorShell><Activities /></OperatorShell>} />
        <Route path="/operator/settings" element={<OperatorShell><OperatorSettingsPage /></OperatorShell>} />
        <Route path="/operator/seo" element={<OperatorShell><OperatorSeoPage /></OperatorShell>} />

        {/* Operator Nexus */}
        <Route path="/operator/nexus" element={<OperatorShell><OperatorNexusHome /></OperatorShell>} />
        <Route path="/operator/nexus/playbooks" element={<OperatorShell><OperatorPlaybooks /></OperatorShell>} />
        <Route path="/operator/nexus/integrations" element={<Navigate to="/operator/integrations?tab=reference" replace />} />
        <Route path="/operator/nexus/support" element={<OperatorShell><OperatorSupportInbox /></OperatorShell>} />
        <Route path="/operator/nexus/activation" element={<Navigate to="/operator/activation" replace />} />
        <Route path="/operator/nexus/expansion" element={<OperatorShell><OperatorExpansionWatch /></OperatorShell>} />
        <Route path="/operator/nexus/knowledge" element={<OperatorShell><OperatorKnowledge /></OperatorShell>} />
        <Route path="/operator/nexus/qa" element={<Navigate to="/operator/qa?tab=health" replace />} />
        <Route path="/operator/nexus/migrations" element={<Navigate to="/operator/integrations?tab=migrations" replace />} />
        <Route path="/operator/nexus/stability" element={<Navigate to="/operator/system?tab=friction" replace />} />
        <Route path="/operator/nexus/rhythm" element={<OperatorShell><OperatorRhythmPage /></OperatorShell>} />
        <Route path="/operator/nexus/presence" element={<OperatorShell><OperatorPresencePage /></OperatorShell>} />
        <Route path="/operator/nexus/friction" element={<OperatorShell><OperatorSignumPage /></OperatorShell>} />
        <Route path="/operator/nexus/guidance" element={<OperatorShell><OperatorGuidancePage /></OperatorShell>} />
        <Route path="/operator/nexus/lumen" element={<OperatorShell><OperatorLumenPage /></OperatorShell>} />
        <Route path="/operator/nexus/arrival" element={<OperatorShell><ArrivalFlow /></OperatorShell>} />
        <Route path="/operator/nexus/recovery" element={<OperatorShell><OperatorRecovery /></OperatorShell>} />
        <Route path="/operator/nexus/narrative" element={<OperatorShell><OperatorNarrativePage /></OperatorShell>} />
        <Route path="/operator/nexus/narrative-studio" element={<OperatorShell><OperatorContentStudio /></OperatorShell>} />
        <Route path="/operator/nexus/civitas" element={<OperatorShell><OperatorCivitasStudio /></OperatorShell>} />
        <Route path="/operator/nexus/narrative-ecosystem" element={<OperatorShell><OperatorNarrativeEcosystem /></OperatorShell>} />
        <Route path="/operator/nexus/adoption" element={<OperatorShell><OperatorAdoptionPage /></OperatorShell>} />
        <Route path="/operator/nexus/stability" element={<OperatorShell><OperatorStabilityPage /></OperatorShell>} />
        <Route path="/operator/nexus/simulation" element={<OperatorShell><OperatorSimulationPage /></OperatorShell>} />
        <Route path="/operator/nexus/content" element={<OperatorShell><OperatorContentStudio /></OperatorShell>} />
        <Route path="/operator/nexus/library" element={<OperatorShell><OperatorLivingLibrary /></OperatorShell>} />
        <Route path="/operator/nexus/garden" element={<OperatorShell><OperatorGardenPage /></OperatorShell>} />
        <Route path="/operator/nexus/examen/morning" element={<OperatorShell><MorningExamenPage /></OperatorShell>} />
        <Route path="/operator/nexus/examen/evening" element={<OperatorShell><EveningExamenPage /></OperatorShell>} />
        <Route path="/operator/nexus/notifications" element={<OperatorShell><OperatorNotificationsPage /></OperatorShell>} />
        <Route path="/operator/nexus/analytics" element={<OperatorShell><OperatorAnalyticsPage /></OperatorShell>} />
        <Route path="/operator/nexus/discovery-insights" element={<OperatorShell><OperatorDiscoveryInsights /></OperatorShell>} />
        <Route path="/operator/nexus/garden-pulse" element={<OperatorShell><GardenPulsePage /></OperatorShell>} />
        <Route path="/operator/nexus/studio" element={<OperatorShell><GardenerStudioPage /></OperatorShell>} />
        <Route path="/operator/nexus/inbox" element={<OperatorShell><GardenerInboxPage /></OperatorShell>} />

        {/* Tenant-scoped app routes: /:tenantSlug/... */}
        <Route path="/:tenantSlug" element={<ProtectedRoute><TenantRouteGuard /></ProtectedRoute>}>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Index />} />

          {/* Residents (contacts/people) */}
          <Route path="residents" element={<People />} />
          <Route path="residents/:slug" element={<PersonDetail />} />
          <Route path="residents/find" element={<FindPeople />} />
          <Route path="people" element={<People />} />
          <Route path="people/:slug" element={<PersonDetail />} />
          <Route path="people/find" element={<FindPeople />} />
          <Route path="contacts" element={<People />} />

          {/* Facilities (anchors) */}
          <Route path="facilities" element={<Anchors />} />
          <Route path="anchors" element={<Anchors />} />

          {/* Events & Calendar */}
          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="events/find" element={<FindEvents />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="calendar/event/:eventId" element={<CalendarEventPage />} />

          {/* Activities & Visits */}
          <Route path="activities" element={<Activities />} />
          <Route path="visits" element={<Visits />} />

          {/* Volunteers */}
          <Route path="volunteers" element={<Volunteers />} />
          <Route path="volunteers/:id" element={<VolunteerDetail />} />
          <Route path="volunteer-hours-inbox" element={<VolunteerHoursInbox />} />

          {/* Kept features */}
          <Route path="field-notes" element={<FieldNotesPage />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="testimonium" element={<FeatureGate featureKey="testimonium"><Testimonium /></FeatureGate>} />
          <Route path="testimonium/:id" element={<TestimoniumReport />} />
          <Route path="testimonium/export" element={<FeatureGate featureKey="testimonium"><TestimoniumExports /></FeatureGate>} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/diocese" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><DioceseReport /></ProtectedRoute>} />

          {/* Parish Volunteer Portal */}
          <Route path="volunteers/parish" element={<ParishVolunteerPortal />} />
          <Route path="import" element={<ImportCenter />} />
          <Route path="playbooks" element={<Playbooks />} />

          {/* Settings & Profile */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/voice" element={<VoiceSettings />} />
          <Route path="settings/impact" element={<ImpactDimensionsPage />} />
          <Route path="settings/communio-profile" element={<CommunioProfileSetupWizard />} />
          <Route path="my-activity" element={<MyActivity />} />
          <Route path="help" element={<Help />} />
          <Route path="help/adoption" element={<AdoptionHub />} />
          <Route path="feedback" element={<Feedback />} />

          {/* Integrations & Import */}
          <Route path="relatio" element={<RelatioMarketplace />} />
          <Route path="relatio/setup/:connectorKey" element={<ImportWizard />} />
          <Route path="relatio/jobs/:id" element={<ImportJobDetail />} />

          {/* Community */}
          <Route path="communio" element={<Communio />} />
          <Route path="communio/caregiver-network" element={<CaregiverNetworkPage />} />
          <Route path="getting-started" element={<OnboardingGuide />} />
          <Route path="assessment/enneagram" element={<EnneagramAssessmentPage />} />

          {/* Family Portal */}
          <Route path="family" element={<FamilyPortal />} />
          <Route path="family/:slug" element={<FamilyPortal />} />

          {/* Tenant admin routes — require steward or admin role */}
          <Route path="admin" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><Admin /></ProtectedRoute>} />
          <Route path="admin/activation" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><Activation /></ProtectedRoute>} />
          <Route path="admin/team" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><TeamManagement /></ProtectedRoute>} />
          <Route path="admin/how-to" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><AdminHowTo /></ProtectedRoute>} />
          <Route path="admin/flocknote" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><FlocknoteImportWizard /></ProtectedRoute>} />
          <Route path="admin/do-not-email" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><DoNotEmail /></ProtectedRoute>} />
          <Route path="admin/email-providers" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><EmailProviders /></ProtectedRoute>} />
          <Route path="admin/guided-activation" element={<ProtectedRoute requiredRoles={['admin', 'leadership']}><GuidedActivationPrep /></ProtectedRoute>} />

          {/* Catch-all: show 404 for unmatched tenant sub-paths */}
          <Route path="*" element={
            <MainLayout title="Page not found" subtitle="">
              <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="text-center max-w-md">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
                  <p className="text-muted-foreground mb-4">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                </div>
              </div>
            </MainLayout>
          } />
        </Route>

        {/* Legacy redirects */}

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
