import React, { createContext, useState, useEffect } from "react";
import enGB from "../locales/en-gb.json";

export const LanguageContext = createContext();

const translations = {
  "en-gb": enGB,
};

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

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
