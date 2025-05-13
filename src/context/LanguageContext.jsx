// src/context/LanguageContext.jsx
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

/* -------------------------------------------------------------------------- */
/*                               CONFIG / DATA                                */
/* -------------------------------------------------------------------------- */

export const LanguageContext = createContext();

const translations = { en, fr, pt, sn, ny, sw, lg };
const availableLanguages = ["en", "fr", "pt", "sn", "ny", "sw", "lg"];

const getDateFnsLocale = (lang) => {
  switch (lang) {
    case "fr":
      return frLocale;
    case "pt":
      return ptLocale;
    default:
      return enGB;
  }
};

/* -------------------------------------------------------------------------- */
/*                            LANGUAGE PROVIDER                               */
/* -------------------------------------------------------------------------- */

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  /* -- Initialise from localStorage (no more URL sniffing) ---------------- */
  useEffect(() => {
    const stored = localStorage.getItem("AAP_BUILDER_LANGUAGE");
    if (stored && availableLanguages.includes(stored)) {
      setLanguage(stored);
    } else {
      localStorage.setItem("AAP_BUILDER_LANGUAGE", "en");
    }
  }, []);

  /* -- Change language (state + localStorage, no URL rewrite) ------------- */
  const changeLanguage = (lang) => {
    if (!availableLanguages.includes(lang)) return;
    setLanguage(lang);
    localStorage.setItem("AAP_BUILDER_LANGUAGE", lang);
  };

  /* ----------------------------- i18n helper ----------------------------- */
  const t = (key, replacements = {}) => {
    const traverse = (obj, path) =>
      path.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

    let translation = traverse(translations[language], key.split("."))
      ?? traverse(translations["en"], key.split("."))
      ?? key;

    if (typeof translation === "string") {
      Object.entries(replacements).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, v);
      });
    }
    return translation;
  };

  const getNativeLanguageName = (code) =>
    translations[code]?.language?.native || code;

  /* ------------------------------ Context -------------------------------- */
  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        availableLanguages,
        getNativeLanguageName,
        currentTranslation: translations[language] || translations["en"],
        dateFnsLocale: getDateFnsLocale(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
