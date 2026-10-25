/**
 * Type contracts for Publishing Jobs and Pre-Dispatch Revalidation
 * Invariants: APR-001, APR-002, APR-004, APR-006, APR-008, SEC-004
 */

export interface PublishingJobData {
  contentItemId: string;
  contentVersionId: string;
  destinationPageId: string;
  idempotencyKey: string;
  attemptIndex: number;
}

export type RevalidationErrorCode =
  | "NO_ITEM"
  | "NO_APPROVAL"
  | "VERSION_MISMATCH"
  | "APPROVAL_NOT_ACTIVE"
  | "APPROVAL_EXPIRED"
  | "UNRESOLVABLE_URL"
  | "PAGE_INVALID"
  | "FLAGGED_FACTS_UNRESOLVED";

export interface RevalidationResult {
  valid: boolean;
  errorCode?: RevalidationErrorCode;
  reason?: string;
  item?: any;
  version?: any;
  approval?: any;
}

export interface PublishDispatchResult {
  success: boolean;
  platformPostId?: string;
  response?: any;
  isAmbiguous?: boolean;
  error?: string;
}
