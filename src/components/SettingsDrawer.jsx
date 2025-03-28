// SettingsDrawer.jsx
import React, { useContext } from "react";
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
import { AAPContext } from "../context/AAPContext";

export default function SettingsDrawer({ open, onClose }) {
  const { language, changeLanguage, t, availableLanguages, getNativeLanguageName } = useContext(LanguageContext);
  const { currentFile, updateFileSettings } = useContext(AAPContext);
  
  const settings = currentFile
    ? currentFile.AAP_BUILDER_SETTINGS
    : {
        textFieldExpansions: {},
        alwaysExpandTextFields: false,
        hintsVisibility: {},
        alwaysDisplayAllHints: false,
        examplesVisibility: {},
        alwaysDisplayAllExamples: false,
      };

  const handleSettingChange = (key, value) => {
    if (!currentFile) return;
    updateFileSettings({
      ...settings,
      [key]: value,
    });
  };

  const disabled = !currentFile;

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

        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel>{t("settings.language")}</InputLabel>
          <Select
            value={language}
            label={t("settings.language")}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            {availableLanguages
              .slice()
              .sort((a, b) => {
                const nameA = getNativeLanguageName(a).toUpperCase();
                const nameB = getNativeLanguageName(b).toUpperCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
              })
              .map((langCode) => (
                <MenuItem key={langCode} value={langCode}>
                  {getNativeLanguageName(langCode)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("settings.textFields")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.alwaysExpandTextFields}
              onChange={(e) => handleSettingChange("alwaysExpandTextFields", e.target.checked)}
              disabled={disabled}
            />
          }
          label={t("settings.alwaysExpandAllTextFields")}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("settings.hints")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.alwaysDisplayAllHints}
              onChange={(e) => handleSettingChange("alwaysDisplayAllHints", e.target.checked)}
              disabled={disabled}
            />
          }
          label={t("settings.alwaysDisplayAllHints")}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t("settings.examples")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={settings.alwaysDisplayAllExamples}
              onChange={(e) => handleSettingChange("alwaysDisplayAllExamples", e.target.checked)}
              disabled={disabled}
            />
          }
          label={t("settings.alwaysDisplayAllExamples")}
        />

      </Box>
    </Drawer>
  );
}
