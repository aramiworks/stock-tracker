import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Analytics consent gate (GDPR). Mixpanel events are dropped until consent is
 * explicitly granted.
 *
 * For now, consent is granted automatically on first successful sign-in
 * (see auth lifecycles). Before EU production launch, replace this with a
 * proper consent-collection UI on the sign-in screen.
 */

const CONSENT_KEY = "analytics:consent";
const CONSENT_GRANTED = "granted";
const CONSENT_DENIED = "denied";

let cachedConsent: boolean | null = null;

export async function hasAnalyticsConsent(): Promise<boolean> {
  if (cachedConsent !== null) return cachedConsent;
  try {
    const value = await AsyncStorage.getItem(CONSENT_KEY);
    cachedConsent = value === CONSENT_GRANTED;
    return cachedConsent;
  } catch {
    return false;
  }
}

export async function grantAnalyticsConsent(): Promise<void> {
  cachedConsent = true;
  try {
    await AsyncStorage.setItem(CONSENT_KEY, CONSENT_GRANTED);
  } catch {
    // best-effort; cache holds for this session
  }
}

export async function denyAnalyticsConsent(): Promise<void> {
  cachedConsent = false;
  try {
    await AsyncStorage.setItem(CONSENT_KEY, CONSENT_DENIED);
  } catch {
    // best-effort; cache holds for this session
  }
}
