// Mock for react-i18next in Storybook.
//
// Storybook has no i18n provider, so the real `useTranslation` would return a
// not-ready `t` that echoes the raw key (e.g. "account.home.accountInfoCard.
// emailLabel"). Instead, we resolve keys against the real `ko` translation JSON
// — the same source of truth the app uses — so stories render the actual Korean
// copy. This keeps Storybook copy in lockstep with production without a live
// i18next instance.
import koCommon from "../../../mobile/src/lib/i18n/ko/common.json";
import koAuth from "../../../mobile/src/lib/i18n/ko/auth.json";
import koTracker from "../../../mobile/src/lib/i18n/ko/tracker.json";

const resources = {
  common: koCommon,
  auth: koAuth,
  tracker: koTracker,
};

const DEFAULT_NS = "common";

// Walk a dot-separated path (e.g. "account.home.topBar.title") into a nested
// object. Returns undefined if any segment is missing.
const lookup = (obj, key) =>
  key.split(".").reduce((acc, part) => {
    if (acc != null && typeof acc === "object" && part in acc) return acc[part];
    return undefined;
  }, obj);

// Replace {{var}} placeholders with values from the interpolation options.
const interpolate = (value, options) => {
  if (typeof value !== "string" || !options) return value;
  return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, name) =>
    name in options ? String(options[name]) : match,
  );
};

const makeT = (ns) => (key, secondArg, thirdArg) => {
  // react-i18next signatures supported here:
  //   t(key)
  //   t(key, defaultValue)            -> string default
  //   t(key, options)                 -> interpolation/options object
  //   t(key, defaultValue, options)
  let defaultValue;
  let options;
  if (typeof secondArg === "string") {
    defaultValue = secondArg;
    options = thirdArg;
  } else {
    options = secondArg;
  }
  if (options && typeof options.defaultValue === "string") {
    defaultValue = options.defaultValue;
  }

  // A key may carry an explicit namespace prefix ("tracker:account.home...").
  let namespace = ns || DEFAULT_NS;
  let path = key;
  const sep = key.indexOf(":");
  if (sep !== -1) {
    namespace = key.slice(0, sep);
    path = key.slice(sep + 1);
  }

  const resolved =
    lookup(resources[namespace], path) ??
    lookup(resources[DEFAULT_NS], path) ??
    defaultValue ??
    key;

  return interpolate(resolved, options);
};

export const useTranslation = (ns) => ({
  t: makeT(Array.isArray(ns) ? ns[0] : ns),
  i18n: { changeLanguage: () => {}, language: "ko" },
  ready: true,
});

export const initReactI18next = { type: "3rdParty", init: () => {} };

export const Trans = ({ children }) => children ?? null;
