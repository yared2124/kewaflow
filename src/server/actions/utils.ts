import { revalidatePath } from "next/cache";

/**
 * Safely invokes Next.js revalidatePath when running inside a Next.js server request context.
 * Silently catches the invariant error when executed in standalone CLI, tests, or background workers.
 */
export function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Expected when running in standalone unit/integration test runner outside Next.js request scope
  }
}
