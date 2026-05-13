import { useTranslation } from "react-i18next";
import { useCallback } from "react";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

/**
 * Returns a formatter that maps a Date|string|null to a human-readable
 * "moments-ago" label using the locale-specific `common.relativeTime.*` keys.
 *
 * Buckets (matches the design hand-off for watchlist detail history rows):
 *   < 1 min   → relativeTime.justNow
 *   < 1 hour  → relativeTime.minutesAgo  (count = floor(minutes))
 *   < 1 day   → relativeTime.hoursAgo    (count = floor(hours))
 *   < 1 week  → relativeTime.daysAgo
 *   < 1 month → relativeTime.weeksAgo
 *   else      → relativeTime.monthsAgo
 *
 * `null` / invalid → `relativeTime.unknown` ("—" in ko, em-dash in en).
 */
export function useRelativeTimeFormatter() {
  const { t } = useTranslation("common");

  return useCallback(
    (input: Date | string | null | undefined, now: Date = new Date()) => {
      if (!input) return t("relativeTime.unknown");
      const then = typeof input === "string" ? new Date(input) : input;
      /* istanbul ignore next -- defensive against malformed timestamps */
      if (Number.isNaN(then.getTime())) return t("relativeTime.unknown");

      const diff = Math.max(0, now.getTime() - then.getTime());

      if (diff < MINUTE) return t("relativeTime.justNow");
      if (diff < HOUR) {
        return t("relativeTime.minutesAgo", {
          count: Math.floor(diff / MINUTE),
        });
      }
      if (diff < DAY) {
        return t("relativeTime.hoursAgo", { count: Math.floor(diff / HOUR) });
      }
      if (diff < WEEK) {
        return t("relativeTime.daysAgo", { count: Math.floor(diff / DAY) });
      }
      if (diff < MONTH) {
        return t("relativeTime.weeksAgo", { count: Math.floor(diff / WEEK) });
      }
      return t("relativeTime.monthsAgo", { count: Math.floor(diff / MONTH) });
    },
    [t],
  );
}
