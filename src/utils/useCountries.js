import { useState, useEffect } from "react";

const STORAGE_KEY = "COUNTRIES_DATA";

export default function useCountries() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
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

    if (navigator.onLine) {
      const countriesUrl = "https://gist.githubusercontent.com/tmrk/3ba1cc679e9f655143593524a203b7e2/raw/countries.json";
      fetch(countriesUrl)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const names = data.map((c) => c.name);
            setCountries(names);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
          } else {
            console.error("Expected an array but got:", data);
          }
        })
        .catch((err) => console.error("Error fetching countries:", err));
    }
  }, []);

  return countries;
}
