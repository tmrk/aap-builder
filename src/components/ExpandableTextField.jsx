import React, { useState, useRef, useEffect, useContext } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { LanguageContext } from "../context/LanguageContext";
import { AAPContext } from "../context/AAPContext";

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
  const { language } = useContext(LanguageContext); // for lang
  const { currentFile, updateFileSettings } = useContext(AAPContext);

  // Get initial expanded value from current file settings (default false)
  const initialExpanded = currentFile?.AAP_BUILDER_SETTINGS?.textFieldExpansions?.[storageKey] || false;
  const [expanded, setExpanded] = useState(initialExpanded);
  const [showToggle, setShowToggle] = useState(false);
  const measureRef = useRef(null);

  // Sync local state if external setting changes.
  useEffect(() => {
    const stored = currentFile?.AAP_BUILDER_SETTINGS?.textFieldExpansions?.[storageKey] || false;
    if (stored !== expanded) {
      setExpanded(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFile, storageKey]);

  function measureOverflow() {
    if (!measureRef.current) {
      setShowToggle(false);
      return;
    }
    const { scrollHeight, clientHeight } = measureRef.current;
    setShowToggle(scrollHeight > clientHeight + 1);
  }

  useEffect(() => {
    const rafId = requestAnimationFrame(measureOverflow);
    return () => cancelAnimationFrame(rafId);
  }, [value, expanded]);

  function handleToggle() {
    // Update local state first.
    setExpanded((prev) => {
      const newVal = !prev;
      if (currentFile) {
        const newSettings = {
          ...currentFile.AAP_BUILDER_SETTINGS,
          textFieldExpansions: {
            ...currentFile.AAP_BUILDER_SETTINGS.textFieldExpansions,
            [storageKey]: newVal,
          },
        };
        // Defer the update to file settings to after the current render cycle.
        setTimeout(() => {
          updateFileSettings(newSettings);
        }, 0);
      }
      return newVal;
    });
  }

  const collapsedLineHeight = 24;
  const collapsedMaxHeight = rows * collapsedLineHeight;

  const textFieldProps =
    currentFile?.AAP_BUILDER_SETTINGS?.alwaysExpandTextFields || expanded
      ? { multiline: true, minRows: rows }
      : { multiline: true, rows, InputProps: { style: { overflow: "auto" } } };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        {...textFieldProps}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputProps={{
          lang: language,
          spellCheck: "true",
        }}
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
        sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 0.5, gap: 3 }}
      >
        {!currentFile?.AAP_BUILDER_SETTINGS?.alwaysExpandTextFields &&
          showToggle && (
            <Button size="small" onClick={handleToggle}>
              {expanded ? t("expandableTextField.collapse") : t("expandableTextField.expand")}
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
