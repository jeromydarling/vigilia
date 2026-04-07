# CROS™ — Active Development Plan

---

## Current Status (2026-02-21)

### Completed Today

1. ✅ **Bridge → Add-on migration**: Removed Bridge from 4-tier hierarchy. Now 3 tiers (Core/Insight/Story) + Bridge as $49/mo add-on. Updated brand, features, pricing, stripe, gates, admin UI, marketing pages.

2. ✅ **À la carte add-on system**: Created `src/lib/addons.ts` with feature gating independent of plan tiers. Updated `canUse()` to check add-ons as fallback.

3. ✅ **CROS type aliases**: `src/types/cros.ts` — Partner, Person, TouchPoint, Region, Chapter.

4. ✅ **Communio Governance UI**: Review panel for data-boundary flags with approve/dismiss workflow.

5. ✅ **Admin How-To refactor**: Role-gated documentation. Tenant admins vs operator workflows separated. Accordion Q&A format.

6. ✅ **Shared section registry**: `src/lib/appSections.ts` — prevents content drift between Help and AdminHowTo.

7. ✅ **PWA/Offline support**: Service worker with cache-first static + network-first navigation.

8. ✅ **Visitor landing**: Warm empty state for the Visits page.

9. ✅ **Edge function standards doc**: Defensive patterns checklist.

10. ✅ **QA batch runner**: Full-suite sequential execution via GitHub Actions with consolidated email report.

---

## Outstanding / Next Steps

### High Priority

- [ ] **Archetype onboarding flow**: `archetypes` and `archetype_profiles` tables exist but no tenant-facing selection UI during onboarding.
- [ ] **Dark mode audit**: Newer modules (Communio, Governance, Visitor landing) need dark mode pass.
- [ ] **Communio governance workflow**: DB tables exist for governance flags but UI only has basic review — needs formal escalation/resolution workflow.

### Medium Priority

- [ ] **QA GitHub Actions workflow file**: The `qa.yml` workflow file needs to exist in the GitHub repo for batch runs to dispatch. Verify it's present and correctly configured.
- [ ] **QA secrets verification**: Ensure `GITHUB_QA_PAT`, `QA_PASSWORD`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` are set in edge function secrets.
- [ ] **Stripe product alignment**: Bridge Stripe product (`prod_U0Zcx0zjAS2j3c`) moved to addons map — verify `create-checkout` edge function handles it correctly in the addons flow.

### Lower Priority

- [ ] **Type migration**: Gradually replace raw `Opportunity`/`Contact` usage with CROS aliases (`Partner`/`Person`) across components.
- [ ] **Documentation registry adoption**: Wire `appSections.ts` into both Help.tsx and AdminHowTo.tsx (currently only documented, not wired).

---

## Operator CRM Expansion (Phase 7) — Prior Plan

This plan transforms the Operator Console from an analytics dashboard into a full CRM workspace. The work is split into 8 parts delivered sequentially.

---

## Part 1 -- Opportunity Table Extensions (Schema Migration)

Add 9 operator-specific columns to the existing `opportunities` table. All columns are nullable, so no existing queries or tenant workflows break.

New columns:

- `subscription_status text`
- `plan_tier text`
- `stripe_customer_id text`
- `tenant_slug text`
- `onboarding_state text`
- `seats_allocated integer`
- `seats_used integer`
- `last_activity_at timestamptz`
- `conversion_source text`

Single additive `ALTER TABLE` migration -- no column removals or renames.

---

## Part 2 -- Operator Metros

**Route:** `/operator/metros`

Create `src/pages/operator/OperatorMetrosPage.tsx` that reuses the existing `useMetrosWithComputed`, `useCreateMetro`, `useUpdateMetro`, `useDeleteMetro` hooks. The page will be a near-identical port of the tenant `Metros.tsx` page but without `MainLayout` wrapping (uses `OperatorLayout` via the route shell).

Full CRUD: list with search/filter, create dialog, edit, delete with confirmation.

Add the route to `AppRouter.tsx` and the "Metros" nav item to `OperatorLayout.tsx` sidebar (with `MapPin` icon).

---

## Part 3 -- Partners (Operator Opportunities)

**Routes:** `/operator/partners` and `/operator/partners/:slug`

Create two pages:

- `src/pages/operator/OperatorPartnersPage.tsx` -- List/filter/search all opportunities (reusing `useOpportunities` hook). Labeled "Partners" in the sidebar.
- `src/pages/operator/OperatorPartnerDetailPage.tsx` -- Full opportunity detail view including:
  - Existing tabs (reflections, contacts, activities, journey)
  - New "Subscription" info block showing the new operator columns (subscription_status, plan_tier, stripe_customer_id, seats, onboarding_state)
  - Communio status badge (read from existing communio data if linked)

These will reuse existing hooks (`useOpportunities`, `useUpdateOpportunity`, `useContacts`, `useActivities`) and existing sub-components where possible (e.g., inline edits, signal badges).

Add routes to `AppRouter.tsx` and "Partners" nav item to `OperatorLayout.tsx` (with `Building2` icon).

---

## Part 4 -- Operator Scheduling

**Route:** `/operator/scheduling`

Create `src/pages/operator/OperatorSchedulingPage.tsx` that reuses the existing calendar/events system (`useCalendarData`, `useEvents`, `useCreateEvent`, `useUpdateEvent`).

Since `event_type` is a plain `text` column (not an enum), no migration is needed to support new values. The three new event types will be added as selectable options in the operator scheduling UI:

- `outreach_meeting`
- `demo_session`
- `onboarding_call`

The page will display a calendar view filtered to operator-created events (using `owner_id` or a new operator scope filter). Reuses the existing `CalendarPage` patterns.

Add route to `AppRouter.tsx` and "Scheduling" nav item to `OperatorLayout.tsx` (with `Calendar` icon).

---

## Part 5 -- Outreach Campaigns + Tracking Links

### Schema Migration

Create new table:

```text
operator_signup_links
  id            uuid PK default gen_random_uuid()
  slug          text unique not null
  campaign_name text not null
  created_by    uuid references auth.users(id)
  default_archetype text
  created_at    timestamptz default now()
```

RLS: Enable RLS, admin-only read/write policy using `has_role(auth.uid(), 'admin')`.

### Edge Function: `operator-signup-track`

Accepts a `slug` query parameter, looks up the `operator_signup_links` row, creates a lead opportunity with `conversion_source` set to the campaign name, and redirects to `/pricing`.

### UI

Create `src/pages/operator/OperatorOutreachPage.tsx` with:

- List of signup links with copy-to-clipboard
- Create new link form (slug, campaign name, archetype)
- Link performance stats (count of opportunities with matching conversion_source)

Add route `/operator/outreach` and "Outreach" nav item to sidebar (with `Mail` icon).

---

## Part 6 -- Customer Conversion Flow

When an operator sets an opportunity's stage to a "customer" equivalent (we will use `"Agreement Signed"` or add a dedicated `"Customer"` value -- keeping with existing enum values, `"Agreement Signed"` is the closest fit):

### Edge Function: `operator-convert-customer`

Triggered from the Partner detail page via a "Convert to Customer" button. The function will:

1. Call the existing `tenant-bootstrap` edge function logic to create a tenant
2. Write `tenant_slug` back to the opportunity record
3. Populate `subscription_status`, `plan_tier`, `seats_allocated` from inputs
4. Return the new tenant slug

### UI Changes

- Add a "Convert to Customer" action button on the Partner detail page (visible only when the opportunity has no `tenant_slug`)
- Once converted, show tenant info inline with a "View Tenant" link to `/operator/tenants/:id`
- Tenant overview page (`OperatorTenantDetailPage`) becomes a read-only mirror that links back to the Partner profile as the source of truth

---

## Part 7 -- Sidebar Reorganization

Update `OperatorLayout.tsx` sidebar to the new hierarchy:


| Label       | Route                  | Icon         |
| ----------- | ---------------------- | ------------ |
| Dashboard   | /operator              | Activity     |
| Partners    | /operator/partners     | Building2    |
| Metros      | /operator/metros       | MapPin       |
| Scheduling  | /operator/scheduling   | Calendar     |
| Outreach    | /operator/outreach     | Mail         |
| Tenants     | /operator/tenants      | Users        |
| Demo Lab    | /operator/scenario-lab | FlaskConical |
| Testimonium | /operator/testimonium  | BookOpen     |
| Communio    | /operator/communio     | Shield       |


Remove or collapse less-used items (Intake, Automation, System, Integrations, Platform, Sweeps, Tour, How-To) into a collapsible "System" group at the bottom.

All layouts remain mobile-first with the existing hamburger menu pattern.

---

## Part 8 -- Safety / RLS

All new tables and queries enforce operator-only access:

- `operator_signup_links`: RLS policy requires `has_role(auth.uid(), 'admin')`
- Opportunity operator columns are plain nullable text/int fields on an existing table -- existing RLS policies already govern access
- The `operator-signup-track` edge function uses service-role key for writes (creating lead opportunities) and validates the slug input
- The `operator-convert-customer` edge function validates admin JWT before performing any mutations
- No changes to tenant-scoped RLS policies or workflows

---

## Technical Summary of File Changes

**New files (7):**

- `src/pages/operator/OperatorMetrosPage.tsx`
- `src/pages/operator/OperatorPartnersPage.tsx`
- `src/pages/operator/OperatorPartnerDetailPage.tsx`
- `src/pages/operator/OperatorSchedulingPage.tsx`
- `src/pages/operator/OperatorOutreachPage.tsx`
- `supabase/functions/operator-signup-track/index.ts`
- `supabase/functions/operator-convert-customer/index.ts`

**Modified files (3):**

- `src/components/layout/OperatorLayout.tsx` (sidebar nav restructure)
- `src/components/routing/AppRouter.tsx` (5 new routes)
- `supabase/config.toml` (2 new edge function entries with `verify_jwt = false`)

**Database migrations (2):**

1. Add 9 columns to `opportunities`
2. Create `operator_signup_links` table with RLS
3. This is Profunda, exactly as it exists, for the Operator 

This plan remains valid for the Operator Console workspace expansion. See CHANGELOG.md for incremental progress.
