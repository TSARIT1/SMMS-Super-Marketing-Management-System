import React, { useState, useRef, useEffect } from "react";
import { Globe, Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { languages } from "../i18n/index";
import { useTheme } from "../contexts/ThemeContext";

const LanguageThemeSelector = () => {
  const { i18n, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("language"); // "language" | "theme"
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const currentLang = languages.find((l) => l.code === i18n.language) ||
    languages.find((l) => i18n.language?.startsWith(l.code)) ||
    languages[0];

  const globalLangs = languages.filter((l) => l.region === "global");
  const indianLangs = languages.filter((l) => l.region === "india");

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const themeOptions = [
    { id: "light", label: t("theme.light"), icon: Sun },
    { id: "dark", label: t("theme.dark"), icon: Moon },
    { id: "system", label: t("theme.system"), icon: Monitor },
  ];

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
        aria-label="Language and Theme Settings"
        title="Language & Theme"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">
          {currentLang.flag}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fadeIn">
          {/* Tab headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTab("language")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "language"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              🌐 {t("language.title", "Language")}
            </button>
            <button
              onClick={() => setTab("theme")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === "theme"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              🎨 {t("theme.title", "Theme")}
            </button>
          </div>

          {/* Language tab */}
          {tab === "language" && (
            <div className="max-h-80 overflow-y-auto p-2">
              {/* Global languages */}
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1">
                🌍 Global
              </p>
              {globalLangs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLang.code === lang.code
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {currentLang.code === lang.code && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}

              {/* Indian languages */}
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-1 mt-2">
                🇮🇳 India
              </p>
              {indianLangs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentLang.code === lang.code
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {currentLang.code === lang.code && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Theme tab */}
          {tab === "theme" && (
            <div className="p-3 space-y-1">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                      theme === opt.id
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left font-medium">{opt.label}</span>
                    {theme === opt.id && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                );
              })}

              {/* Theme preview */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <div
                    onClick={() => setTheme("light")}
                    className={`flex-1 cursor-pointer rounded-lg p-3 border-2 transition-colors ${
                      theme === "light" ? "border-blue-500" : "border-gray-200 dark:border-gray-600"
                    } bg-white`}
                  >
                    <div className="h-2 w-8 bg-gray-200 rounded mb-1" />
                    <div className="h-2 w-12 bg-gray-300 rounded mb-1" />
                    <div className="h-2 w-6 bg-blue-400 rounded" />
                    <p className="text-[9px] text-gray-500 mt-1 text-center">Light</p>
                  </div>
                  <div
                    onClick={() => setTheme("dark")}
                    className={`flex-1 cursor-pointer rounded-lg p-3 border-2 transition-colors ${
                      theme === "dark" ? "border-blue-500" : "border-gray-200 dark:border-gray-600"
                    } bg-gray-900`}
                  >
                    <div className="h-2 w-8 bg-gray-700 rounded mb-1" />
                    <div className="h-2 w-12 bg-gray-600 rounded mb-1" />
                    <div className="h-2 w-6 bg-blue-500 rounded" />
                    <p className="text-[9px] text-gray-400 mt-1 text-center">Dark</p>
                  </div>
                  <div
                    onClick={() => setTheme("system")}
                    className={`flex-1 cursor-pointer rounded-lg p-3 border-2 transition-colors ${
                      theme === "system" ? "border-blue-500" : "border-gray-200 dark:border-gray-600"
                    } bg-gradient-to-r from-white to-gray-900`}
                  >
                    <div className="h-2 w-8 bg-gray-400 rounded mb-1" />
                    <div className="h-2 w-12 bg-gray-500 rounded mb-1" />
                    <div className="h-2 w-6 bg-blue-400 rounded" />
                    <p className="text-[9px] text-gray-400 mt-1 text-center">Auto</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageThemeSelector;
