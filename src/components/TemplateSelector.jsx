import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Chip,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Collapse,
  Fade,
  InputAdornment,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CreateIcon from "@mui/icons-material/Create";
import LanguageIcon from "@mui/icons-material/Language";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";

const availableTemplates = [
/* 
  {
    id: "wahafa1",
    name: "WHH AAP",
    description: "The original Anticipatory Action template by WHH",
    language: "english",
    url: "https://raw.githubusercontent.com/tmrk/aap-builder/refs/heads/main/src/aap-templates/aap-template_wahafa.json",
  },
  {
    id: "wahafa2",
    name: "WHH AAP 2.0",
    description: "The new and improved Anticipatory Action template by WHH (DRAFT)",
    language: "english",
    url: "https://raw.githubusercontent.com/tmrk/aap-builder/refs/heads/main/src/aap-templates/aap-template-2_wahafa.json",
  }, 
*/
  {
    id: "wahafa_2_en",
    name: "WAHAFA AAP 2.0",
    description: "The new and improved Anticipatory Action template by WHH",
    language: "english",
    url: "https://raw.githubusercontent.com/tmrk/aap-builder/refs/heads/main/src/aap-templates/aap-template_wahafa_2_en.json",
  },
  {
    id: "wahafa_2_fr",
    name: "WAHAFA AAP 2.0",
    description: "Le nouveau modèle d'action anticipée amélioré de WHH en français",
    language: "french",
    url: "https://raw.githubusercontent.com/tmrk/aap-builder/refs/heads/main/src/aap-templates/aap-template_wahafa_2_fr.json",
  }
];

export default function TemplateSelector({ onClose }) {
  const { createNewFile, store, addTemplate } = useContext(AAPContext);
  const { t, changeLanguage } = useContext(LanguageContext);
  const [loadingTemplateId, setLoadingTemplateId] = useState(null);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplateUrl, setNewTemplateUrl] = useState("");
  const [fetchStatus, setFetchStatus] = useState(null); // 'success', 'error', or null

  const handleSelectTemplate = async (template) => {
    setLoadingTemplateId(template.id);
    setFetchStatus(null);

    try {
      const resp = await fetch(template.url);
      if (!resp.ok) {
        throw new Error(`Network error: ${resp.status}`);
      }
      const jsonData = await resp.json();

      // Update the app's language using the template metadata
      if (jsonData.metadata && jsonData.metadata.language) {
        changeLanguage(jsonData.metadata.language);
      }

      const parsedTemplate = {
        id: template.id,
        name: template.name,
        metadata: { ...jsonData.metadata, url: template.url },
        template: jsonData.template,
      };

      // Store the JSON template for use in the docx exporter and full‑screen view
      localStorage.setItem("AAP_TEMPLATE", JSON.stringify(parsedTemplate));

      const exists = (store.AAP_TEMPLATES || []).some((t) => t.id === template.id);
      if (!exists) {
        addTemplate(parsedTemplate);
      }

      // === CHANGE: Pass template URL instead of ID ===
      createNewFile(
        template.url,
        parsedTemplate.metadata.shortName || parsedTemplate.name
      );
      setFetchStatus("success");

      // Close the template selector after successful creation (with a slight delay)
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (error) {
      console.error("Error fetching template:", error);
      setFetchStatus("error");
    } finally {
      setTimeout(() => {
        setLoadingTemplateId(null);
        setFetchStatus(null);
      }, 1500);
    }
  };

  const handleAddCustomTemplate = async () => {
    if (!newTemplateUrl) return;

    setLoadingTemplateId("custom");
    setFetchStatus(null);

    try {
      const resp = await fetch(newTemplateUrl);
      if (!resp.ok) {
        throw new Error(`Network error: ${resp.status}`);
      }

      const jsonData = await resp.json();

      // Basic validation to check if it's a valid template
      if (!jsonData.template) {
        throw new Error("Invalid template format");
      }

      // Create a custom template ID (used only internally for caching)
      const customId = `custom-${Date.now()}`;

      // Update the app's language using the template metadata
      if (jsonData.metadata && jsonData.metadata.language) {
        changeLanguage(jsonData.metadata.language);
      }

      const customTemplate = {
        id: customId,
        metadata: { ...jsonData.metadata, url: newTemplateUrl },
        template: jsonData.template,
      };

      // Store the JSON template for use elsewhere in the app
      localStorage.setItem("AAP_TEMPLATE", JSON.stringify(customTemplate));

      addTemplate(customTemplate);

      // === CHANGE: Pass template URL instead of generated ID ===
      createNewFile(
        newTemplateUrl,
        customTemplate.metadata.shortName || "Custom template"
      );

      setNewTemplateUrl("");
      setShowAddTemplate(false);
      setFetchStatus("success");

      // Close the template selector after successful creation (with a slight delay)
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    } catch (error) {
      console.error("Error fetching custom template:", error);
      setFetchStatus("error");
    } finally {
      setTimeout(() => {
        setLoadingTemplateId(null);
        setFetchStatus(null);
      }, 1500);
    }
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, fontWeight: "bold", textAlign: "center", flex: 1 }}
        >
          {t("dashboard.templateSelectorTitle")}
        </Typography>
      </Box>

      {/* Template Options */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          justifyItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        {availableTemplates.map((template) => (
          <Button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            variant="outlined"
            color="primary"
            disabled={loadingTemplateId !== null}
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              borderRadius: 2,
              borderWidth: 2,
              transition: "transform 0.2s, box-shadow 0.2s",
              textTransform: "none",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            {loadingTemplateId === template.id ? (
              <Box sx={{ position: "relative", display: "flex", mb: 1 }}>
                <CircularProgress size={24} color="primary" />
                {fetchStatus && (
                  <Fade in={fetchStatus !== null}>
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      {fetchStatus === "success" ? (
                        <DoneIcon color="success" />
                      ) : (
                        <ErrorOutlineIcon color="error" />
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            ) : (
              <CreateIcon sx={{ fontSize: 36, mb: 1, color: "primary.main" }} />
            )}
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              {template.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {template.description}
            </Typography>
            <Chip
              size="small"
              icon={<LanguageIcon />}
              label={t("language." + template.language)}
              sx={{ mt: 2 }}
            />
          </Button>
        ))}
      </Box>

      {/* Divider */}
      <Divider sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.or")}
        </Typography>
      </Divider>

      {/* Custom Template Section */}
      <Box sx={{ textAlign: "center" }}>
        <Collapse in={showAddTemplate}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "rgba(255,255,255,0.5)",
              p: 2,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t("dashboard.useCustomTemplate")}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setShowAddTemplate(false);
                  setNewTemplateUrl("");
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 2, pb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="https://example.com/custom-template.json"
                value={newTemplateUrl}
                onChange={(e) => setNewTemplateUrl(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {loadingTemplateId === "custom" ? null : (
                  <Button
                    variant="contained"
                    onClick={handleAddCustomTemplate}
                    disabled={!newTemplateUrl}
                  >
                    {t("dashboard.buttonFetch")}
                  </Button>
                )}
              </Box>
            </Box>
            {loadingTemplateId === "custom" && (
              <CircularProgress size={24} sx={{ alignSelf: "center", mb: 1 }} />
            )}
            {fetchStatus === "error" && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {t("dashboard.errorFetchingTemplate") || "Error fetching template."}
              </Typography>
            )}
          </Box>
        </Collapse>

        {!showAddTemplate && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowAddTemplate(true)}
          >
            {t("dashboard.useCustomTemplate")}
          </Button>
        )}
      </Box>
    </>
  );
}
