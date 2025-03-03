import React, { createContext, useState, useEffect } from "react";
import enGB from "../locales/en-gb.json";
import fr from "../locales/fr.json";
import pt from "../locales/pt.json";

export const LanguageContext = createContext();

const translations = {
  "en-gb": enGB,
  "fr": fr,
  "pt": pt,
};

// List of available language codes
const availableLanguages = ["en-gb", "fr", "pt"];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en-gb");

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
    for (const k of keys) {
      translation = translation?.[k];
      if (!translation) break;
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
      value={{ language, changeLanguage, t, availableLanguages, getNativeLanguageName }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
