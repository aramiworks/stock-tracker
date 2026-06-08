import { useEffect } from "react";

/**
 * In-app restock event channel.
 *
 * A tiny pub/sub seam that decouples the *source* of a restock signal from the
 * screens that need to refresh. Today the only publisher is the push
 * notification handler (a foreground restock push fires {@link emitRestock});
 * the deferred GraphQL subscription (see INF-1615 plan) will publish into the
 * exact same channel without touching any consumer.
 *
 * Mirrors `use-refetch-on-focus.ts`: a hook a container's lifecycle subscribes
 * its Apollo `refetch` to.
 */
type RestockListener = () => void;

const listeners = new Set<RestockListener>();

/** Publish a restock signal to every subscribed screen. */
export function emitRestock(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Subscribe `refetch` to restock signals for the lifetime of the component.
 * Re-subscribes if the `refetch` identity changes.
 */
export function useRefetchOnRestock(refetch: () => void): void {
  useEffect(() => {
    listeners.add(refetch);
    return () => {
      listeners.delete(refetch);
    };
  }, [refetch]);
}
