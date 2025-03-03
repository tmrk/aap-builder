import React, { createContext, useState, useEffect, useCallback } from "react";

export const AAPContext = createContext();

const LOCAL_STORAGE_KEY = "AAP_BUILDER_DATA";

export const AAPProvider = ({ children }) => {
  const [aapData, setAapData] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(aapData));
  }, [aapData]);

  // Wrap updateField in useCallback so its reference remains stable,
  // preventing re-execution of useEffects in dependent components.
  const updateField = useCallback((sectionId, subsectionId, questionId, value) => {
    setAapData((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [subsectionId]: {
          ...((prev[sectionId] && prev[sectionId][subsectionId]) || {}),
          [questionId]: value,
        },
      },
    }));
  }, []);

  return (
    <AAPContext.Provider value={{ aapData, setAapData, updateField }}>
      {children}
    </AAPContext.Provider>
  );
};
