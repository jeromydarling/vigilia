# Vigilia — Build Completion Specification

**This document is the final authority on what "done" means.**
Lovable: read this BEFORE writing any code. Read it AGAIN before marking any task complete.

---

## The Rule

**Nothing is done until it works end-to-end in a browser.**

Not "compiles." Not "no errors." Not "the component renders." DONE means:
- A user can click it
- Data flows from the UI to the database and back
- The feature works on mobile
- Edge cases don't crash the page
- The demo mode shows it working

If you create a button that calls a function that calls a service that calls an edge function that writes to a table — ALL of those layers must exist, be imported, be wired, and produce a visible result. **If any layer is a stub, TODO, placeholder, or "will be implemented later," it is NOT done.**

---

## Common Lovable Mistakes — DO NOT REPEAT

### 1. Commented imports with live usage
NEVER comment out an import while leaving the symbol in use:
```typescript
// BAD — this crashes at runtime
// import { useMetros } from '@/hooks/useMetros';
const { data } = useMetros(); // ← ReferenceError
```
If you remove a feature, remove ALL references to it. Search the entire codebase for the symbol name before deleting the file.

### 2. Hooks that call Supabase tables that don't exist
Every `supabase.from('table_name')` call must have a corresponding migration in `supabase/migrations/`. If you create a hook that queries `family_memories`, there must be a `CREATE TABLE family_memories` migration.

### 3. Edge functions referenced but not created
If the client calls `supabase.functions.invoke('generate-text')`, the file `supabase/functions/generate-text/index.ts` must exist with a working Deno `serve()` handler.

### 4. Components that import from deleted files
When removing legacy features, you MUST:
1. Delete the file
2. Search for ALL imports of that file across the codebase
3. Remove or replace every import
4. Remove every JSX usage of the deleted component
5. Build and verify zero errors

### 5. "Scaffold now, wire later"
**Never.** Do not create a UI component that shows fake data with a comment "// TODO: wire to real data." Either wire it or don't build it. Half-built features are worse than no features — they give the impression something works when it doesn't.

---

## What "Wired" Means — The Checklist

For every feature, verify ALL layers:

### UI Layer
- [ ] Component renders without errors
- [ ] Component renders on mobile (375px viewport)
- [ ] All buttons/links have working click handlers
- [ ] Loading states show while data fetches
- [ ] Empty states show when no data exists
- [ ] Error states show when queries fail
- [ ] No console errors in browser dev tools

### Data Layer
- [ ] Hook imports are real (not commented out)
- [ ] Hook queries correct Supabase table
- [ ] Table exists in a migration file
- [ ] RLS policies exist for the table
- [ ] Mutations call real Supabase insert/update/delete
- [ ] Mutations invalidate correct query keys after success
- [ ] Toast notifications confirm actions to the user

### Edge Function Layer (if applicable)
- [ ] Edge function file exists in `supabase/functions/`
- [ ] Function handles CORS preflight (OPTIONS)
- [ ] Function validates authorization header
- [ ] Function uses service role key for privileged operations
- [ ] Function returns proper JSON responses with status codes
- [ ] Function handles errors gracefully (try/catch, error response)

### Route Layer
- [ ] Page is imported in `AppRouter.tsx`
- [ ] Route is defined with correct path
- [ ] Route has appropriate role protection (`ProtectedRoute`)
- [ ] Navigation links/buttons point to the correct route
- [ ] Page is accessible from sidebar/menu

### Demo Mode
- [ ] Feature works in demo mode (`/demo?bypass=vigilia`)
- [ ] Write operations are intercepted (no real data written)
- [ ] Demo toast shows on write attempts
- [ ] No crashes when demo write proxy intercepts mutations

---

## The Build Order

When building a new feature, follow this EXACT order:

1. **Migration** — Create the database table first
2. **Types** — Define TypeScript interfaces
3. **Hook** — Create the React Query hook with real Supabase queries
4. **Edge Function** — If the feature needs server-side logic
5. **Component** — Build the UI that uses the hook
6. **Route** — Add to AppRouter.tsx with protection
7. **Navigation** — Add to sidebar/menu
8. **Test** — Verify in browser (demo mode)

Do NOT skip steps. Do NOT build step 5 before step 1.

---

## API Keys & Secrets — LAST

Environment variables and API keys are the LAST thing to configure. Everything else must work first:

- `LOVABLE_API_KEY` — For AI gateway (LLM calls)
- `RESEND_API_KEY` — For email sending
- `LULU_API_KEY` / `LULU_API_SECRET` — For print fulfillment
- `SUPABASE_SERVICE_ROLE_KEY` — For edge functions

**The app must gracefully handle missing keys.** Every edge function should check for its required key and return a clear error message if it's missing — not crash silently.

---

## Vigilia-Specific Architecture

### Core Tables (must exist in migrations)
- `visit_rituals` — The 30-second visit capture
- `family_reflections` — AI-composed narrative reflections
- `weekly_chapters` — Weekly narrative summaries
- `sacramental_records` — Communion, confession, anointing, etc.
- `loneliness_scores` — Daily drift detection scores
- `print_jobs` — Lulu print fulfillment tracking
- `family_memories` — Family-contributed photos/stories
- `catholic_health_knowledge` — CHA/ERD reference content
- `voice_notes` — Audio recordings with transcripts
- `eucharistic_minister_schedules` — Volunteer scheduling
- `parish_facility_links` — Parish-facility relationships
- `chaplain_assignments` — Chaplain facility assignments
- `contact_household_members` — Family circle relationships

### Core Edge Functions (must exist in supabase/functions/)
- `generate-text` — LLM proxy for narrative synthesis
- `vigilia-generate-journal-pdf` — Seasonal journal PDF
- `vigilia-lulu-webhook` — Print order status updates
- `vigilia-family-invite` — Magic link family invitations
- `vigilia-send-family-digest` — Weekly email digests
- `vigilia-compute-loneliness` — Daily isolation scoring
- `vigilia-drift-alerts` — Drift notification dispatch
- `voice-transcribe` — Audio transcription

### Core Hooks (must exist and import correctly)
- `useVisitRituals` — Visit CRUD + synthesis trigger
- `useFamilyReflections` — Family journal data
- `useVigilMode` — End-of-life care mode
- `useSacramentalRecords` — Sacrament tracking
- `useLonelinessWatch` — Drift detection
- `useDioceseReport` — Mission report aggregation
- `useParishVolunteers` — Volunteer scheduling
- `useFamilyDigest` — Email digest preferences
- `useHeldReflections` — Flagged reflection review
- `useFamilyMemories` — Family contributions
- `useCatholicKnowledge` — CHA/ERD knowledge base
- `useNarrativeSynthesis` — AI reflection generation

### Quality System (must be wired)
- `reflectionValidator.ts` — 3-layer validation (rules + consistency + AI review)
- Held reflections route to facility admin at `/:slug/review/reflections`
- Print gate filters in `vigilia-generate-journal-pdf`
- Validation score saved on every reflection

---

## Validation: How to Verify Completion

Before declaring ANY work complete, run these checks:

```bash
# 1. TypeScript compiles
npx tsc --noEmit

# 2. Vite builds for production
npx vite build

# 3. Marketing tests pass (50 tests)
npx playwright test tests/comprehensive.spec.ts

# 4. In-app tests pass (35 tests)
npx playwright test tests/in-app.spec.ts

# 5. No runtime crashes in demo mode
# Navigate to /demo?bypass=vigilia and click through:
# - Dashboard
# - Today's Visits
# - People/Residents
# - Family Journal
# - Diocese Report
# - Parish Volunteers
# - Settings
```

If ANY of these fail, the work is not done.

---

## The Standard

This app generates text that will be printed in physical books, held by families at funerals, and kept on shelves for decades. The code must be as careful as the words it produces. No shortcuts. No scaffolding. No "good enough." Every feature wired front to back, every edge function handling errors, every page rendering on mobile, every write protected in demo mode.

**Ship it like someone's grandmother will hold the result in her hands.**
