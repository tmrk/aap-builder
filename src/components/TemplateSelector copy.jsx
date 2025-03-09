import React, { useState, useContext } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";

const availableTemplates = [
  {
    id: "template1",
    name: "WHH AAP 1.0",
    description: "The original Anticipatory Action template by WHH",
    url: "https://gist.githubusercontent.com/tmrk/b10c99520e27a59f196f5980d9ba72e9/raw/AAP-template.json"
  },
  {
    id: "template2",
    name: "WHH AAP 2.0",
    description: "The improved and simplified Anticipatory Action template by WHH",
    url: "https://gist.githubusercontent.com/tmrk/b10c99520e27a59f196f5980d9ba72e9/raw/AAP-template.json"
  },
];

export default function TemplateSelector({ onClose }) {
  const { createNewFile, store, addTemplate } = useContext(AAPContext);
  const { t, changeLanguage } = useContext(LanguageContext);
  const [loadingTemplateId, setLoadingTemplateId] = useState(null);

  const handleSelectTemplate = async (template) => {
    setLoadingTemplateId(template.id);
    try {
      const resp = await fetch(template.url);
      if (!resp.ok) {
        throw new Error(`Network error: ${resp.status}`);
      }
      const jsonData = await resp.json();
      // Update the app's language using the template metadata.
      if (jsonData.metadata && jsonData.metadata.language) {
        changeLanguage(jsonData.metadata.language);
      }
      const parsedTemplate = {
        id: template.id,
        metadata: { ...jsonData.metadata, url: template.url },
        template: jsonData.template,
      };

      // Store the JSON template for use in the docx exporter.
      localStorage.setItem("AAP_TEMPLATE", JSON.stringify(parsedTemplate));

      let updatedTemplates = store.AAP_TEMPLATES || [];
      const exists = updatedTemplates.find((t) => t.id === template.id);
      if (!exists) {
        addTemplate(parsedTemplate);
      }

      createNewFile(template.id);
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoadingTemplateId(null);
      if (onClose) onClose();
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      {availableTemplates.map((template) => (
        <Button
          key={template.id}
          onClick={() => handleSelectTemplate(template)}
          fullWidth
          variant="outlined"
          sx={{
            py: 3,
            flexDirection: "column",
            justifyContent: "center",
            textTransform: "none",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ display: "flex", fontWeight: "bold", alignItems: "center" }}>
            {template.name}
          </Typography>
          <Typography variant="subtitle">
            {template.description}
          </Typography>
        </Button>
      ))}
    </Stack>
  );
}
