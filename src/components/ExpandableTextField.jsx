import React, { useState, useRef, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

/**
 * We store expansions in localStorage["AAP_BUILDER_SETTINGS"].textFieldExpansions
 * The user or "Expand/Collapse all" sets expansions[storageKey] = true or false for each text field.
 */

const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";

// Read global settings from localStorage
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

/**
 * This approach:
 * - We maintain an offscreen measurement <div> that simulates the collapsed text field
 *   (with the specified "rows" height, same styling). We can measure whether the text
 *   exceeds that container's scrollHeight. This works even if the real text field is hidden
 *   in an inactive step, so global "Expand all" can be decided accurately.
 * - If there's overflow, "Expand field" or "Collapse field" is relevant; otherwise, no button.
 * - If expansions[storageKey] is set to true, we do expand. But if there's no real overflow,
 *   we hide the button anyway. That means short text won't show "Collapse field."
 */
export default function ExpandableTextField({
  storageKey,
  rows = 4,
  value,
  onChange,
  placeholder,
  characterLimit = 0,
  ...props
}) {
  // 1) Local "expanded" state, synced with localStorage
  const [expanded, setExpanded] = useState(() => {
    const s = getLocalSettings();
    return !!s.textFieldExpansions[storageKey];
  });

  // 2) Whether the "Expand/Collapse" button is shown
  const [showToggle, setShowToggle] = useState(false);

  // 3) A hidden <div> for measuring overflow in collapsed mode
  const measureRef = useRef(null);

  // --------------------------------------------------------------------------
  // measureOverflow: checks if the text is too tall for the collapsed height
  // in the offscreen <div> (simulate "rows = 4"). If it is, there's overflow.
  // --------------------------------------------------------------------------
  function measureOverflow() {
    if (!measureRef.current) {
      setShowToggle(false);
      return;
    }
    const { scrollHeight, clientHeight } = measureRef.current;
    const isOverflow = scrollHeight > clientHeight + 1;

    if (!expanded) {
      // If not expanded => show button only if there's overflow
      setShowToggle(isOverflow);
    } else {
      // If expanded => show button only if there was a reason to expand
      // i.e. if there's actual overflow in collapsed mode
      setShowToggle(isOverflow);
    }
  }

  // --------------------------------------------------------------------------
  // We remeasure after each render if "value" or "expanded" changes
  // (the user typed or a global expand/collapse happened).
  // We do not forcibly set "expanded" here; we just decide showToggle.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const rafId = requestAnimationFrame(measureOverflow);
    return () => cancelAnimationFrame(rafId);
  }, [value, expanded]);

  // --------------------------------------------------------------------------
  // If local "expanded" changes, sync to localStorage
  // --------------------------------------------------------------------------
  useEffect(() => {
    const s = getLocalSettings();
    s.textFieldExpansions[storageKey] = expanded;
    saveLocalSettings(s);
  }, [expanded, storageKey]);

  // --------------------------------------------------------------------------
  // Listen for "AAP_SETTINGS_UPDATED" => read expansions from localStorage.
  // Set expanded accordingly. Then measure to figure out if showToggle is shown.
  // We do not rely on the text field's actual visibility. The measureRef is
  // offscreen, so we can measure even if the real field is in an inactive step.
  // --------------------------------------------------------------------------
  useEffect(() => {
    function handleGlobalUpdate() {
      const s = getLocalSettings();
      const newVal = !!s.textFieldExpansions[storageKey];
      setExpanded(newVal);
    }
    window.addEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
    return () => {
      window.removeEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
    };
  }, [storageKey]);

  // --------------------------------------------------------------------------
  // When the user toggles locally
  // --------------------------------------------------------------------------
  function handleToggle() {
    setExpanded((prev) => !prev);
  }

  // --------------------------------------------------------------------------
  // Decide the multiline props for the actual text field
  // If expanded => no limit, else => "rows" limit
  // --------------------------------------------------------------------------
  const textFieldProps = expanded
    ? { multiline: true, minRows: rows }
    : { multiline: true, rows, InputProps: { style: { overflow: "auto" } } };

  // The hidden measure container is crucial. We replicate the "rows" style
  // so we can measure how tall it would be in collapsed mode. We set a maxHeight
  // to (rows * lineHeight). Adjust if your actual MUI lineHeight differs.
  // For a typical MUI TextField, line-height ~1.43, so 1.5 * rows is a guess.
  // We'll store 24px lineHeight per row => rows * 24.
  const collapsedLineHeight = 24;
  const collapsedMaxHeight = rows * collapsedLineHeight;

  return (
    <Box>
      {/* The actual text field the user interacts with */}
      <TextField
        {...textFieldProps}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />

      {/* Our hidden measurement container for "collapsed" mode */}
      <Box
        ref={measureRef}
        sx={{
          position: "absolute",
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          overflow: "auto",
          // match the text field's approximate width
          width: 600, // <== adjust if your text fields have a known width
          maxHeight: collapsedMaxHeight,
          // match the text field's font & line-height
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          lineHeight: `${collapsedLineHeight}px`,
          p: 1,
          // also replicate any horizontal padding
          boxSizing: "border-box",
        }}
      >
        {value}
      </Box>

      {/* The row with the expand/collapse button and optional character count */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mt: 0.5,
          gap: 3,
        }}
      >
        {showToggle && (
          <Button size="small" onClick={handleToggle}>
            {expanded ? "Collapse field" : "Expand field"}
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
