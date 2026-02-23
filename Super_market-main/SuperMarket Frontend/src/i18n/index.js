import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import all locale files
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import bn from "./locales/bn.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";
import pa from "./locales/pa.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ur from "./locales/ur.json";
import arAE from "./locales/ar-AE.json";

// Language metadata for the language selector
export const languages = [
  // Global languages
  { code: "en", label: "English", flag: "🇬🇧", region: "global" },
  { code: "es", label: "Español", flag: "🇪🇸", region: "global" },
  { code: "fr", label: "Français", flag: "🇫🇷", region: "global" },
  { code: "ar", label: "العربية", flag: "🇸🇦", region: "global", dir: "rtl" },
  { code: "ar-AE", label: "العربية (الإمارات)", flag: "🇦🇪", region: "global", dir: "rtl" },
  { code: "zh", label: "中文", flag: "🇨🇳", region: "global" },
  { code: "ja", label: "日本語", flag: "🇯🇵", region: "global" },
  // South Asian languages
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", region: "india" },
  { code: "ur", label: "اردو", flag: "🇵🇰", region: "india", dir: "rtl" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳", region: "india" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳", region: "india" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳", region: "india" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳", region: "india" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳", region: "india" },
  { code: "mr", label: "मराठी", flag: "🇮🇳", region: "india" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳", region: "india" },
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳", region: "india" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ta: { translation: ta },
      te: { translation: te },
      kn: { translation: kn },
      ml: { translation: ml },
      bn: { translation: bn },
      mr: { translation: mr },
      gu: { translation: gu },
      pa: { translation: pa },
      es: { translation: es },
      fr: { translation: fr },
      ar: { translation: ar },
      zh: { translation: zh },
      ja: { translation: ja },
      ur: { translation: ur },
      "ar-AE": { translation: arAE },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "smms-language",
    },
  });

// Update document lang & dir when language changes
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  const langInfo = languages.find((l) => l.code === lng);
  document.documentElement.dir = langInfo?.dir === "rtl" ? "rtl" : "ltr";
});

// Set initial lang attribute
document.documentElement.lang = i18n.language;

export default i18n;
