# AGENTS.md — UNNATI (SIH26101) Build Context
*Fact-checked Sept 2026 against MoSPI, Mission Karmayogi/CBC, Sunbird, and Bhashini primary sources. Corrections vs. earlier drafts are marked ✅ VERIFIED inline — treat this file as ground truth over anything you "recall" about FRAC, MoSPI's structure, or Sunbird-CB.*

## Mission
Build **UNNATI** (उन्नति — growth/upliftment) — an AI-enabled competency-gap and adaptive
learning platform for MoSPI officials, for SIH26101 (MoSPI · Smart Education / Capacity
Building · Software).

**The literal ask, read straight:** identify competency gaps in India's Official
Statistical System → recommend tailored training via iGOT Karmayogi integration →
auto-generate quizzes/MCQs from uploaded training material. The PS is short because MoSPI
is testing whether the team can fill in the ecosystem knowledge it assumes (FRAC, iGOT/
Sunbird, CBC, TNA/ACBP) — not whether it can build a form and a chatbot. **Build the
ecosystem-aware version, not the keyword-matcher version.**

Public SIH26101 attempts converge on four screens: profile form, gap radar, a course list
pointing at iGOT, PDF→MCQ generator. That convergence is the opportunity. What actually
separates a working demo from a system a ministry could pilot:
1. Real FRAC taxonomy (BDF), not an invented one.
2. A real `igot-adapter` shaped to the public Sunbird Knowlg schema, not a hardcoded list.
3. Traceable assessment — every MCQ carries competency, level, Bloom tag, source chunk,
   rationale, and sits in a review queue before a learner ever sees it.
4. A **closed loop**: gap → recommendation → training → quiz → quiz result updates
   proficiency → gap model and recommendations re-run. This is the one genuinely "adaptive"
   piece almost nobody in the reference set implements end-to-end.
5. Field-official-first: Bhashini multilingual + PWA offline, because NSSO field staff and
   state DES units don't all have great connectivity or English fluency.
6. Government-HR-data-from-day-one: every LLM call behind a swappable gateway
   (cloud ↔ self-hosted), because "we use a cloud LLM on HR data with no alternative" is a
   real objection a security round will raise.
7. A decision-grade admin layer: forecasting (supply vs. projected demand by division) and
   an auto-drafted **ACBP** on the real three-lens CBC structure — a concrete export, not a
   bar chart.

**Explainability is the strongest card in the deck.** Every AI output carries a `rationale`
string, visible in-product, not just logged. For a government evaluator this matters more
than raw model quality, and it's what separates the build from most black-box submissions.

---

## Non-negotiable architectural decisions (do not silently change these)
- Two backend services: `core-api` (NestJS/TS) and `ai-service` (FastAPI/Python), talking
  over REST. Do not merge them into one service — the AI layer gets rewritten constantly
  during tuning and decoupling it means models can be swapped without redeploying the
  transactional core.
- Single Postgres instance with the `pgvector` extension for embeddings. Do not introduce a
  separate vector database.
- ✅ VERIFIED (Mission Karmayogi FRAC source docs, ISTM/CEGIS, cross-checked Sept 2026):
  the competency model follows the **real FRAC shape**: `Role → Activity → Competency →
  ProficiencyLevel (1–5)`, where each Competency has `category ∈ {BEHAVIOURAL, DOMAIN,
  FUNCTIONAL}` — **not** a four-way "Statistical/Technical/Digital/Behavioural" split. If
  you find code implying a fourth top-level category, that's a bug against the spec — flag
  it, don't extend it. Statistics-specific subject tags (Sampling Theory, National
  Accounts, GIS, Data Governance…) are a secondary attribute on Domain/Functional
  competencies, not a category of their own.
- Every AI-generated artifact (MCQ, recommendation) carries a `rationale` field and a
  `review_status` (`PENDING | APPROVED | REJECTED` for MCQs). No AI-generated question is
  servable to a learner until it is `APPROVED`. No black-box outputs, no skipping the
  review-queue state machine "for the demo." Every state transition (who approved/rejected,
  when, with what edit) is written to an append-only `AuditLogEntry` table — this is what
  makes "human-in-the-loop" a real, demo-able, HR-auditable claim instead of a slide.
- Course/content objects are shaped to be schema-compatible with the **public Sunbird
  Knowlg content/collection schema** (`schemas/content/1.0`, repo now lives at
  `github.com/Sunbird-Knowlg/knowledge-platform` — the org was renamed from `project-sunbird`;
  if you land on a `project-sunbird/*` URL follow the redirect and pin the `Sunbird-Knowlg`
  one). Pull and pin this fixture at `/docs/schemas/sunbird-content-fixture.json` as a
  **prerequisite task before writing `igot-adapter`** — do not hand-guess field names from
  memory.
- LLM calls go through a single gateway module (`ai-service/llm_gateway`) — never call a
  model API directly from a route handler or a script. This is what lets cloud ↔
  self-hosted (Ollama/vLLM) be swapped via one config value (`LLM_PROVIDER=anthropic|ollama|vllm`)
  without touching business logic.
- ✅ VERIFIED (MoSPI "Know Your Ministry" Feb 2025, PIB year-end review 2024, MoSPI order
  dated 23.09.2024): seed data for divisions must use MoSPI's **current** division names.
  SDRD (Survey Design and Research Division) was formally re-designated **Household Survey
  Division (HSD)** in a Sept 2024 reorganisation order. Do not reintroduce "SDRD" as a
  division name in seed data, UI copy, or fixtures — see §7 below for the full current list.
- No secrets, API keys, or `.env` files are ever committed. All config comes from
  environment variables documented in `/infra/.env.example`; each service fails fast at
  boot with a clear error if a required variable is missing, rather than falling back to a
  silent default.

---

## Tech stack
| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Fast dev loop |
| UI | Tailwind CSS + shadcn/ui | Accessible, themeable to the govt-clean palette in §6 |
| Charts | Recharts | Radar/heatmap/trend support, good TS types |
| State/data | TanStack Query + Zustand | Server cache vs. UI state separated cleanly |
| Core API | NestJS (Node/TS) + Prisma | Modular; strict-mode TS; migrations via Prisma |
| AI/ML service | FastAPI (Python) + LangChain/LlamaIndex | Best ecosystem for RAG/embeddings/LLM orchestration |
| DB | PostgreSQL + `pgvector` | One database for relational + embeddings, nothing extra to operate |
| Cache/queue | Redis + BullMQ | Async jobs: PDF parsing, embedding, quiz generation |
| Auth | Keycloak (OIDC) | Real IAM story; supports the LTI 1.3 / token-auth SSO narrative for iGOT |
| LLM access | `llm_gateway` module (cloud or self-hosted Ollama/vLLM) | Cloud for demo quality, self-hosted swap for the data-governance argument — no code change |
| Object storage | MinIO (S3-compatible) | Uploaded PDFs/PPTs, works fully on-prem |
| Translation/voice | Bhashini Open APIs (via ULCA) | Real, verifiable government-native multilingual stack — do not swap in a generic translation API without discussion, this is a named product differentiator |
| Infra | Docker Compose (dev) → k8s manifests (prod-story) | Shows a deploy path without needing to run real k8s for the demo |
| Observability | OpenTelemetry + Grafana dashboard | Signals a production mindset, not just a demo |
| PWA | Vite PWA plugin | Offline cache for dashboard + downloaded course material |
| Testing | Jest + Supertest (core-api), pytest + httpx (ai-service), Playwright (e2e) | Every service has a real test runner from day 0, not "we'll add tests later" |

**Integration layer specifics:**
- `igot-adapter`: course objects shaped to the pinned Sunbird Knowlg schema fixture, with a
  clearly labeled mock server behind the same interface as the real one — so the pitch can
  say "point this at the real content API and change one config value," which is true.
- SSO: OIDC via Keycloak as the primary path; document an LTI 1.3 launch contract as the
  integration point for a live Karmayogi instance, presented as "the integration contract
  we'd confirm with NIC," not as an already-working connection.
- `llm_gateway`: every response validated against a pydantic schema requiring a `rationale`
  field. Rate-limit and cost-guard this module (max tokens, max calls/min) so a demo
  session can't accidentally blow through API quota.

---

## Repo layout
```
/apps/web             React frontend
/services/core-api    NestJS service
/services/ai-service  FastAPI service
/packages/shared      shared TS types (generated from OpenAPI/Prisma schema)
/infra/docker         docker-compose + k8s manifests
/docs                 BLUEPRINT.md, ADRs, API contracts, schema fixtures
```
- API convention: `core-api` exposes `/api/v1/...`; breaking changes get `/api/v2/...`
  alongside, never an in-place breaking edit to `v1` while a frontend build still targets it.
- OpenAPI spec is generated from NestJS decorators (`@nestjs/swagger`) — this is the source
  the `/packages/shared` client generation and the AI-service's core-api client both read
  from. Never hand-edit the generated client.

---

## Code understanding rules — use the LSP, don't pattern-match
- Before editing any shared code, **use the LSP tool** to inspect the real symbol
  definition, type signature, and call sites. Do not infer a function's contract from its
  name or a grep match alone. This applies especially to Prisma-generated types and the
  shared `/packages/shared` types consumed by both frontend and core-api.
- Before modifying any cross-service contract (anything under `/packages/shared` or an
  OpenAPI schema): grep for all usages across both services first, then confirm with the
  LSP's "find references" that every call site is accounted for — grep alone will miss
  re-exports and destructured imports.
- Before implementing anything that touches the FRAC taxonomy, ACBP structure, or the
  Sunbird content schema: re-read the relevant fixture/schema file on disk rather than
  relying on this prompt from memory — these are checked-in ground truth, not a
  description to reconstruct.
- Prefer small, compilable increments. Run the relevant service's typecheck/test command
  after each edit rather than batching many changes and debugging at the end.

---

## Agent / subagent workflow (opencode)
Use a primary orchestrator agent plus scoped subagents so context stays small and focused
per task. Wire each as a file under `.opencode/agent/`, with YAML frontmatter scoping its
`permission` (which directories/tools it can touch) and a short system prompt restating its
lane from this file.

- **`frontend-agent`** — owns `/apps/web` only. Tailwind + shadcn conventions per §6 (color
  variables, type scale, component list). No direct DB or LLM calls; talks to core-api only
  via the generated OpenAPI client. Never introduces a new accent color or component
  pattern outside the design system without flagging it to the orchestrator first.
- **`core-api-agent`** — owns `/services/core-api`. NestJS module boundaries, Prisma
  migrations, auth guards, the FRAC/gap/ACBP domain logic. Never writes prompt/LLM logic.
- **`ai-service-agent`** — owns `/services/ai-service`. RAG pipeline, MCQ generation,
  embeddings, recommendation scoring, the `llm_gateway` module. Never touches the primary
  Postgres transactional tables directly — goes through core-api's internal API for
  anything transactional. Every function that returns an AI-generated artifact returns a
  structured object with a `rationale` field, enforced at the pydantic model level.
- **`infra-agent`** — owns `/infra` and CI config only. Owns the CI pipeline (lint →
  typecheck → test → build, per service, gated on PR) and the `.env.example` files; never
  writes application logic.

The orchestrator's job: break a feature request into per-service tasks, dispatch to the
right subagent, and verify the shared-type contract between frontend/core-api/ai-service
stays consistent after all three land. A subagent never unilaterally edits a file outside
its owned directory — if it needs to, it raises that back to the orchestrator instead of
reaching across the boundary.

---

## Automations / workflow triggers
- On any change under `/packages/shared`: regenerate the OpenAPI client and re-run
  typecheck in both `/apps/web` and `/services/core-api` before considering the task done.
- On any change to the Prisma schema: run `prisma migrate dev` and regenerate the client as
  part of the same task, not a follow-up.
- Before marking any backend task complete: run that service's test suite and lints. Don't
  rely on "it should work."
- Seed data changes (FRAC taxonomy, mock course catalog, division list) live in
  `/services/core-api/prisma/seed.ts` — keep this idempotent so it can be re-run during
  demos without duplicating rows. Any edit to division names must match §7 exactly.
- On any change to `/docs/schemas/sunbird-content-fixture.json`: re-run the
  `igot-adapter`'s contract test to confirm mapped course objects still validate against
  the fixture.
- MCQ generation is idempotent per source-chunk: re-running generation against the same
  uploaded document and competency target must not create duplicate `PENDING` questions —
  check for an existing question keyed on `(source_document_chunk_id, competency_id,
  target_level)` before inserting.

---

## Conventions
- TypeScript everywhere on the Node side, strict mode on.
- Python: type hints + pydantic models for every FastAPI route, no untyped dicts crossing
  the API boundary.
- Every AI-service function that calls an LLM returns a structured object with a
  `rationale` field, enforced at the model level, not by convention.
- Conventional commits (`feat`/`fix`/`chore`/`docs`) scoped by service, e.g.
  `feat(ai-service): add bloom-level tagging to MCQ generator`.
- Accessibility: WCAG 2.1 AA as a baseline for any screen an officer uses daily (color
  contrast, keyboard nav, form labels) — this is a government digital-service product, not
  a marketing site, and accessibility is a real evaluation criterion, not a nice-to-have.

## What "done" means for any task
1. Code compiles/typechecks in every affected service.
2. Relevant tests pass, and CI is green.
3. If a cross-service contract changed, both sides were updated in the same task, not left
   for later.
4. If it's an AI-facing feature, it has a `rationale`/explainability field wired through to
   the frontend, not just logged server-side.
5. If it touches FRAC, ACBP, division names, or the iGOT/Sunbird schema, it matches §7
   exactly — these were fact-checked against primary sources and are not to be "improved"
   from memory.
6. If it's a review-workflow action (approve/reject/edit an MCQ, override a proficiency
   score), it writes an `AuditLogEntry` — silently mutating state without an audit trail is
   a bug, not a shortcut.

---

## Users — four distinct products sharing one data model
| Role | Primary jobs | Never does |
|---|---|---|
| **Officer / Learner** (JSO, SSO, ISS, equivalents) | View own FRAC competency profile, self-assess, enroll in recommended courses, take quizzes, see before/after proficiency | Sees only their own data; no cross-officer visibility |
| **Reporting / Supervisor Officer** | Validate/override self-assessed proficiency, endorse training nominations, view team-level gap heatmap | Cannot edit FRAC taxonomy or global settings |
| **Division L&D Admin** (DIID/NSSTA/Capacity Development Division user) | Own division's heatmap, forecasting view, generate/edit the division's ACBP, manage course catalog mapping | Cannot see other ministries' data |
| **Platform / Content Admin** | Manage FRAC taxonomy versions, review AI-generated MCQs before publish, manage `llm_gateway` config, audit log | Operational, not a training role |

Tenancy: build single-tenant for the MoSPI pilot (one ministry, one FRAC taxonomy version
active at a time), but keep `division_id`/`ministry_id` as explicit foreign keys everywhere
rather than assumed-singleton so a later multi-ministry rollout is a config change, not a
schema rewrite.

---

## Feature set
**Core (must-have — matches the PS literally):**
- Officer profile: role/cadre (ISS/SSS/JSO/SSO-equivalent), division, tenure, posting
- FRAC-aligned competency assessment: self-assessment + supervisor validation +
  AI-inferred signal from uploaded work artifacts
- Gap analysis: per-competency gap size, priority (HIGH/MED/LOW), trend over time
- Course recommendation against the iGOT/Sunbird-shaped catalog (NSSTA-TPAC + internal
  courses as fallback content)
- Upload material (PDF/PPT/DOCX) → RAG-grounded MCQ + quiz generation, tagged to
  competency + level + Bloom's level
- Learner dashboard + Division Admin dashboard

**Differentiators (the part that wins):**
- Closed feedback loop: quiz score → proficiency re-score → recommendation re-run,
  visualized as a **before/after radar overlay**
- Explainability panel on every AI artifact: "why this course," "why this question," with
  a citation back to the source chunk or competency rule
- Forecasting: supply-vs-demand projection by division, flagged risk competencies for next
  quarter
- Auto-drafted **ACBP** export (PDF/DOCX) structured on the CBC's three lenses — National
  Priorities, Emerging Technologies, Citizen Centricity — pre-filled from TNA-style gap
  data, human-editable before export
- Bhashini-backed multilingual UI + content translation + PWA offline mode
- Division heatmap across the real MoSPI structure (§7)

**Stretch (only if time remains):**
- Voice micro-assessments via Bhashini ASR for field officers
- Anonymized peer-benchmarking within cadre/level
- Nudge bot for pending mandatory training

**Screens that must exist, specifically:**
1. Officer home — proficiency radar + top 3 priority gaps + next recommended action
2. Assessment flow — one competency at a time, self-rating + evidence upload, 1–5
   proficiency rubric with anchor labels (not a bare slider)
3. Course detail — mapped competencies + target level + source + explainability line
   ("recommended because: Sampling Theory gap = 2 levels, this course targets level 3–4")
4. Quiz-taking — question + Bloom-level badge (admin/reviewer view only) + timer +
   immediate scored feedback with rationale
5. Division Admin heatmap — competency × sub-division grid, color intensity = gap size,
   click-through to officer list
6. ACBP builder — three-lens tabbed editor, pre-populated from gap data, export to
   PDF/DOCX
7. Content Admin review queue — every AI-generated MCQ sits here pending approval,
   approve/edit/reject with rationale shown inline and written to the audit log

---

## Design system
**Direction:** government-clean, not startup-flashy. Neon gradients and glassmorphism read
as hackathon toys, not something IT security would approve. Target the register of a
well-run enterprise dashboard, not a SaaS landing page.

**Color system** (CSS variables, never ad-hoc hex in components):
- Primary: desaturated Digital-India blue `#1B4B91` (headers, primary actions, nav)
- Secondary/accent: muted saffron/amber `#C4732A` — sparingly, "attention" states only
  (priority badges, forecast risk), never a background wash
- Neutral: 8-step grey ramp `#F7F8FA` → `#1A1D23` for surfaces/text — most of the UI lives
  here, this is a data-dense dashboard, not a marketing site
- Semantic: success `#2E7D4F`, warning `#B8860B`, danger `#B3261E` — reserve pure red for
  genuinely blocking states, not routine "gap" indicators
- FRAC-domain coding (consistent across every chart/badge/tag): Behavioural = amber
  `#C4732A`, Domain = blue `#1B4B91`, Functional = teal `#0F7A72`. Layer statistics subject
  tags (Sampling, National Accounts, GIS, Data Governance…) as a secondary badge under
  whichever BDF category they belong to — never invent a fourth color category.

**Typography:** one serif-free family for everything (Inter or IBM Plex Sans — the latter
has genuine Indian-script family support, useful once Bhashini localization lands). Scale:
12/14/16/20/24/32px, base body 14–16px given how much of the UI is tables and stat cards.
Numerals get tabular-figure alignment in every data table.

**Layout conventions:**
- Persistent left nav (Profile · Assessments · Courses · Quizzes · Reports), not a
  hamburger — officers use this daily, optimize for muscle memory
- Language switcher in the header, always visible, not buried in settings
- 12-column grid, generous (24px+) gutters; density comes from good tables, not tiny tiles
- Radar/spider chart for individual competency profile, plus the before/after overlay (two
  semi-transparent radar traces, pre-/post-training-cycle) — the signature visual that
  sells "this is adaptive"

**Explicitly avoid:** stock "AI robot" hero illustrations, purple-to-pink gradients, emoji
as UI icons, more than one accent color fighting for attention on a single screen,
auto-playing anything, confetti/celebration on routine actions (reserve motion for
completing a training cycle and seeing the before/after radar animate).

---

## Ground truth: FRAC and MoSPI structure — use exactly, don't re-derive

**FRAC (Framework of Roles, Activities and Competencies)** — Mission Karmayogi's
Competency Framework pillar. FRACing maps, for every position: Role → Activities →
Competencies (+ supporting knowledge resources). ✅ VERIFIED across ISTM/CEGIS source docs
and CBC material: competencies fall into three categories — **Behavioural, Domain, and
Functional (BDF)**:
- **Behavioural** — traits/motives/social-role competencies (stakeholder communication,
  ethical decision-making)
- **Domain** — subject-matter expertise (for MoSPI: Sampling Theory, National Accounts,
  Price Statistics methodology, Survey Design…)
- **Functional** — competencies needed to execute the role regardless of domain (data
  analysis tooling, report writing, project management, GIS/digital tools)

Proficiency is rated 1–5 per competency per officer. Build `Domain` exactly on this
three-category shape — don't invent a "Statistical vs. Technical vs. Digital" fourth axis;
tag Domain/Functional competencies with a statistics-specific subject taxonomy as a
secondary attribute instead.

**ACBP (Annual Capacity Building Plan)** — ✅ VERIFIED against CBC's published ACBP
Approach Paper and multiple completed ministry ACBPs (cbc.gov.in): a CBC-facilitated,
per-ministry document built from a **Training Needs Analysis (TNA)**, structured around
**three lenses: National Priorities, Emerging Technologies, and Citizen Centricity**, and
three pillars (individual, organisational, institutional). It documents both training and
non-training interventions. Your auto-drafted ACBP must output a document organized around
exactly these three lenses.

**MoSPI's current divisional structure** — ✅ VERIFIED against MoSPI's "Know Your Ministry"
(Feb 2025) and PIB's Year-End Review 2024:
- *NSS wing (four divisions, per the current structure):* Field Operations Division (FOD)
  · Household Survey Division (HSD — absorbed the old Survey Design and Research Division,
  SDRD, and part of the old Data Processing Division, in a Sept 2024 reorganisation) ·
  Enterprise Survey Division (EnSD — absorbed the Industrial Statistics wing and part of
  DPD) · Coordination and Quality Control Division (C&QCD)
- *Statistics wing:* Economic Statistics Division (ESD) · National Accounts Division (NAD)
  · Social Statistics Division (SSD) · Price Statistics Division (PSD)
- *Other:* Data Informatics & Innovation Division (DIID) · Capacity Development Division
  (CDD/NSSTA) · Coordination & International Cooperation Division (CICD) · Administrative
  Statistics & Policy Division (ASPD) · Administration

Seed demo data against a believable subset (e.g., FOD, ESD, NAD, DIID, HSD) — never the
retired "SDRD" name; a MoSPI-familiar reviewer will notice immediately. Division names do
get reorganised, so treat this list as "verify against mospi.gov.in before demo day," not
permanently frozen.

---

## Data model
```
Role (e.g., "SSO – Survey Design, HSD")
 └─ Activity (e.g., "Design a sample survey")
     └─ Competency (category: BEHAVIOURAL | DOMAIN | FUNCTIONAL, subject_tag: e.g. "Sampling Theory")
         └─ ProficiencyLevel (1–5)

OfficerCompetencyProfile
 - officer_id, competency_id, current_level, target_level,
   evidence_source (SELF | SUPERVISOR | QUIZ | AI_INFERRED), last_assessed_at

Course  (Sunbird-Knowlg-schema-compatible — validate field names against the
          pinned schema fixture before finalizing)
 - identifier, name, competencies[] (competency_id + target_level),
   source ("IGOT" | "NSSTA_TPAC" | "INTERNAL"), learning_outcomes[], organisation

Assessment / MCQ
 - question_id, competency_id, target_level, bloom_level,
   source_document_chunk_id, rationale, review_status (PENDING | APPROVED | REJECTED)

GapRecord
 - officer_id, competency_id, gap_size, priority (HIGH | MED | LOW), recommended_course_ids[]

ACBPDocument
 - division_id, cycle_year, lens (NATIONAL_PRIORITIES | EMERGING_TECH | CITIZEN_CENTRICITY),
   interventions[] (training | non_training), generated_from_gap_snapshot_id, status

AuditLogEntry
 - actor_id, actor_role, action (APPROVE_MCQ | REJECT_MCQ | EDIT_MCQ | OVERRIDE_PROFICIENCY | ...),
   entity_type, entity_id, before_state, after_state, rationale_shown, created_at
```

---

## Roadmap (hackathon-realistic)
1. **Day 0–1:** Repo scaffold, DB schema, auth, FRAC seed data (1–2 cadres' worth — depth
   over breadth), pull and pin the real Sunbird schema fixture
2. **Day 1–2:** Core API CRUD, officer profile, gap calc (simple current-vs-target delta is
   fine to start)
3. **Day 2–3:** AI service — RAG ingestion + MCQ generation with competency/Bloom tagging,
   review-queue workflow wired to Core API, audit log wired in from the start
4. **Day 3–4:** Recommendation engine, mock iGOT/Sunbird adapter, feedback loop (quiz
   result → proficiency update → re-recommend)
5. **Day 4–5:** Dashboards (learner + division admin heatmap), explainability panel, ACBP
   builder (three-lens structure)
6. **Day 5–6:** Bhashini multilingual pass, PWA offline, polish, seed a believable demo
   dataset using real (current) division names
7. **Day 6+:** Pitch deck, deploy story, rehearsal — rehearse "how would this actually
   connect to iGOT," the most likely hard question from a MoSPI judge

---

## Risks and how to answer them in Q&A
| Judge question | Weak answer | Strong answer |
|---|---|---|
| "Is this actually integrated with iGOT?" | "Yes, fully integrated" (false, will be caught) | "The adapter is schema-compatible with Sunbird Knowlg's public content schema and swaps to the live endpoint via one config value; the actual credential exchange with Karmayogi Bharat would need to be arranged during onboarding, which is standard for any external integration to a live GoI system." |
| "How do you handle officer HR data privacy?" | "We use a cloud LLM" | "Every model call goes through a gateway that can point at a self-hosted model, so no HR data needs to leave the deployment boundary if the ministry requires it." |
| "Why should we trust an AI-generated quiz question?" | "The AI is very accurate" | "Every question is tagged to a specific competency, level, and Bloom category, cites its source chunk, and sits in an admin review queue — with a full audit trail — before it's ever shown to a learner." |
| "Why FRAC and not your own competency list?" | (no good answer if you didn't build on FRAC) | "We modeled directly on the CBC's Behavioural/Domain/Functional structure so this plugs into the same taxonomy MDOs are already required to use for ACBP reporting." |
| "Is this accessible to officers with low digital literacy or poor connectivity?" | "We built a responsive website" | "Bhashini-backed multilingual UI, a PWA offline mode for field officers, and WCAG 2.1 AA as a baseline — this isn't a startup dashboard, it's a government digital service." |

---

*Sources checked: MoSPI's "Know Your Ministry" (Feb 2025) and organogram, MoSPI's Sept 2024
order re-designating SDRD as HSD and forming EnSD, PIB Year-End Review 2024, Capacity
Building Commission's ACBP Approach Paper and published ministry ACBPs (cbc.gov.in), FRAC
source documents (ISTM, CEGIS, DoPT-derived materials), Sunbird Knowlg's public
content/collection schema repository (github.com/Sunbird-Knowlg/knowledge-platform), and
Bhashini/DIBD/MeitY public materials on the Open Bhashini APIs. Re-verify division names and
any live-endpoint claims against mospi.gov.in and cbc.gov.in immediately before demo day —
government org charts do move.
