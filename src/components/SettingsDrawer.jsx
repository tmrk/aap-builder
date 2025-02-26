import React, { useEffect, useState } from "react";
import { Drawer, Box, Typography, Button, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Global settings are stored in a single JSON object under localStorage["AAP_BUILDER_SETTINGS"].
 * The shape is:
 * {
 *   "textFieldExpansions": {
 *     [storageKey: string]: boolean
 *   },
 *   "hintsVisibility": {
 *     [hintKey: string]: boolean
 *   },
 *   "examplesVisibility": {
 *     [exampleKey: string]: boolean
 *   }
 * }
 * A missing key => the item has never been set and is considered "unset".
 */

const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";

// Safely parse global settings from localStorage
function getLocalSettings() {
  try {
    const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    if (!parsed.textFieldExpansions) parsed.textFieldExpansions = {};
    if (!parsed.hintsVisibility) parsed.hintsVisibility = {};
    if (!parsed.examplesVisibility) parsed.examplesVisibility = {};
    return parsed;
  } catch {
    return {
      textFieldExpansions: {},
      hintsVisibility: {},
      examplesVisibility: {},
    };
  }
}

function saveLocalSettings(data) {
  localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("AAP_SETTINGS_UPDATED"));
}

/**
 * Counts how many items are set to true, set to false, or are absent.
 * Returns { total, countTrue, countFalse, countUnset }
 */
function analyzeBooleanDict(obj) {
  const keys = Object.keys(obj);
  let countTrue = 0;
  let countFalse = 0;
  for (const k of keys) {
    if (obj[k]) countTrue++;
    else countFalse++;
  }
  return {
    total: keys.length,
    countTrue,
    countFalse,
    countUnset: 0, // we only track what's stored; absent keys won't appear here.
  };
}

/**
 * Decide button enable/disable states for "expand/collapse all text fields" given textFieldExpansions object.
 * If textFieldExpansions is empty => "Expand all" is enabled, "Collapse all" is disabled by default.
 * If all are true => "Expand all" disabled, "Collapse all" enabled.
 * If all are false => "Expand all" enabled, "Collapse all" disabled.
 * If partial => both enabled.
 */
function getTextFieldButtonStates(textFieldExpansions) {
  const { total, countTrue, countFalse } = analyzeBooleanDict(textFieldExpansions);

  // No states => default: expandAll enabled, collapseAll disabled
  if (total === 0) {
    return {
      expandAllDisabled: false,
      collapseAllDisabled: true,
    };
  }

  if (countTrue === total) {
    // all expanded
    return {
      expandAllDisabled: true,
      collapseAllDisabled: false,
    };
  } else if (countFalse === total) {
    // all collapsed
    return {
      expandAllDisabled: false,
      collapseAllDisabled: true,
    };
  } else {
    // partial
    return {
      expandAllDisabled: false,
      collapseAllDisabled: false,
    };
  }
}

/**
 * Decide button states for "show/hide all hints" given hintsVisibility object.
 * If empty => "Show all hints" enabled, "Hide all hints" disabled by default.
 * If all true => "Show all hints" disabled, "Hide all hints" enabled.
 * If all false => "Show all hints" enabled, "Hide all hints" disabled.
 * If partial => both enabled.
 */
function getHintsButtonStates(hintsVisibility) {
  const { total, countTrue, countFalse } = analyzeBooleanDict(hintsVisibility);

  // No states => default: showAll enabled, hideAll disabled
  if (total === 0) {
    return {
      showAllDisabled: false,
      hideAllDisabled: true,
    };
  }

  if (countTrue === total) {
    // all shown
    return {
      showAllDisabled: true,
      hideAllDisabled: false,
    };
  } else if (countFalse === total) {
    // all hidden
    return {
      showAllDisabled: false,
      hideAllDisabled: true,
    };
  } else {
    // partial
    return {
      showAllDisabled: false,
      hideAllDisabled: false,
    };
  }
}

/**
 * Decide button states for "show/hide all examples" given examplesVisibility object.
 * Similar logic to hints.
 */
function getExamplesButtonStates(examplesVisibility) {
  const { total, countTrue, countFalse } = analyzeBooleanDict(examplesVisibility);

  // No states => default: showAll enabled, hideAll disabled
  if (total === 0) {
    return {
      showAllDisabled: false,
      hideAllDisabled: true,
    };
  }

  if (countTrue === total) {
    // all shown
    return {
      showAllDisabled: true,
      hideAllDisabled: false,
    };
  } else if (countFalse === total) {
    // all hidden
    return {
      showAllDisabled: false,
      hideAllDisabled: true,
    };
  } else {
    // partial
    return {
      showAllDisabled: false,
      hideAllDisabled: false,
    };
  }
}

export default function SettingsDrawer({ open, onClose }) {
  const [settings, setSettings] = useState(() => getLocalSettings());

  // Re-read localStorage each time there's a global update.
  useEffect(() => {
    const handleGlobalUpdate = () => {
      setSettings(getLocalSettings());
    };
    window.addEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
    return () => window.removeEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
  }, []);

  // Compute whether "expand/collapse all" or "show/hide all" are disabled
  const tfStates = getTextFieldButtonStates(settings.textFieldExpansions);
  const hintStates = getHintsButtonStates(settings.hintsVisibility);
  const exStates = getExamplesButtonStates(settings.examplesVisibility);

  // Actions to set all text fields/hints/examples to a particular boolean
  const setAllTextFields = (value) => {
    const updated = getLocalSettings();
    const tfObj = updated.textFieldExpansions;
    for (const k of Object.keys(tfObj)) {
      tfObj[k] = value;
    }
    // If no keys exist, do nothing? Or store an empty object? It's still consistent: no text fields known => no effect.
    // The button states will remain default next time we read them.
    saveLocalSettings(updated);
  };

  const setAllHints = (value) => {
    const updated = getLocalSettings();
    const hintsObj = updated.hintsVisibility;
    for (const k of Object.keys(hintsObj)) {
      hintsObj[k] = value;
    }
    saveLocalSettings(updated);
  };

  const setAllExamples = (value) => {
    const updated = getLocalSettings();
    const exObj = updated.examplesVisibility;
    for (const k of Object.keys(exObj)) {
      exObj[k] = value;
    }
    saveLocalSettings(updated);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Box sx={{ width: 300, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Text Fields Settings */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Text Fields
        </Typography>
        <Button
          variant="contained"
          sx={{ mb: 1, mr: 1 }}
          onClick={() => setAllTextFields(true)}
          disabled={tfStates.expandAllDisabled}
        >
          Expand all text fields
        </Button>
        <Button
          variant="contained"
          sx={{ mb: 1 }}
          onClick={() => setAllTextFields(false)}
          disabled={tfStates.collapseAllDisabled}
        >
          Collapse all text fields
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Hints Settings */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Hints
        </Typography>
        <Button
          variant="contained"
          sx={{ mb: 1, mr: 1 }}
          onClick={() => setAllHints(true)}
          disabled={hintStates.showAllDisabled}
        >
          Show all hints
        </Button>
        <Button
          variant="contained"
          sx={{ mb: 1 }}
          onClick={() => setAllHints(false)}
          disabled={hintStates.hideAllDisabled}
        >
          Hide all hints
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Examples Settings */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Examples
        </Typography>
        <Button
          variant="contained"
          sx={{ mb: 1, mr: 1 }}
          onClick={() => setAllExamples(true)}
          disabled={exStates.showAllDisabled}
        >
          Show all examples
        </Button>
        <Button
          variant="contained"
          sx={{ mb: 1 }}
          onClick={() => setAllExamples(false)}
          disabled={exStates.hideAllDisabled}
        >
          Hide all examples
        </Button>
      </Box>
    </Drawer>
  );
}
