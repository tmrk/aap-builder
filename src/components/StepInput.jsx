import React, { useContext } from "react";
import { Box, Typography, TextField, Collapse, Button } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";
import TriggerMechanismDesigner from "./TriggerMechanismDesigner";
import ExpandableTextField from "./ExpandableTextField";
import { useGlobalVisibility } from "../utils/useGlobalVisibility";
import DOMPurify from "dompurify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const StepInput = ({ step }) => {
  const { currentFile, updateField } = useContext(AAPContext);
  const { t, language, dateFnsLocale } = useContext(LanguageContext);
  const aapData = currentFile ? currentFile.AAP_BUILDER_DATA : {};
  const rawValue = aapData?.[step.id]?.[step.id]?.[step.id] || "";
  const value = Array.isArray(rawValue) ? rawValue.join(", ") : String(rawValue);
  const characterLimit = step.characterLimit || 0;
  const exceedLimit = characterLimit > 0 && value.length > characterLimit;
  const type = (step.type || "").toLowerCase();

  const [hintOpen, toggleHint, alwaysDisplayHints] = useGlobalVisibility(true, step.id, step.id, null);
  const [exampleOpen, toggleExample, alwaysDisplayExamples] = useGlobalVisibility(false, step.id, step.id, null);

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
  } else if (type === "datepicker") {
    inputElem = (
      <DatePicker
        locale={dateFnsLocale}
        value={value ? new Date(value) : null}
        onChange={(newValue) =>
          updateField(step.id, step.id, step.id, newValue ? newValue.toISOString() : "")
        }
        format="yyyy-MM-dd"
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            variant: "outlined",
            placeholder: step.placeholder,
            fullWidth: true
          }
        }}
      />
    );
  } else if (type === "text") {
    inputElem = (
      <TextField
        placeholder={step.placeholder}
        fullWidth
        value={value}
        onChange={(e) => updateField(step.id, step.id, step.id, e.target.value)}
        inputProps={{
          lang: language,
          spellCheck: "true",
        }}
      />
    );
  }

  if (!inputElem) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      {(step.required && step.type) && (
        <span style={{ color: "red", marginRight: 4 }}>*</span>
      )}
      {(step.hint || step.example) && (
        <Box sx={{ display: "inline-flex", alignItems: "center", mb: 1 }}>
          {step.hint && !alwaysDisplayHints && (
            <Button variant="text" size="small" sx={{ mr: 1 }} onClick={toggleHint}>
              {hintOpen ? t("button.hideHint") : t("button.hint")}
            </Button>
          )}
          {step.example && !alwaysDisplayExamples && (
            <Button variant="text" size="small" onClick={toggleExample}>
              {exampleOpen ? t("button.hideExample") : t("button.example")}
            </Button>
          )}
        </Box>
      )}

      {step.hint && (
        <Collapse in={hintOpen} sx={{ mb: hintOpen ? 1 : 0 }}>
          <Box sx={{ px: 0.5, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <b>{t("sectionContent.explanatoryNote")}: </b>
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(step.hint) }} />
            </Typography>
          </Box>
        </Collapse>
      )}

      {step.example && (
        <Collapse in={exampleOpen} sx={{ mb: exampleOpen ? 1 : 0 }}>
          <Box sx={{ p: 1, border: "1px dashed #aaa", borderRadius: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              <b>{t("sectionContent.exampleText")}: </b>
              <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(step.example) }} />
            </Typography>
          </Box>
        </Collapse>
      )}

      {inputElem}

      {characterLimit > 0 && type !== "textarea" && (
        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            textAlign: "right",
            color: exceedLimit ? "red" : "text.secondary"
          }}
        >
          {value.length} / {characterLimit}
        </Typography>
      )}
    </Box>
  );
};

export default StepInput;
