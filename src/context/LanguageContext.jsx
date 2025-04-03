import React, { createContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import pt from "../locales/pt.json";
import sn from "../locales/sn.json";
import ny from "../locales/ny.json";
import sw from "../locales/sw.json";
import lg from "../locales/lg.json";
import enGB from "date-fns/locale/en-GB";
import frLocale from "date-fns/locale/fr";
import ptLocale from "date-fns/locale/pt";

export const LanguageContext = createContext();

const translations = {
  en: en,
  fr: fr,
  pt: pt,
  sn: sn,
  ny: ny,
  sw: sw,
  lg: lg,
};

// List of available language codes (update as needed)
const availableLanguages = ["en", "fr", "pt", "sn", "ny", "sw", "lg"];
// Hardcoded BASE_URL for your sub-directory (adjust as needed)
const BASE_URL = "/aap-builder";

const getDateFnsLocale = (lang) => {
  switch (lang) {
    case "en":
      return enGB;
    case "fr":
      return frLocale;
    case "pt":
      return ptLocale;
    default:
      return enGB;
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const path = window.location.pathname;
    let relativePath = path;
    if (BASE_URL && path.startsWith(BASE_URL)) {
      relativePath = path.substring(BASE_URL.length) || "/";
    }
    // Build regex from availableLanguages
    const languageRegex = new RegExp(`^\\/(${availableLanguages.join("|")})(\\/|$)`);
    const match = relativePath.match(languageRegex);
    if (match) {
      const urlLang = match[1];
      // If trailing slash is missing (match[2] is empty), update URL to add it.
      if (match[2] !== "/") {
        const newPath = BASE_URL + "/" + urlLang + "/" + relativePath.substring(match[0].length);
        window.history.replaceState(null, "", newPath);
      }
      setLanguage(urlLang);
      localStorage.setItem("AAP_BUILDER_LANGUAGE", urlLang);
    } else {
      const storedLang = localStorage.getItem("AAP_BUILDER_LANGUAGE") || language;
      // Ensure trailing slash after language code.
      const newPath = BASE_URL + "/" + storedLang + (relativePath.startsWith("/") ? relativePath : "/" + relativePath);
      window.history.replaceState(null, "", newPath);
      setLanguage(storedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("AAP_BUILDER_LANGUAGE", lang);
    const path = window.location.pathname;
    let relativePath = path;
    if (BASE_URL && path.startsWith(BASE_URL)) {
      relativePath = path.substring(BASE_URL.length) || "/";
    }
    const languageRegex = new RegExp(`^\\/(${availableLanguages.join("|")})(\\/|$)`);
    const newRelativePath = relativePath.replace(languageRegex, "");
    // Ensure there is a trailing slash after the language code.
    const newPath = BASE_URL + "/" + lang + (newRelativePath.startsWith("/") ? newRelativePath : "/" + newRelativePath);
    window.history.replaceState(null, "", newPath);
  };

  const t = (key, replacements = {}) => {
    const keys = key.split(".");
    let translation = translations[language];
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        translation = null;
        break;
      }
    }
    if (!translation) {
      translation = translations["en"];
      for (const k of keys) {
        if (translation && translation[k]) {
          translation = translation[k];
        } else {
          translation = null;
          break;
        }
      }
    }
    if (translation && typeof translation === "string") {
      Object.keys(replacements).forEach((repKey) => {
        translation = translation.replace(`{${repKey}}`, replacements[repKey]);
      });
      return translation;
    }
    return key;
  };

  const getNativeLanguageName = (code) => {
    return translations[code]?.language?.native || code;
  };

  const currentTranslation = translations[language] || translations["en"];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        availableLanguages,
        getNativeLanguageName,
        currentTranslation,
        dateFnsLocale: getDateFnsLocale(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
