import * as Sentry from "@sentry/react-native";

/**
 * Tag subsequent Sentry events (including Session Replays) with the
 * authenticated user's stable id. No PII beyond the id is forwarded.
 */
export function identifySentryUser(id: string): void {
  Sentry.setUser({ id });
}

/**
 * Clear the Sentry user context. Called on sign-out so subsequent
 * anonymous events aren't mis-attributed to the previous user.
 */
export function resetSentryUser(): void {
  Sentry.setUser(null);
}
