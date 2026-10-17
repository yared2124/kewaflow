/**
 * Multi-Axis State Machine (AGENTS.md Section 3 & APR-003)
 * Enforces the independent 3-axis transitions and invariant resets.
 */

export type ContentReviewState =
  | "DRAFT"
  | "GENERATING"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type JobState =
  | "UNSCHEDULED"
  | "SCHEDULED"
  | "PUBLISHING"
  | "CANCELLED"
  | "DEAD_LETTERED";

export type PublicationOutcome =
  | "NOT_PUBLISHED"
  | "UNCERTAIN"
  | "PUBLISHED"
  | "FAILED"
  | "ARCHIVED";

export interface ItemStateSnapshot {
  reviewState: ContentReviewState;
  jobState: JobState;
  publicationOutcome: PublicationOutcome;
}

/**
 * APR-003: Any modification to a publish-relevant field SHALL immediately:
 * (a) create a new ContentVersion with a new hash
 * (b) mark the prior ApprovalRecord INVALIDATED
 * (c) transition the review axis back to NEEDS_REVIEW
 * (d) cancel any queued job referencing the prior version
 */
export function onContentModified(current: ItemStateSnapshot): ItemStateSnapshot {
  return {
    ...current,
    reviewState: "NEEDS_REVIEW",
    // If the job was scheduled or publishing, cancel it immediately
    jobState: current.jobState === "SCHEDULED" ? "CANCELLED" : current.jobState,
  };
}

/**
 * Validates whether an item can be queued or scheduled for publication.
 * Requires:
 * - reviewState === "APPROVED"
 * - jobState === "UNSCHEDULED" or "CANCELLED"
 * - publicationOutcome === "NOT_PUBLISHED" or "FAILED"
 */
export function canSchedule(state: ItemStateSnapshot): {
  allowed: boolean;
  reason?: string;
} {
  if (state.reviewState !== "APPROVED") {
    return {
      allowed: false,
      reason: "Item must be APPROVED before it can be scheduled (APR-001/002).",
    };
  }
  if (state.jobState === "PUBLISHING") {
    return {
      allowed: false,
      reason: "Item is already actively publishing.",
    };
  }
  if (state.publicationOutcome === "PUBLISHED") {
    return {
      allowed: false,
      reason: "Item has already been successfully published.",
    };
  }
  return { allowed: true };
}

/**
 * Handles publishing failure transition.
 * Sets jobState to DEAD_LETTERED and outcome to FAILED or UNCERTAIN.
 */
export function onPublishFailed(
  current: ItemStateSnapshot,
  isAmbiguousResponse: boolean
): ItemStateSnapshot {
  return {
    ...current,
    jobState: "DEAD_LETTERED",
    // SEC-004: Uncertain API publish responses SHALL be flagged UNCERTAIN and reconciled before any retry.
    publicationOutcome: isAmbiguousResponse ? "UNCERTAIN" : "FAILED",
  };
}
