import { useState, useEffect } from "react";

export function getLocalSettings() {
  const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";
  try {
    const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    if (!parsed.hintsVisibility) parsed.hintsVisibility = {};
    if (!parsed.examplesVisibility) parsed.examplesVisibility = {};
    return parsed;
  } catch {
    return { hintsVisibility: {}, examplesVisibility: {} };
  }
}

export function saveLocalSettings(data) {
  const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";
  localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("AAP_SETTINGS_UPDATED"));
}

export function getHintKey(stepId, subsectionId, subsubId) {
  return subsubId
    ? `hint-${stepId}-${subsectionId}-${subsubId}`
    : `hint-${stepId}-${subsectionId}`;
}
export function getExampleKey(stepId, subsectionId, subsubId) {
  return subsubId
    ? `example-${stepId}-${subsectionId}-${subsubId}`
    : `example-${stepId}-${subsectionId}`;
}

export function useGlobalVisibility(isHint, stepId, subsectionId, subsubId) {
  const storageKey = isHint
    ? getHintKey(stepId, subsectionId, subsubId)
    : getExampleKey(stepId, subsectionId, subsubId);
  const [localVisible, setLocalVisible] = useState(() => {
    const s = getLocalSettings();
    return isHint ? !!s.hintsVisibility[storageKey] : !!s.examplesVisibility[storageKey];
  });
  const [globalSettings, setGlobalSettings] = useState(() => {
    const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";
    try {
      const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed;
    } catch {
      return {};
    }
  });
  
  // The effective visibility takes into account any global "always display" flags.
  const globalFlag = isHint
    ? globalSettings.alwaysDisplayAllHints
    : globalSettings.alwaysDisplayAllExamples;
  
  const effectiveVisible = globalFlag ? true : localVisible;
  
  const toggle = () => {
    setLocalVisible((prev) => !prev);
    const s = getLocalSettings();
    if (isHint) {
      s.hintsVisibility[storageKey] = !localVisible;
    } else {
      s.examplesVisibility[storageKey] = !localVisible;
    }
    saveLocalSettings(s);
  };

  useEffect(() => {
    function handleGlobalUpdate() {
      const s = getLocalSettings();
      const newLocal = isHint
        ? !!s.hintsVisibility[storageKey]
        : !!s.examplesVisibility[storageKey];
      setLocalVisible(newLocal);
      try {
        const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";
        const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        setGlobalSettings(parsed);
      } catch {
        setGlobalSettings({});
      }
    }
    window.addEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
    return () =>
      window.removeEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
  }, [isHint, storageKey]);

  return [effectiveVisible, toggle];
}
