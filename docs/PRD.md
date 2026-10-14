# KEWAFLOW
## AI Marketing & Client Acquisition Platform
### PRODUCT REQUIREMENTS DOCUMENT
**Prepared for:** Kewakibt Software Solutions
**Version:** 1.1 (Revised)
**Date:** 14 October 2026
**Status:** Revised Baseline — Incorporates professional review findings

---

> **Cardinal Rule:**
> **AI generates. The Admin approves. KewaFlow publishes. Results guide growth.**

---

### DOCUMENT HYGIENE

| Field | Value |
|---|---|
| Document Owner | Kewakibt Software Solutions |
| Engineering Lead | TBD |
| Approver | TBD |
| Revision | v1.1 — 14 October 2026 (Scope contradictions fixed, NFRs added, state machine split, security hardened) |
| Normative Language | All requirements use "SHALL" (mandatory), "SHOULD" (recommended), "MAY" (optional) per RFC 2119 |

---

## §1. Executive Summary

KewaFlow is an approval-first AI marketing and client-acquisition platform for Kewakibt Software Solutions.

**Product principle:** AI assists with ideation and production; the Admin remains exclusively accountable for every external communication. No AI-generated post, image, or video SHALL be published until the Admin explicitly approves the exact final version.

**Business outcome:** A measurable path from content to genuine inquiries, qualified leads, proposals, and won clients — not merely more posts or likes.

### MVP Scope (Phases 1–3 only)
- Admin authentication with mandatory MFA.
- Brand profile configuration.
- AI text and image generation with immutable versioning and mandatory approval.
- Organic Facebook Page publishing via the official Meta Graph API.
- Durable scheduling with approval re-validation at dispatch.
- Basic lead record capture with source and follow-up status.
- Audit log and basic dashboard.

### Explicitly Out of Scope for MVP
- Template video creation (Phase 4).
- Community inbox and comment management (Phase 4).
- Paid advertising (Phase 5).
- Advanced lead attribution (Phase 5).
- Multi-tenant or multi-role operation (post-v1).

> Navigation items for Ads, Inbox, and Video SHALL be feature-flagged and hidden until the corresponding phase is complete.

---

## §2. Business Context and Problem

**Problem statement:** Small software companies often lack time for consistent marketing. Posts become irregular, generic, visually inconsistent, and disconnected from sales follow-up.

**KewaFlow's response:**
- Turn verified expertise into reusable brand knowledge.
- Keep explicit human approval between generation and publication.
- Use calls to action and track inquiries.
- Learn from actual performance and lead outcomes.

**Assumptions to validate before Phase 1:**
- Kewakibt has an existing Facebook Page and the Meta account that controls it.
- The company can authorize the Page via Meta OAuth.
- The Meta account can authorize a Developer-mode app for core publishing without full App Review (OD-007).

---

## §3. Vision, Goals, and Success Metrics

**Vision:** Give Kewakibt a reliable marketing operating system that converts verified expertise into consistent, approved communication and measurable sales opportunities.

**Goals:**
1. Manage the entire content workflow from one dashboard.
2. Maintain accurate, brand-consistent content with human approval.
3. Reduce content production effort.
4. Improve inquiry handling and follow-up.
5. Identify content themes that produce qualified opportunities.
6. Keep costs transparent and providers replaceable.

**Measurement rules:**
- SHALL NOT label likes or reach as leads.
- SHALL attribute leads to content only when a reliable identifier supports it.
- SHALL separate platform metrics from manually entered outcomes.
- SHALL display data freshness and missing permissions in every metric display.

**Baseline and targets:**
- Baseline collection SHALL begin at Phase 3 launch.
- Formal targets SHALL be set after **8 weeks of baseline data**.

---

## §4. Users, Role, and Permissions

**Single role: Admin.** The Admin configures the system, connects Meta, approves content, schedules publishing, manages leads, and controls advertising.

- **AUTH-001** SHALL verify the Admin session on every protected server route and action.
- **AUTH-002** Hiding a UI control SHALL NEVER be a security boundary.
- **AUTH-003** SHALL audit Meta connection changes, approvals, publishing events, and ad actions.
- **AUTH-004** Re-authentication SHALL be required for: Meta connection changes, any ad spend action, and Admin account modifications.
- **AUTH-005 — Mandatory MFA:** MFA SHALL be mandatory. Optional MFA is insufficient for an account controlling publishing and spending.
- **AUTH-006 — Break-Glass:** A documented break-glass procedure SHALL exist for Admin lockout, including identity verification and full audit trail.

**Separate permission domains:** Application Admin access SHALL NOT automatically grant Facebook Page or ad-account access.

---

## §5. Scope and Priorities (MoSCoW)

### Must Have — MVP (Phases 1–3)

| ID | Requirement |
|---|---|
| MH-001 | Admin authentication with mandatory MFA |
| MH-002 | Brand profile with verified services, voice, palette, prohibited claims |
| MH-003 | AI text generation grounded in brand profile |
| MH-004 | AI image generation with editable text overlays |
| MH-005 | Media library with upload, preview, and retention management |
| MH-006 | Immutable ContentVersion with deterministic hash |
| MH-007 | Approval workflow with friction UX, diff preview, expiry (30 days), AI-flag blocking |
| MH-008 | Meta OAuth connection with independent permission gating |
| MH-009 | Organic post publishing to connected Facebook Page |
| MH-010 | Durable scheduler with approval re-validation at dispatch |
| MH-011 | Multi-axis content state machine (§9) |
| MH-012 | Append-only, tamper-evident audit log |
| MH-013 | Lead record capture with source, status, and follow-up fields |
| MH-014 | Basic dashboard with real metrics and freshness timestamps |
| MH-015 | Backup, restore, and key rotation procedures |

### Should Have — Phase 4

| ID | Requirement |
|---|---|
| SH-001 | Template-based video creation with FFmpeg |
| SH-002 | Community inbox for Facebook comments and messages |
| SH-003 | AI-assisted reply drafting (Admin review required before sending) |
| SH-004 | Content performance comparisons |
| SH-005 | CSV export for leads and analytics |
| SH-006 | Generative video adapter (async, provider-based) |

### Later Release — Phase 5+

| ID | Requirement |
|---|---|
| LR-001 | Paid campaign creation with staged launch and double-confirmation spend |
| LR-002 | Advanced lead attribution with UTM tracking |
| LR-003 | Evidence-based content recommendations |
| LR-004 | Multiple AI provider choices per media type |

---

## §6. Dashboard and Brand Profile

- **DASH-001** SHALL display: Page connection health, permission status, draft/approval/scheduled/published/failed counts, upcoming items, lead pipeline totals, overdue follow-up reminders.
- **DASH-002** Production dashboards SHALL NEVER invent or simulate metrics.
- **DASH-003** SHALL display last-updated timestamps and "data unavailable" states per metric.
- **DASH-004** SHALL alert for: expired tokens, failed jobs, missing Meta permissions, and unresolved UNCERTAIN publish outcomes.
- **DASH-005** Quick-action buttons SHALL only appear for features available in the current phase.

- **BRAND-001** SHALL store: company name, description, contact details, website, social links.
- **BRAND-002** SHALL store: verified services (explicitly confirmed), problems solved.
- **BRAND-003** SHALL store: brand voice, tone, colour palette, logo, typography.
- **BRAND-004** SHALL store: approved portfolio items, case studies, testimonial permissions.
- **BRAND-005** SHALL store: target audiences, geography, languages, prohibited claims (enforced as prompt constraints).
- **BRAND-006** SHALL store: default CTAs and primary lead contact routes.
- **BRAND-007** Each field SHALL distinguish "verified by Admin" from "draft." Generation SHALL NOT use unverified fields.

---

## §7. AI Text Studio

**Inputs:** Objective, service (from verified catalogue), audience, language, tone, length, CTA, optional references.

**Outputs:** Caption, headline, CTA, hashtags (≤5), alternative hooks, flagged unverified facts (approval blocked until resolved), provider metadata and cost.

- **TEXT-001** Generation SHALL be grounded in the verified Brand Profile only.
- **TEXT-002** AI SHALL NEVER invent clients, testimonials, awards, pricing, guarantees, or delivery promises.
- **TEXT-003** Missing brand facts SHALL prompt Admin to supply them. Generation SHALL NOT substitute invented facts.
- **TEXT-004** Any edit after approval SHALL create a new ContentVersion and invalidate the ApprovalRecord.
- **TEXT-005** Provider interface SHALL be typed and replaceable. Provider-specific logic SHALL NOT appear in the approval layer.

**Acceptance Criteria — TEXT-001 (Brand Grounding):**
```
GIVEN a Brand Profile with zero verified services
WHEN the Admin requests a service-promotion post
THEN the system SHALL display "No verified services available"
AND SHALL NOT generate content
AND SHALL prompt the Admin to add a verified service first
```

---

## §8. AI Image Generation

- **IMG-001** Admin SHALL specify: prompt, objective, service, style, dimensions, brand assets, reference material.
- **IMG-002** Facebook dimension presets SHALL be provided (1:1, 4:5, 16:9, 9:16). Cropping warnings SHALL display.
- **IMG-003** Important text in generated images SHALL be rendered as editable overlays.
- **IMG-004** SHALL store per asset: provider, model ID, prompt, timestamp, licensing notes.
- **IMG-005** Binary assets in object storage; metadata in PostgreSQL.
- **IMG-006** Accepted MIME types: image/jpeg, image/png, image/webp. Max upload: 8 MB.
- **IMG-007** Abandoned media (not attached to a ContentVersion after 7 days) SHALL be flagged for cleanup.
- **IMG-008** AI-generated images and video SHALL carry Meta-required AI disclosure labels.
- **IMG-009** Generated content SHALL NOT include personal likenesses, third-party trademarks, or copyrighted material without explicit Admin confirmation.

---

## §9. Multi-Axis Content State Machine

Content items use **three independent state axes** stored in separate database columns. A single-field state enum is prohibited.

### Axis 1 — Content Review
| State | Description |
|---|---|
| DRAFT | Initial creation |
| GENERATING | Async AI production in progress |
| NEEDS_REVIEW | Ready for Admin review |
| APPROVED | Explicitly approved for current ContentVersion |
| REJECTED | Rejected by Admin |

### Axis 2 — Schedule / Job
| State | Description |
|---|---|
| UNSCHEDULED | Not yet queued |
| SCHEDULED | Enqueued in durable scheduler |
| PUBLISHING | In-flight dispatch to Meta API |
| CANCELLED | Cancelled prior to dispatch |
| DEAD_LETTERED | Unrecoverable failure; requires Admin action |

### Axis 3 — Publication Outcome
| State | Description |
|---|---|
| NOT_PUBLISHED | Never dispatched |
| UNCERTAIN | Dispatched; outcome not confirmed |
| PUBLISHED | Confirmed published on Meta |
| FAILED | Confirmed error; reconciliation complete |
| ARCHIVED | Soft-deleted |

### Key Transition Rules
- Any Axis 1 edit on APPROVED → NEEDS_REVIEW + cancel queued Axis 2 job.
- GENERATING crash → NEEDS_REVIEW with error after 5-minute worker heartbeat timeout.
- UNCERTAIN SHALL be resolved by reconciliation query before any retry.
- DEAD_LETTERED requires explicit Admin recovery before re-enqueueing.

**Acceptance Criteria — APR-003:**
```
GIVEN Axis 1 = APPROVED, Axis 2 = SCHEDULED
WHEN the Admin edits the caption
THEN:
  - A new ContentVersion SHALL be created with a new hash
  - Prior ApprovalRecord SHALL be marked INVALIDATED with timestamp
  - Axis 1 SHALL transition to NEEDS_REVIEW
  - The queued job SHALL be cancelled (Axis 2 → CANCELLED)
  - Admin SHALL receive notification: "Your edit invalidated the approval. Please re-review and approve."
```

**Acceptance Criteria — APR-004:**
```
GIVEN a job for a ContentVersion whose ApprovalRecord was invalidated after scheduling
WHEN the worker performs its pre-dispatch check
THEN the worker SHALL NOT dispatch to Meta API
AND SHALL move Axis 2 to DEAD_LETTERED
AND SHALL alert Admin: "Approval was invalidated after scheduling. Action required."
AND SHALL record the event in AuditLog
```

---

## §10. Approval Lifecycle

- **APR-001** Every post SHALL have an immutable ContentVersion with a deterministic hash covering: caption, all media binary hashes, destination Page ID, CTA URL, disclosures, scheduled time. Ads additionally: ad objective, audience, budget, bid strategy.
- **APR-002** An ApprovalRecord SHALL reference one exact ContentVersionId plus: Admin session ID, timestamp, decision (APPROVED/REJECTED), and optional note.
- **APR-006 — Expiry:** ApprovalRecords older than 30 calendar days without dispatch SHALL be marked EXPIRED. Re-confirmation required.
- **APR-007 — AI-Flag Blocking:** Approval SHALL be blocked while any AI-flagged claim is unresolved.
- **APR-008 — URL Re-validation:** CTA URLs SHALL be re-verified as resolvable at dispatch time.
- **APR-009 — Friction UX:** Full preview scroll required; diff from last approved version displayed; "I have reviewed the exact final version" checkbox required; re-authentication required for ad-spend approval.

---

## §11. Facebook Integration and Publishing

- **META-001** Shall use official Meta Graph API and Marketing API only.
- **META-002** OAuth flow: Admin initiates → protected server callback → token exchange → Admin validates Page → system checks health and scopes.
- **META-003** SHALL store: external post IDs, permalinks, timestamps, sanitized API results, token expiry dates.
- **META-004** Scheduler SHALL re-validate approval and token validity at execution (APR-004).
- **META-005 — Uncertain Outcomes:** Timeout SHALL mark Axis 3 as UNCERTAIN. System SHALL attempt Meta reconciliation. SHALL NOT retry until duplicate risk is zero.
- **META-006 — Fallback Mode:** If Meta publishing is unavailable, the system SHALL offer an "Approved Post Package" (caption + final media + metadata) for manual posting.
- **META-007 — Webhooks:** SHALL subscribe to relevant Meta webhooks. SHALL enforce HMAC signature verification and replay protection.
- **META-008 — Metric Registry:** Meta Insights metric names SHALL be stored in a configurable registry. Metric names SHALL NOT be hardcoded.
- **META-009 — Compliance:** SHALL maintain: privacy policy URL, data deletion callback, and token/data-access renewal process per Meta Platform Terms.
- **META-010 — App Review Spike:** Engineering SHALL conduct a Sprint 0 spike to confirm which permissions require App Review vs. Development Mode. Results SHALL be documented.

---

## §12. Scheduling and Reliability

- **SCHED-001** PostgreSQL SHALL be the scheduling source of truth. Redis/BullMQ is the transport queue only.
- **SCHED-002** A sweeper/outbox process SHALL detect SCHEDULED items with no active queue job and re-enqueue them.
- **SCHED-003** All scheduled times SHALL be stored in UTC. UI SHALL display in Admin's local timezone with explicit label.
- **SCHED-004** Jobs SHALL use bounded exponential backoff: baseDelay=30s, maxDelay=30min, factor=2, jitter=true, maximum 5 retries before DEAD_LETTERED.
- **SCHED-005** Permanent errors (invalid permissions, validation failures) SHALL NOT be retried without Admin correction.
- **SCHED-006** Every publish action SHALL carry an idempotency key (contentVersionId:pageId:attemptIndex).
- **SCHED-007** Redis SHALL be configured with AOF persistence and noeviction policy.
- **SCHED-008** SHALL provide: health checks, queue-depth monitoring, structured logs, job latency metrics, stuck-job alerts.

---

## §13. Community and Lead Capture

### Lead CRM (Must Have — MVP)
- **LEAD-001** Leads SHALL be created manually or from authorized inquiry sources.
- **LEAD-002** Lead records SHALL store: contact details (minimum required), stated service interest, status, source attribution, next action, notes, outcome.
- **LEAD-003** Source attribution SHALL only be set when a reliable identifier exists. Manual entries default to Unknown Source.
- **LEAD-004** System SHALL send follow-up reminders for leads with no activity after a configurable period.
- **LEAD-005** CSV export SHALL be available with data minimization.
- **LEAD-006** Lead personal data SHALL NOT be sent to AI providers without pseudonymization and documented approval.
- **LEAD-007** A retention policy SHALL define when lead records are anonymized or deleted (documented pre-Phase 3).
- **LEAD-008** Each lead SHALL store lawful basis for holding personal data and deletion status.

### Community Inbox (Phase 4 — Should Have)
- Page comments and messages retrieved only where Meta permissions allow.
- AI MAY draft reply suggestions; no reply SHALL be sent without Admin review.

---

## §14. Paid Advertising and Budget Governance (Phase 5)

- **ADS-001** Staged: (1) read-only insights; (2) drafts and previews; (3) active mutations after full verification.
- **ADS-002** Creative approval SHALL be separate from and completed before ad-spend authorization.
- **ADS-003** Campaign launch SHALL require separate, explicit financial confirmation. Both approved creative version and approved spend configuration SHALL be recorded.
- **ADS-004** Material changes (budget, audience, bid, schedule) SHALL each require explicit re-confirmation.
- **ADS-005** SHALL display: currency, budget type, duration, and estimated spend before any confirmation.
- **ADS-006** Metrics SHALL come from real API data only. Cost per lead calculated only when spend and attribution are both reliable.

---

## §15. Analytics and Attribution

- **ANA-001** Organic metrics (reach, impressions, reactions, comments, shares, video views) SHALL come from Meta Insights API.
- **ANA-002** Each metric display SHALL include: metric definition, reporting window, collection timestamp, data freshness.
- **ANA-003** Lead funnel SHALL track: inquiries, qualified leads, proposals, won/lost, median follow-up time, source.
- **ANA-004** Conversion rates SHALL display denominators and date ranges.
- **ANA-005** Attribution SHALL distinguish: Direct, Assisted, and Unknown Source.
- **ANA-006** Recommendations SHALL cite observed data, explain evidence, and SHALL NEVER override human approval.

---

## §16. Architecture and Integrations

**Pattern:** Modular monolith + separate background worker. Microservices deferred until justified.

### Stack

| Component | Technology | ADR |
|---|---|---|
| Frontend + Server | Next.js App Router, TypeScript, Tailwind CSS | ADR-001, 002 |
| Database | PostgreSQL + Prisma ORM | ADR-003 |
| Queue | Redis + BullMQ (AOF, noeviction) | ADR-004 |
| Media rendering | FFmpeg + S3-compatible object storage | ADR-005 |
| AI adapters | Replaceable typed provider interface | — |
| Social | Meta Graph API + Marketing API | — |

### Modules
Authentication · Brand Profile · AI Content Studio · Media Library · Approval Service · Scheduler · Meta Connector · Community Inbox · Lead CRM · Ads · Analytics · Notifications · Audit · Operations

### AI Provider Interface Contract
Every adapter SHALL expose:
- Input: structured generation request (objective, constraints, brand context).
- Output: content, provider name, model ID, token counts, latency, estimated cost.
- Errors: normalized type (rate limit, content policy, timeout, provider error).
- Cost: per-generation record in UsageLedger.

---

## §17. Data Model and Integrity

### Core Entities

**Existing (PRD v1.0):**
Admin, ConnectedPage, BrandProfile, ServiceOffering, PortfolioItem, ContentItem, ContentVersion, MediaAsset, ApprovalRecord, ScheduledPost, PublishingAttempt, BackgroundJob, Campaign, AdAccount, AdCampaign, Lead, LeadActivity, MetricSnapshot, ProviderConfiguration, AuditLog

**Added by review:**
Session (with MFA device record), WebhookEvent (signature, replay protection, processing status), Comment, Conversation, TrackedLink (UTM parameters), GenerationRun, UsageLedger (per-generation cost), Template, PromptTemplate, Notification, Setting, LeadConsent (lawful basis, deletion status)

### Integrity Rules
- **DATA-001** ContentVersion hash SHALL be computed from a defined, documented canonical field set.
- **DATA-002** ApprovalRecord SHALL reference ContentVersionId with a foreign key constraint.
- **DATA-003** Version creation and approval invalidation SHALL execute in a single database transaction.
- **DATA-004** ScheduledPost SHALL have a unique constraint preventing duplicate active jobs per contentVersionId + connectedPageId.
- **DATA-005** Monetary amounts SHALL be stored as exact decimal or integer minor units with an explicit currency code.
- **DATA-006** AuditLog SHALL be append-only, enforced at the PostgreSQL role level (no UPDATE or DELETE grants for the application role).
- **DATA-007** A retention policy SHALL define maximum age for: media assets, audit logs, metric snapshots, and generation run records.
- **DATA-008** Encryption keys SHALL be stored separately from the database with a documented rotation procedure.
- **DATA-009** Media assets SHALL record derivation lineage and content hash.

---

## §18. Security, Privacy, and Compliance

- **SEC-001** TLS enforced for all production traffic.
- **SEC-002** Secure HTTP-only session cookies and CSRF protection.
- **SEC-003** All inputs validated server-side. Output encoding applied before rendering.
- **SEC-004** Uploads: MIME type verified against content (not extension), EXIF stripped, malware scanned.
- **SEC-005** SSRF protection: ingested URLs validated against an explicit scheme/domain allow-list.
- **SEC-006** Rate limits on: login, generation, uploads, and expensive background tasks.
- **SEC-007** API keys and tokens SHALL NEVER appear in logs, LLM context, error messages, or telemetry.
- **SEC-008** Least-privilege Meta API scopes. Unused scopes revoked.
- **SEC-009** Dependency scanning and patching in CI pipeline.
- **SEC-010 — Mandatory MFA:** MFA SHALL be mandatory (not optional).
- **SEC-011 — Break-Glass:** Lockout recovery procedure SHALL be documented.
- **SEC-012 — Audit Tamper Evidence:** AuditLog protected at DB role level (no UPDATE/DELETE for application role).
- **SEC-013 — AI Prompt Security:** Prompts and retrieved content treated as untrusted. Generated instructions SHALL NOT trigger publishing directly.
- **SEC-014 — PII Minimization:** Lead personal data SHALL NOT be sent to AI providers without pseudonymization and documented approval.
- **SEC-015 — Legal:** Ethiopian data-protection obligations SHALL be confirmed before personal data collection begins.

**Incident readiness procedures SHALL exist for:** revoking Meta access, rotating secrets, disabling publishing, pausing queued jobs, restoring backups, and investigating audit events.

---

## §19. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Scheduling precision | ±5 min of scheduled time; Admin alerted within 10 min of miss |
| NFR-002 | Unapproved/stale version publishes | Zero (release gate criterion) |
| NFR-003 | AI text generation latency | ≤ 15 s p95 |
| NFR-004 | Image generation latency | ≤ 60 s p95 |
| NFR-005 | Template video render (60-second output) | ≤ 5 minutes |
| NFR-006 | Monthly AI spend cap | Configurable; default $0 until Admin sets budget |
| NFR-007 | Maximum image upload size | 8 MB |
| NFR-008 | Maximum video file size | 1 GB |
| NFR-009 | Maximum video duration | 60 minutes (Facebook platform limit) |
| NFR-010 | Availability | 99.5% (excluding planned maintenance) |
| NFR-011 | RPO | 24 hours |
| NFR-012 | RTO | 4 hours |
| NFR-013 | Backup frequency | Daily automated; restore tested monthly |
| NFR-014 | Chunked uploads | Required for files > 10 MB (resumable) |

---

## §20. UX, Accessibility, and Design Direction

- **UX-001** Professional SaaS aesthetic: navy (#0B132B), white, violet (#6C5CE7), cyan (#00CECB) accents. Realistic content previews. Useful empty and error states.
- **UX-002** Navigation items for Ads, Video Studio, and Inbox SHALL be feature-flagged and hidden until those phases are complete.
- **UX-003** Responsive, keyboard-navigable, visible focus indicators, accessible labels throughout.
- **UX-004** WCAG 2.1 AA contrast. Status indicators SHALL NOT rely solely on colour.
- **UX-005** Confirmations required for: destructive actions, scheduling, approvals, financial actions.
- **UX-006** Unsaved-change warnings and clear job progress indicators.
- **UX-007 — Approval Friction:** Full preview scroll required before Approve becomes active. Diff from prior approved version displayed. "I have reviewed the exact final version" checkbox required.

---

## §21. Testing and Release Gate

### Test Categories
- Unit: approval invariants, state transition rules, content hash computation.
- Integration: approval + scheduling + dispatch transactions, queue deduplication.
- Contract: AI provider adapter interfaces, Meta API response handling.
- End-to-end: generate → edit → approve → schedule → dispatch → confirm published.
- Security: authorization bypass, token exposure, upload risks, rate limits.
- Failure: expired tokens, timeouts, UNCERTAIN outcomes, duplicate jobs, worker crashes, dead-lettered recovery.

### Release Gate (Production-Ready Criteria)
A release is NOT production-ready until ALL of the following are certified:
1. Stale or unapproved ContentVersions cannot be dispatched (automated test, zero failures).
2. UNCERTAIN outcomes are never blindly retried (test simulates timeout, verifies reconciliation path).
3. Ordinary queue failures are recoverable without data loss.
4. All Must Have items have passing acceptance criteria tests.
5. Backup and restore tested end-to-end in staging.
6. AuditLog tamper-evidence controls verified at the database role level.

---

## §22. Deployment and Environments

| Environment | Purpose | Notes |
|---|---|---|
| Local development | Feature development | Test credentials, stub AI providers, local DB/Redis |
| Staging | Integration and release testing | Test Meta credentials, authorized staging Page |
| Production | Live operation | HTTPS, managed secrets, persistent storage, backups, monitoring |

> A separate worker process and FFmpeg rendering rule out pure serverless hosting. OD-006 MUST be resolved before Phase 1 infrastructure setup.

---

## §23. Implementation Phases and Milestones

| Phase | Scope | Key Deliverables |
|---|---|---|
| Phase 1: Foundation | Auth, Brand Profile, Core Schema | Next.js + Tailwind setup, Prisma schema v1, mandatory MFA, brand profile manager, audit log, base dashboard |
| Phase 2: Content Studio & Approval | Text/image gen, media library, approval engine | Typed AI provider adapters, media library, immutable versioning, multi-axis state machine, approval friction UX |
| Phase 3: Meta Publishing & Scheduling | Meta OAuth, BullMQ queue, scheduler | Meta connector, durable scheduler, PostgreSQL outbox sweeper, UNCERTAIN/reconciliation handling, basic analytics |
| Phase 4: Leads CRM & Video | Lead pipeline, template video, inbox | Lead CRM, FFmpeg template engine, community inbox (feature-flagged) |
| Phase 5: Paid Ads & Attribution | Ad account integration, advanced analytics | Read-only ad insights, staged mutations, UTM tracking, evidence-based recommendations |

---

## §24. Open Decisions Log (RAID)

| ID | Decision Required | Owner | Target | Status |
|---|---|---|---|---|
| OD-001 | Exact services and service catalogue | Kewakibt | Pre-Phase 1 | Open |
| OD-002 | Facebook Page ID and controlling Meta account | Kewakibt | Pre-Phase 1 | Open |
| OD-003 | Primary lead contact route (DM/WhatsApp/form/email) | Kewakibt | Pre-Phase 1 | Open |
| OD-004 | Language scope: Amharic and/or Afaan Oromo in Phase 1? | Kewakibt | Pre-Phase 1 | Open |
| OD-005 | Monthly AI generation budget | Kewakibt | Pre-Phase 1 | Open |
| OD-006 | Hosting environment: managed cloud, VPS, or local hardware | Kewakibt + Engineering | Pre-Phase 1 | Open |
| OD-007 | Meta App Review scope — Sprint 0 spike | Engineering | Sprint 0 | Open |
| OD-008 | Own scheduler vs Meta native scheduling | Engineering | Pre-Phase 3 | Open |
| OD-009 | Baseline metric collection period | Kewakibt | Pre-Phase 5 | Open |
| OD-010 | ADR-001–ADR-005 rationale documentation | Engineering | Phase 1 | Open |
| OD-011 | If OD-004 = Yes: Ge'ez font rendering, mixed-language captions, AI model validation by native reviewer | Engineering + Kewakibt | Pre-Phase 2 | Open |

---

> **Final Principle:** KewaFlow is a controlled marketing and lead-management system, not an autonomous agent. AI prepares work; the Admin decides what the company says publicly and when money is spent.
