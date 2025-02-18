import React, { createContext, useState, useEffect } from "react";

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

  const updateField = (sectionId, subsectionId, questionId, value) => {
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
  };

  return (
    <AAPContext.Provider value={{ aapData, setAapData, updateField }}>
      {children}
    </AAPContext.Provider>
  );
};
