import { renderHook } from "@testing-library/react-native";
import { useRelativeTimeFormatter } from "./use-relative-time";

describe("useRelativeTimeFormatter", () => {
  const NOW = new Date("2026-05-13T12:00:00.000Z");

  const format = (input: Date | string | null | undefined) => {
    const { result } = renderHook(() => useRelativeTimeFormatter());
    return result.current(input, NOW);
  };

  it("returns unknown for null", () => {
    expect(format(null)).toBe("relativeTime.unknown");
  });

  it("returns unknown for undefined", () => {
    expect(format(undefined)).toBe("relativeTime.unknown");
  });

  it("returns justNow for diffs < 1 minute", () => {
    expect(format(new Date(NOW.getTime() - 30 * 1000))).toBe(
      "relativeTime.justNow",
    );
  });

  it("returns minutesAgo for diffs < 1 hour", () => {
    expect(format(new Date(NOW.getTime() - 35 * 60 * 1000))).toBe(
      "relativeTime.minutesAgo",
    );
  });

  it("returns hoursAgo for diffs < 1 day", () => {
    expect(format(new Date(NOW.getTime() - 5 * 60 * 60 * 1000))).toBe(
      "relativeTime.hoursAgo",
    );
  });

  it("returns daysAgo for diffs < 1 week", () => {
    expect(format(new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000))).toBe(
      "relativeTime.daysAgo",
    );
  });

  it("returns weeksAgo for diffs < 1 month", () => {
    expect(format(new Date(NOW.getTime() - 2 * 7 * 24 * 60 * 60 * 1000))).toBe(
      "relativeTime.weeksAgo",
    );
  });

  it("returns monthsAgo for diffs >= 1 month", () => {
    expect(format(new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000))).toBe(
      "relativeTime.monthsAgo",
    );
  });

  it("accepts ISO string input", () => {
    const iso = new Date(NOW.getTime() - 35 * 60 * 1000).toISOString();
    expect(format(iso)).toBe("relativeTime.minutesAgo");
  });

  it("clamps future timestamps to justNow (diff floored at 0)", () => {
    expect(format(new Date(NOW.getTime() + 60 * 1000))).toBe(
      "relativeTime.justNow",
    );
  });

  it("defaults `now` to the current date when omitted", () => {
    const { result } = renderHook(() => useRelativeTimeFormatter());
    // Just hitting the default-argument branch — value is locale-stub so any
    // bucket is fine; we just need the call to resolve without throwing.
    expect(typeof result.current(new Date())).toBe("string");
  });
});
