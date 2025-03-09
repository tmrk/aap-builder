import { useState, useEffect, useContext } from "react";
import { AAPContext } from "../context/AAPContext";

export function useGlobalVisibility(isHint, stepId, subsectionId, subsubId) {
  const { currentFile, updateFileSettings } = useContext(AAPContext);
  const key = isHint
    ? `hint-${stepId}-${subsectionId}${subsubId ? "-" + subsubId : ""}`
    : `example-${stepId}-${subsectionId}${subsubId ? "-" + subsubId : ""}`;
  
  const storedVisibility = Boolean(
    currentFile?.AAP_BUILDER_SETTINGS?.[isHint ? "hintsVisibility" : "examplesVisibility"]?.[key]
  );
  
  const [localVisible, setLocalVisible] = useState(storedVisibility);
  const globalFlag = currentFile?.AAP_BUILDER_SETTINGS?.[isHint ? "alwaysDisplayAllHints" : "alwaysDisplayAllExamples"] || false;
  const effectiveVisible = globalFlag ? true : localVisible;

  const toggle = () => {
    const newVisible = !localVisible;
    setLocalVisible(newVisible);
    if (currentFile) {
      const settings = currentFile.AAP_BUILDER_SETTINGS;
      const visibilityKey = isHint ? "hintsVisibility" : "examplesVisibility";
      const updatedVisibility = { ...settings[visibilityKey], [key]: newVisible };
      const newSettings = { ...settings, [visibilityKey]: updatedVisibility };
      updateFileSettings(newSettings);
    }
  };

  useEffect(() => {
    setLocalVisible(storedVisibility);
  }, [storedVisibility]);

  return [effectiveVisible, toggle, globalFlag];
}
