# KEWAFLOW — System Context & Operational Rules
> Version 1.1 | Updated 14 October 2026 | Incorporates PRD v1.0 professional review findings.

---

## 1. Project Overview & Core Philosophy
**KewaFlow** is an approval-first AI marketing and client-acquisition platform built for **Kewakibt Software Solutions**.

> **Cardinal Rule**:
> **"AI generates. The Admin approves. KewaFlow publishes. Results guide growth."**
>
> AI assists with ideation, drafting, and asset generation. The Admin is exclusively accountable for every public communication and every dollar spent. **Zero autonomous publishing or spending.**

---

## 2. Immutable Invariants & Business Logic

### A. Approval Integrity (APR)
1. **APR-001** Every post/creative SHALL have an immutable `ContentVersion` identified by a deterministic version hash. The hash input MUST include: caption text, all media binary hashes, destination Page ID, CTA URL, any disclosures, and scheduled time. For ads, the ad configuration is also included.
2. **APR-002** An `ApprovalRecord` SHALL bind one exact `ContentVersion` to the authenticated Admin with a timestamp and the Admin's session ID.
3. **APR-003** Any modification to a publish-relevant field (caption, media, destination Page, CTA URL, disclosures, scheduled time; ads additionally: objective, audience, budget, bid) SHALL immediately: (a) create a new `ContentVersion` with a new hash; (b) mark the prior `ApprovalRecord` INVALIDATED with timestamp; (c) transition the content review axis back to `NEEDS_REVIEW`; (d) cancel any queued job referencing the prior version.
4. **APR-004 — Publish-Time Re-validation**: The background job SHALL re-validate immediately before dispatching to Meta API that: (a) the `ApprovalRecord` references the exact `ContentVersionId` in the job payload; (b) the `ApprovalRecord` status is `ACTIVE`; (c) the approval has not expired (APR-006); (d) the destination Page token is valid. If any check fails, the job SHALL move to `DEAD_LETTERED` and alert the Admin. It SHALL NOT retry without Admin action.
5. **APR-005** Opening a draft or viewing a preview SHALL NOT change any approval state. These actions are not approval.
6. **APR-006 — Approval Expiry**: An `ApprovalRecord` that has not been dispatched within **30 calendar days** of approval timestamp SHALL be automatically marked `EXPIRED`. The content item SHALL require re-confirmation before it can be scheduled or dispatched.
7. **APR-007 — Blocking AI-Flagged Facts**: If AI generation produces items flagged as "facts requiring verification," the Approve action SHALL be blocked until each flagged item is either resolved with Admin-supplied evidence or explicitly acknowledged as unverifiable (item must then be removed or reworded). Acknowledgements SHALL be logged in the `AuditLog`.
8. **APR-008 — URL Re-validation at Dispatch**: Any approved CTA URL or linked content SHALL be re-verified as resolvable at dispatch time. Unresolvable URLs SHALL block dispatch and alert the Admin.
9. **APR-009 — Approval Friction UX**: The Admin MUST scroll through the complete rendered preview before the Approve button becomes interactive. The preview SHALL show a diff from the previously approved version. A checkbox labelled "I have reviewed the exact final version" SHALL be required. Re-authentication SHALL be required for ad-spend confirmation.

### B. Anti-Hallucination & Brand Grounding (BRD)
1. **BRD-001** AI generation SHALL be grounded exclusively in the verified Brand Profile and service catalogue.
2. **BRD-002** AI SHALL NEVER invent clients, testimonials, awards, pricing, guarantees, certifications, credentials, or delivery promises.
3. **BRD-003** If brand facts are missing, the system SHALL prompt the Admin to specify or verify them. Generation SHALL NOT proceed with invented facts.
4. **BRD-004** Generated images and video SHALL carry a platform-required AI disclosure label per current Meta labeling rules.
5. **BRD-005** Generated content SHALL NOT include personal likenesses, third-party trademarks, or copyrighted material without explicit Admin confirmation of rights.

### C. Attribution & CRM Integrity (CRM)
1. **CRM-001** Likes, impressions, and reach SHALL NEVER be labeled as leads anywhere in the UI or exports.
2. **CRM-002** Lead pipeline stages: `INQUIRY` → `QUALIFIED` → `PROPOSAL` → `WON` / `LOST`. No other stages exist without an explicit schema migration and a documented decision.
3. **CRM-003** Attribution SHALL distinguish: **Direct Attribution** (confirmed via tagged link or form), **Assisted Attribution** (same-session or campaign association), and **Unknown Source** (default for untracked entries).
4. **CRM-004** Ad spend SHALL require a separate, explicit financial confirmation distinct from creative approval. Both the approved creative version and the approved spend configuration SHALL be recorded before launch.
5. **CRM-005 — Lead PII and AI Providers**: Personal data from lead records SHALL NOT be sent to third-party AI providers without explicit data-minimization and a documented provider-approval decision. Where required, data MUST be pseudonymized before transmission.

---

## 3. Multi-Axis State Machine

Content items use **three independent state axes**. Storing all states in a single field is prohibited.

### Axis 1 — Content Review State
| State | Description |
|---|---|
| `DRAFT` | Initial creation / prompt setup |
| `GENERATING` | Async AI asset production in progress |
| `NEEDS_REVIEW` | Generated assets ready for Admin review |
| `APPROVED` | Explicitly approved for the current `ContentVersion` |
| `REJECTED` | Rejected by Admin during review |

### Axis 2 — Schedule / Job State
| State | Description |
|---|---|
| `UNSCHEDULED` | Not yet queued |
| `SCHEDULED` | Enqueued in durable scheduler |
| `PUBLISHING` | In-flight dispatch to Meta API |
| `CANCELLED` | Cancelled prior to dispatch |
| `DEAD_LETTERED` | Repeated or unrecoverable failure; requires Admin action |

### Axis 3 — Publication Outcome
| State | Description |
|---|---|
| `NOT_PUBLISHED` | Never dispatched |
| `UNCERTAIN` | Dispatched; outcome not confirmed (timeout / ambiguous API response) |
| `PUBLISHED` | Successfully confirmed published on Meta |
| `FAILED` | Confirmed dispatch error; reconciliation complete |
| `ARCHIVED` | Soft-deleted; no longer active |

### Key Transition Rules
- Any Axis 1 edit on `APPROVED` → resets to `NEEDS_REVIEW`, cancels Axis 2 job.
- `GENERATING` crash → transitions to `NEEDS_REVIEW` with error after worker heartbeat timeout (5 min).
- `UNCERTAIN` SHALL be resolved by reconciliation query to Meta API before any retry.
- `DEAD_LETTERED` requires explicit Admin recovery action before re-enqueueing.

---

## 4. Architecture & Tech Stack (ADRs pending)

- **Framework**: Next.js App Router (TypeScript) — *ADR-001*
- **Styling**: Tailwind CSS (Navy `#0B132B`, slate/white, violet `#6C5CE7`, cyan `#00CECB`) — *ADR-002*
- **Database & ORM**: PostgreSQL with Prisma ORM — *ADR-003*
- **Scheduling Source of Truth**: **PostgreSQL** (NOT Redis). A sweeper/outbox process SHALL re-enqueue any `SCHEDULED` jobs absent from the queue after a heartbeat interval. Redis is a queue transport only.
- **Queue / Background Workers**: Redis + BullMQ with AOF persistence and `noeviction` policy — *ADR-004*
- **Media Engine**: FFmpeg + S3-compatible Object Storage. Ge'ez-script font support required if Amharic/Afaan Oromo is confirmed (OD-004) — *ADR-005*
- **AI Integrations**: Replaceable provider adapters with a typed contract (`src/providers/types.ts`), usage ledger, and hard monthly spend caps.
- **Social Integrations**: Official Meta Graph API & Marketing API. A metric registry abstraction SHALL be used; Insights metric names SHALL NOT be hardcoded.
- **Idempotency**: Every publish action SHALL carry a unique idempotency key (`contentVersionId:pageId:attemptIndex`) stored on `PublishingAttempt`.

---

## 5. Non-Functional Requirements (NFR)

| ID | Requirement | Target |
|---|---|---|
| NFR-001 | Scheduled posts published within scheduled time | ±5 min; or Admin alert within 10 min |
| NFR-002 | Unapproved or stale version publishes | Zero (release gate criterion) |
| NFR-003 | AI text generation latency | ≤ 15 s p95 |
| NFR-004 | Image generation latency | ≤ 60 s p95 |
| NFR-005 | Template video render time (60-second video) | ≤ 5 minutes |
| NFR-006 | Monthly AI provider spend cap | Configurable; default $0 until Admin sets a budget |
| NFR-007 | Maximum image upload size | 8 MB |
| NFR-008 | Maximum video file size | 1 GB |
| NFR-009 | Maximum video duration | 60 minutes (Facebook limit) |
| NFR-010 | Availability target | 99.5% (excluding planned maintenance) |
| NFR-011 | RPO (data loss tolerance) | 24 hours |
| NFR-012 | RTO (recovery time objective) | 4 hours |
| NFR-013 | Stale approval publishes | Zero (certified per release gate) |

---

## 6. Security & Operational Rules

- **SEC-001** Session validation on every protected route and server action.
- **SEC-002** Hiding UI elements is NEVER a security boundary.
- **SEC-003** Meta tokens and API credentials SHALL be stored encrypted at rest with a documented key management approach (KMS or equivalent). Keys SHALL be stored separately from the database with a documented rotation procedure.
- **SEC-004** Uncertain API publish responses SHALL be flagged `UNCERTAIN` and reconciled before any retry. Blind retries are prohibited.
- **SEC-005 — Mandatory MFA**: MFA SHALL be mandatory for the Admin account. Re-authentication SHALL be required for: Meta connection changes, any ad spend action, and Admin account modifications.
- **SEC-006 — Break-Glass Recovery**: A documented break-glass procedure SHALL exist for Admin account lockout, including identity verification steps and a full audit trail.
- **SEC-007 — Audit Log Tamper Evidence**: `AuditLog` SHALL be protected at the database level (no `UPDATE` or `DELETE` grants for the application role). Append-only enforcement SHALL NOT rely on application convention alone.
- **SEC-008 — SSRF and Upload Risks**: Ingested URLs SHALL be validated against an allow-list. Uploaded files SHALL have EXIF/metadata stripped, MIME type verified against content (not extension), and scanned for malicious content.
- **SEC-009 — Public Endpoints**: Webhook endpoints SHALL enforce HMAC signature verification, replay protection (timestamp + nonce), and rate limiting.
- **SEC-010** API keys, tokens, and AI provider credentials SHALL NEVER appear in logs, error messages, LLM context, or telemetry.
- **SEC-011** Ethiopian data-protection obligations SHALL be confirmed (alongside Meta Platform Terms) before any personal data collection begins.

---

## 7. Open Decisions Log (RAID)

| ID | Decision | Owner | Target | Status |
|---|---|---|---|---|
| OD-001 | Exact services offered by Kewakibt | Kewakibt | Pre-Phase 1 | ❌ Open |
| OD-002 | Facebook Page ID and authorizing Meta account | Kewakibt | Pre-Phase 1 | ❌ Open |
| OD-003 | Primary lead CTA (DM / WhatsApp / form / email) | Kewakibt | Pre-Phase 1 | ❌ Open |
| OD-004 | Language: Amharic and/or Afaan Oromo in Phase 1? | Kewakibt | Pre-Phase 1 | ❌ Open |
| OD-005 | Monthly AI generation budget | Kewakibt | Pre-Phase 1 | ❌ Open |
| OD-006 | Hosting environment (cloud / VPS / local hardware) | Kewakibt | Pre-Phase 1 | ❌ Open |
| OD-007 | Meta App Review scope (validate Dev Mode for own-Page publishing via spike) | Engineering | Sprint 0 | ❌ Open |
| OD-008 | Own scheduler vs Meta native scheduling (trade-off: approval check at dispatch vs resilience) | Engineering | Pre-Phase 3 | ❌ Open |
| OD-009 | Baseline metric collection period before Phase 5 analytics are meaningful | Kewakibt | Pre-Phase 5 | ❌ Open |
| OD-010 | ADR-001–ADR-005 rationale documentation | Engineering | Phase 1 | ❌ Open |
