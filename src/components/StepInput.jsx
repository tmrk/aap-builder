import React, { useContext } from "react";
import { Box, Typography, TextField, Collapse, Button } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";
import TriggerMechanismDesigner from "./TriggerMechanismDesigner";
import ExpandableTextField from "./ExpandableTextField";

const StepInput = ({ step }) => {
  const { aapData, updateField } = useContext(AAPContext);
  const { t } = useContext(LanguageContext);
  const storedValue = aapData?.[step.id]?.[step.id]?.[step.id] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);
  const characterLimit = step.characterLimit || 0;
  const exceedLimit = characterLimit > 0 && value.length > characterLimit;
  const type = (step.type || "").toLowerCase();

  let inputElem = null;
  if (type === "triggerdesigner") {
    inputElem = (
      <TriggerMechanismDesigner
        sectionId={step.id}
        subsectionId={step.id}
        questionId={step.id}
      />
    );
  } else if (type === "textarea") {
    inputElem = (
      <ExpandableTextField
        storageKey={`expand-${step.id}-${step.id}-${step.id}`}
        placeholder={step.placeholder}
        value={value}
        onChange={(e) => updateField(step.id, step.id, step.id, e.target.value)}
        rows={4}
        characterLimit={step.characterLimit || 0}
      />
    );
  } else if (type === "text") {
    inputElem = (
      <TextField
        placeholder={step.placeholder}
        fullWidth
        value={value}
        onChange={(e) => updateField(step.id, step.id, step.id, e.target.value)}
      />
    );
  }

  if (!inputElem) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {(step.hint || step.example) && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {step.hint && (
            <Button variant="text" size="small" sx={{ mr: 1 }}>
              {t("button.hint")}
            </Button>
          )}
          {step.example && (
            <Button variant="text" size="small">
              {t("button.example")}
            </Button>
          )}
        </Box>
      )}
      {step.hint && (
        <Collapse in={true} sx={{ mb: 1 }}>
          <Box sx={{ px: 0.5, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <b>{t("sectionContent.explanatoryNote")}: </b>
              {step.hint}
            </Typography>
          </Box>
        </Collapse>
      )}
      {step.example && (
        <Collapse in={true} sx={{ mb: 1 }}>
          <Box sx={{ p: 1, border: "1px dashed #aaa", borderRadius: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              <b>{t("sectionContent.exampleText")}: </b>
              {step.example}
            </Typography>
          </Box>
        </Collapse>
      )}
      {inputElem}
      {characterLimit > 0 && type !== "textarea" && (
        <Typography variant="body2" sx={{ mt: 0.5, textAlign: "right", color: exceedLimit ? "red" : "text.secondary" }}>
          {value.length} / {characterLimit}
        </Typography>
      )}
    </Box>
  );
};

export default StepInput;
