import React, { createContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import fr from "../locales/fr.json";
import pt from "../locales/pt.json";
import enGB from "date-fns/locale/en-GB";
import frLocale from "date-fns/locale/fr";
import ptLocale from "date-fns/locale/pt";

export const LanguageContext = createContext();

const translations = {
  en: en,
  fr: fr,
  pt: pt,
};

// List of available language codes
const availableLanguages = ["en", "fr", "pt"];

// Helper function to get the date-fns locale based on language
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
    const storedLang = localStorage.getItem("AAP_BUILDER_LANGUAGE");
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("AAP_BUILDER_LANGUAGE", lang);
  };

  const t = (key, replacements = {}) => {
    const keys = key.split(".");
    let translation = translations[language];
    // Traverse the keys to get the translation in the current language
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        translation = null;
        break;
      }
    }
    // Fallback to English if no translation was found
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

  // Retrieve the native language name using the dedicated "native" property
  const getNativeLanguageName = (code) => {
    return translations[code]?.language?.native || code;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        availableLanguages,
        getNativeLanguageName,
        dateFnsLocale: getDateFnsLocale(language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
