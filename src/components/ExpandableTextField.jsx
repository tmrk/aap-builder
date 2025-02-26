import React, { useState, useRef, useEffect, useContext } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { LanguageContext } from "../context/LanguageContext";

const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";

function getLocalSettings() {
  try {
    const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    if (!parsed.textFieldExpansions) parsed.textFieldExpansions = {};
    return parsed;
  } catch {
    return { textFieldExpansions: {} };
  }
}

function saveLocalSettings(data) {
  localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("AAP_SETTINGS_UPDATED"));
}

export default function ExpandableTextField({
  storageKey,
  rows = 4,
  value,
  onChange,
  placeholder,
  characterLimit = 0,
  ...props
}) {
  const { t } = useContext(LanguageContext);
  const [expanded, setExpanded] = useState(() => {
    const s = getLocalSettings();
    return !!s.textFieldExpansions[storageKey];
  });
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // If "alwaysExpandTextFields" is true, force expansion
  const effectiveExpanded = globalSettings.alwaysExpandTextFields ? true : expanded;

  const [showToggle, setShowToggle] = useState(false);
  const measureRef = useRef(null);

  function measureOverflow() {
    if (!measureRef.current) {
      setShowToggle(false);
      return;
    }
    const { scrollHeight, clientHeight } = measureRef.current;
    const isOverflow = scrollHeight > clientHeight + 1;
    setShowToggle(isOverflow);
  }

  useEffect(() => {
    const rafId = requestAnimationFrame(measureOverflow);
    return () => cancelAnimationFrame(rafId);
  }, [value, expanded]);

  useEffect(() => {
    const s = getLocalSettings();
    s.textFieldExpansions[storageKey] = expanded;
    saveLocalSettings(s);
  }, [expanded, storageKey]);

  useEffect(() => {
    function handleGlobalUpdate() {
      const s = getLocalSettings();
      const newVal = !!s.textFieldExpansions[storageKey];
      setExpanded(newVal);
      try {
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
  }, [storageKey]);

  function handleToggle() {
    setExpanded((prev) => !prev);
  }

  const textFieldProps = effectiveExpanded
    ? { multiline: true, minRows: rows }
    : { multiline: true, rows, InputProps: { style: { overflow: "auto" } } };

  const collapsedLineHeight = 24;
  const collapsedMaxHeight = rows * collapsedLineHeight;

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        {...textFieldProps}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />

      <Box
        ref={measureRef}
        sx={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          overflow: "auto",
          width: "100%",
          maxHeight: collapsedMaxHeight,
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          lineHeight: `${collapsedLineHeight}px`,
          p: 1,
          boxSizing: "border-box",
        }}
      >
        {value}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mt: 0.5,
          gap: 3,
        }}
      >
        {!globalSettings.alwaysExpandTextFields && showToggle && (
          <Button size="small" onClick={handleToggle}>
            {expanded
              ? t("expandableTextField.collapse")
              : t("expandableTextField.expand")}
          </Button>
        )}
        {characterLimit > 0 && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "right",
              color: value.length > characterLimit ? "red" : "text.secondary",
            }}
          >
            {value.length} / {characterLimit}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
