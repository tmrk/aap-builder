import React, { useEffect, useState, useContext } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LanguageContext } from "../context/LanguageContext";

/**
 * Global settings are stored in localStorage["AAP_BUILDER_SETTINGS"].
 * The shape is:
 * {
 *   textFieldExpansions: { [storageKey: string]: boolean },
 *   alwaysExpandTextFields: boolean,
 *   hintsVisibility: { [hintKey: string]: boolean },
 *   alwaysDisplayAllHints: boolean,
 *   examplesVisibility: { [exampleKey: string]: boolean },
 *   alwaysDisplayAllExamples: boolean
 * }
 * Missing keys default to false (or an empty object).
 */

const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";

function getLocalSettings() {
  try {
    const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    if (!parsed.textFieldExpansions) parsed.textFieldExpansions = {};
    if (!("alwaysExpandTextFields" in parsed))
      parsed.alwaysExpandTextFields = false;
    if (!parsed.hintsVisibility) parsed.hintsVisibility = {};
    if (!("alwaysDisplayAllHints" in parsed))
      parsed.alwaysDisplayAllHints = false;
    if (!parsed.examplesVisibility) parsed.examplesVisibility = {};
    if (!("alwaysDisplayAllExamples" in parsed))
      parsed.alwaysDisplayAllExamples = false;
    return parsed;
  } catch {
    return {
      textFieldExpansions: {},
      alwaysExpandTextFields: false,
      hintsVisibility: {},
      alwaysDisplayAllHints: false,
      examplesVisibility: {},
      alwaysDisplayAllExamples: false,
    };
  }
}

function saveLocalSettings(data) {
  localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("AAP_SETTINGS_UPDATED"));
}

export default function SettingsDrawer({ open, onClose }) {
  const [settings, setSettings] = useState(() => getLocalSettings());
  const { language, changeLanguage, t, availableLanguages, getNativeLanguageName } = useContext(LanguageContext);

  useEffect(() => {
    const handleGlobalUpdate = () => {
      setSettings(getLocalSettings());
    };
    window.addEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
    return () =>
      window.removeEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
  }, []);

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
          <Typography variant="h6">{t("settings.title")}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* TEXT FIELDS */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("settings.textFields")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.alwaysExpandTextFields}
              onChange={(e) => {
                const newVal = e.target.checked;
                const updated = { ...settings, alwaysExpandTextFields: newVal };
                setSettings(updated);
                saveLocalSettings(updated);
              }}
            />
          }
          label={t("settings.alwaysExpandAllTextFields")}
        />

        <Divider sx={{ my: 2 }} />

        {/* HINTS */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("settings.hints")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.alwaysDisplayAllHints}
              onChange={(e) => {
                const newVal = e.target.checked;
                const updated = { ...settings, alwaysDisplayAllHints: newVal };
                setSettings(updated);
                saveLocalSettings(updated);
              }}
            />
          }
          label={t("settings.alwaysDisplayAllHints")}
        />

        <Divider sx={{ my: 2 }} />

        {/* EXAMPLES */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("settings.examples")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.alwaysDisplayAllExamples}
              onChange={(e) => {
                const newVal = e.target.checked;
                const updated = { ...settings, alwaysDisplayAllExamples: newVal };
                setSettings(updated);
                saveLocalSettings(updated);
              }}
            />
          }
          label={t("settings.alwaysDisplayAllExamples")}
        />

        <Divider sx={{ my: 2 }} />

        {/* Language Selector */}
        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel>{t("settings.language")}</InputLabel>
          <Select
            value={language}
            label={t("settings.language")}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            {availableLanguages.map((langCode) => (
              <MenuItem key={langCode} value={langCode}>
                {getNativeLanguageName(langCode)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Drawer>
  );
}
