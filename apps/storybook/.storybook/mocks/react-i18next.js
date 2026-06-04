import auth from "../../../mobile/src/lib/i18n/ko/auth.json";
import common from "../../../mobile/src/lib/i18n/ko/common.json";
import tracker from "../../../mobile/src/lib/i18n/ko/tracker.json";

const resources = { auth, common, tracker };

function resolve(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export const useTranslation = (ns = "common") => ({
  t: (key, opts) => {
    let namespace = ns;
    let lookupKey = key;

    if (key.includes(":")) {
      const idx = key.indexOf(":");
      namespace = key.slice(0, idx);
      lookupKey = key.slice(idx + 1);
    }

    const value = resolve(resources[namespace], lookupKey);
    if (value !== undefined && value !== null && typeof value !== "object")
      return String(value);
    return opts?.defaultValue ?? key;
  },
  i18n: { changeLanguage: () => {}, language: "ko" },
  ready: true,
});

export const initReactI18next = { type: "3rdParty", init: () => {} };

export const Trans = ({ children }) => children ?? null;
