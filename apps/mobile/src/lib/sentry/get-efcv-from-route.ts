/**
 * Maps Expo Router segments to EFCV (Experience / Flow / Container) tags.
 *
 * Expo Router segments look like ["(app)", "dashboard", "home"]:
 *   - First segment is the route group "(app)" or "(auth)" — maps to experience
 *   - Second segment is the flow (e.g. "dashboard", "signIn")
 *   - Third segment is the container (e.g. "home", "gmailOauth")
 */

const GROUP_TO_EXPERIENCE: Record<string, string> = {
  "(app)": "tracker",
  "(auth)": "auth",
};

export type EfcvTags = {
  experience?: string;
  flow?: string;
  container?: string;
};

export function getEfcvFromSegments(segments: readonly string[]): EfcvTags {
  const [group, flow, container] = segments;
  return {
    experience: group ? GROUP_TO_EXPERIENCE[group] : undefined,
    flow,
    container,
  };
}
