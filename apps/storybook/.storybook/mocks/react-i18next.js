export const useTranslation = () => ({
  t: (key) => key,
  i18n: { changeLanguage: () => {}, language: "ko" },
  ready: true,
});

export const initReactI18next = { type: "3rdParty", init: () => {} };

export const Trans = ({ children }) => children ?? null;
