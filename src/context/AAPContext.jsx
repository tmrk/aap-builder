import React, { createContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "AAP_DATA_STORE"; // All multi-AAP data is stored here.
const CURRENT_FILE_KEY = "AAP_CURRENT_FILE_ID"; // Persist current file ID
const defaultStore = {
  AAP_FILES: [],
  AAP_TEMPLATES: [],
  COUNTRIES_DATA: null,
};

function loadStore() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse AAP_DATA_STORE", e);
      return defaultStore;
    }
  }
  return defaultStore;
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export const AAPContext = createContext();

export const AAPProvider = ({ children }) => {
  const [store, setStore] = useState(loadStore());
  const [currentFile, setCurrentFile] = useState(null);

  // Load current file on mount if its ID exists
  useEffect(() => {
    const currentId = localStorage.getItem(CURRENT_FILE_KEY);
    if (currentId && store.AAP_FILES.length > 0) {
      const file = store.AAP_FILES.find((f) => f.id === currentId);
      if (file) {
        setCurrentFile(file);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.AAP_FILES]);

  // Persist the store whenever it changes
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Persist current file ID when it changes
  useEffect(() => {
    if (currentFile) {
      localStorage.setItem(CURRENT_FILE_KEY, currentFile.id);
    } else {
      localStorage.removeItem(CURRENT_FILE_KEY);
    }
  }, [currentFile]);

  const updateCurrentFile = useCallback((updatedFile) => {
    updatedFile.last_updated = new Date().toISOString();
    setCurrentFile(updatedFile);
    setStore((prevStore) => {
      const updatedFiles = prevStore.AAP_FILES.map((file) =>
        file.id === updatedFile.id ? updatedFile : file
      );
      return { ...prevStore, AAP_FILES: updatedFiles };
    });
  }, []);

  const updateField = useCallback((sectionId, subsectionId, questionId, value) => {
    setCurrentFile((prev) => {
      if (!prev) return prev;
      const updatedData = {
        ...prev.AAP_BUILDER_DATA,
        [sectionId]: {
          ...(prev.AAP_BUILDER_DATA[sectionId] || {}),
          [subsectionId]: {
            ...((prev.AAP_BUILDER_DATA[sectionId] &&
              prev.AAP_BUILDER_DATA[sectionId][subsectionId]) ||
              {}),
            [questionId]: value,
          },
        },
      };
      const updatedFile = { ...prev, AAP_BUILDER_DATA: updatedData };
      updateCurrentFile(updatedFile);
      return updatedFile;
    });
  }, [updateCurrentFile]);

  const updateActiveStep = useCallback((step) => {
    setCurrentFile((prev) => {
      if (!prev) return prev;
      const updatedFile = { ...prev, AAP_ACTIVE_STEP: step };
      updateCurrentFile(updatedFile);
      return updatedFile;
    });
  }, [updateCurrentFile]);

  const updateFileSettings = useCallback((newSettings) => {
    setCurrentFile((prev) => {
      if (!prev) return prev;
      if (JSON.stringify(prev.AAP_BUILDER_SETTINGS) === JSON.stringify(newSettings)) {
        return prev;
      }
      const updatedFile = { ...prev, AAP_BUILDER_SETTINGS: newSettings };
      updateCurrentFile(updatedFile);
      return updatedFile;
    });
  }, [updateCurrentFile]);

  /**
   * Create a new AAP file.
   * @param {string} templateUrl - The URL of the template this file is based on.
   */
  const createNewFile = useCallback((templateUrl, templateShortName) => {
    const id = `aap_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newFile = {
      id,
      last_updated: new Date().toISOString(),
      aap_template_shortName: templateShortName,
      AAP_BUILDER_DATA: {},
      AAP_ACTIVE_STEP: 0,
      AAP_BUILDER_SETTINGS: {
        textFieldExpansions: {},
        alwaysExpandTextFields: false,
        hintsVisibility: {},
        alwaysDisplayAllHints: false,
        examplesVisibility: {},
        alwaysDisplayAllExamples: false,
      },
      // Store the template reference as its URL instead of an ID.
      aap_template: templateUrl,
    };
    setStore((prevStore) => ({
      ...prevStore,
      AAP_FILES: [...prevStore.AAP_FILES, newFile],
    }));
    setCurrentFile(newFile);
  }, []);

  const loadFileById = useCallback((fileId) => {
    const file = store.AAP_FILES.find((f) => f.id === fileId);
    if (file) {
      setCurrentFile(file);
    }
  }, [store.AAP_FILES]);

  const deleteFile = useCallback((fileId) => {
    setStore((prevStore) => {
      const updatedFiles = prevStore.AAP_FILES.filter((file) => file.id !== fileId);
      return { ...prevStore, AAP_FILES: updatedFiles };
    });
    setCurrentFile((prev) => (prev && prev.id === fileId ? null : prev));
  }, []);

  const addTemplate = useCallback((newTemplate) => {
    setStore((prevStore) => {
      const updatedTemplates = [...(prevStore.AAP_TEMPLATES || []), newTemplate];
      return { ...prevStore, AAP_TEMPLATES: updatedTemplates };
    });
  }, []);

  const importFile = useCallback((importedFile) => {
    setStore((prevStore) => {
      const duplicate = prevStore.AAP_FILES.some((file) => file.id === importedFile.id);
      if (duplicate) {
        // Append a unique suffix to ensure a unique id
        importedFile.id = `${importedFile.id}_${Date.now()}`;
      }
      return { ...prevStore, AAP_FILES: [...prevStore.AAP_FILES, importedFile] };
    });
    setCurrentFile(importedFile);
  }, []);

  const contextValue = {
    store,
    currentFile,
    setCurrentFile,
    createNewFile,
    loadFileById,
    deleteFile,
    updateField,
    updateActiveStep,
    updateFileSettings,
    addTemplate,
    importFile,
  };

  return <AAPContext.Provider value={contextValue}>{children}</AAPContext.Provider>;
};

export default AAPProvider;
