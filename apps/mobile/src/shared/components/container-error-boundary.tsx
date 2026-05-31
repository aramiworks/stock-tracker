import * as Sentry from "@sentry/react-native";
import type { ReactElement, ReactNode } from "react";

interface ContainerErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: { retry: () => void }) => ReactElement;
}

/**
 * Per-Container error boundary that reports render errors to Sentry and shows
 * a Container-scoped fallback. EFCV tags (`experience` / `flow` / `container`)
 * attach automatically via the `beforeSend` hook in `lib/sentry/sentry.ts`,
 * so no per-call-site configuration is required.
 *
 * `fallback({ retry })` matches the API the codebase already uses.
 */
export function ContainerErrorBoundary({
  children,
  fallback,
}: ContainerErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => fallback({ retry: resetError })}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
