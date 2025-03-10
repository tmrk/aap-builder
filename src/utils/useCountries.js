import { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import ptTranslations from "../locales/pt.json";

const STORAGE_KEY = "COUNTRIES_DATA";

export default function useCountries() {
  const [countries, setCountries] = useState([]);
  const { language } = useContext(LanguageContext);

  // Map app language to the corresponding key in the online JSON.
  const languageToKey = {
    "en": "name",
    "fr": "nameFrench",
    "es": "nameSpanish",
    "ru": "nameRussian",
    "zh": "nameChinese",
    "ar": "nameArabic",
  };
  const localizedKey = languageToKey[language] || "name";

  useEffect(() => {
    // If the language is Portuguese and the translation file provides a countries list, use it.
    if (language === "pt" && ptTranslations.countries && Array.isArray(ptTranslations.countries) && ptTranslations.countries.length > 0) {
      setCountries(ptTranslations.countries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ptTranslations.countries));
      return;
    }

    // Otherwise, try to load from localStorage first.
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        const arr = JSON.parse(local);
        if (Array.isArray(arr)) {
          setCountries(arr);
        } else {
          console.warn("Local countries data was not an array:", arr);
        }
      } catch (err) {
        console.error("Failed to parse local countries:", err);
      }
    }

    // If online, fetch the countries JSON and process it.
    if (navigator.onLine) {
      const countriesUrl =
        "https://gist.githubusercontent.com/tmrk/3ba1cc679e9f655143593524a203b7e2/raw/countries.json";
      fetch(countriesUrl)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const processedCountries = data.map((c) => ({
              alpha2: c.alpha2,
              name: c[localizedKey] || c.name,
            }));
            setCountries(processedCountries);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(processedCountries));
          } else {
            console.error("Expected an array but got:", data);
          }
        })
        .catch((err) => console.error("Error fetching countries:", err));
    }
  }, [language, localizedKey]);

  return countries;
}
