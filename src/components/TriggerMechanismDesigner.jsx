import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Collapse,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AAPContext } from "../context/AAPContext";
import ExpandableTextField from "./ExpandableTextField";
import { LanguageContext } from "../context/LanguageContext";

export default function TriggerMechanismDesigner({ sectionId, subsectionId, questionId }) {
  // Use default keys if none are provided so that the trigger statement is saved/retrieved under:
  // "risk-analysis" → "hazard(s)" → "hazard(s)"
  const effectiveSectionId = sectionId || "risk-analysis";
  const effectiveSubsectionId = subsectionId || "hazard(s)";
  const effectiveQuestionId = questionId || "hazard(s)";

  const { aapData, updateField } = useContext(AAPContext);
  const { t } = useContext(LanguageContext);

  // Retrieve the selected hazard from the AAP summary.
  const hazardSelection = aapData?.["summary"]?.["hazard"]?.["hazard"] || "";

  // Determine hazard-specific default values and placeholders.
  let defaultPhaseTitle;
  let sourcePlaceholder = "";
  let thresholdPlaceholder = "";
  let leadTimePlaceholder = "";
  let probabilityPlaceholder = "";
  if (hazardSelection.toLowerCase().includes("cyclone")) {
    defaultPhaseTitle = t("triggerDesigner.defaultPhase1") || "Minimum Operational Readiness Activities";
    sourcePlaceholder =  t("triggerDesigner.sourcePlaceholderCyclone") || "e.g. Meteorological Department";
    thresholdPlaceholder = t("triggerDesigner.thresholdPlaceholderCyclone") || "e.g. sustained wind speed (km/h)";
    leadTimePlaceholder = t("triggerDesigner.leadTimePlaceholderCyclone") || "e.g. 48 hours";
    probabilityPlaceholder = t("triggerDesigner.probabilityPlaceholderCyclone") || "e.g. high confidence";
  } else if (hazardSelection.toLowerCase().includes("drought")) {
    defaultPhaseTitle = t("triggerDesigner.defaultPhase1") || "Minimum Operational Readiness Activities";
    sourcePlaceholder =  t("triggerDesigner.sourcePlaceholderDrought") || "e.g. seasonal rainfall forecast";
    thresholdPlaceholder = t("triggerDesigner.thresholdPlaceholderDrought") || "e.g. rainfall deficit (%)";
    leadTimePlaceholder = t("triggerDesigner.leadTimePlaceholderDrought") || "e.g. 3 months";
    probabilityPlaceholder = t("triggerDesigner.probabilityPlaceholderDrought") || "e.g. moderate probability";
  } else if (hazardSelection.toLowerCase().includes("flood")) {
    defaultPhaseTitle = t("triggerDesigner.defaultPhase1") || "Minimum Operational Readiness Activities";
    sourcePlaceholder = t("triggerDesigner.sourcePlaceholderFlood") || "e.g. GloFAS";
    thresholdPlaceholder = t("triggerDesigner.thresholdPlaceholderFlood") || "e.g. river gauge level (m)";
    leadTimePlaceholder = t("triggerDesigner.leadTimePlaceholderFlood") || "e.g. 24 hours";
    probabilityPlaceholder = t("triggerDesigner.probabilityPlaceholderFlood") || "e.g. moderate confidence";
  } else {
    defaultPhaseTitle = t("triggerDesigner.defaultPhase1") || "Minimum Operational Readiness Activities";
    sourcePlaceholder= t("triggerDesigner.sourcePlaceholderDefault") || "Source of information";
    thresholdPlaceholder = t("triggerDesigner.thresholdPlaceholderDefault") || "Threshold";
    leadTimePlaceholder = t("triggerDesigner.leadTimePlaceholderDefault") || "Lead Time";
    probabilityPlaceholder = t("triggerDesigner.probabilityPlaceholderDefault") || "Probability (optional)";
  }

  // Start with one phase by default.
  const defaultPhases = [
    {
      phaseTitle: defaultPhaseTitle,
      source: "",
      threshold: "",
      leadTime: "",
      probability: "",
    },
  ];

  // Read trigger phases from AAPContext using key composed of effectiveSubsectionId and "-phases"
  const storedPhases = aapData?.[effectiveSectionId]?.[`${effectiveSubsectionId}-phases`];
  const initialPhases = Array.isArray(storedPhases) ? storedPhases : defaultPhases;
  const [phases, setPhases] = useState(initialPhases);

  // Whenever phases change, update the AAPContext field for trigger phases.
  useEffect(() => {
    updateField(effectiveSectionId, `${effectiveSubsectionId}-phases`, "phases", phases);
  }, [phases, effectiveSectionId, effectiveSubsectionId, updateField]);

  // Combined output text state, loaded initially from AAP data.
  const initialCombined =
    aapData?.[effectiveSectionId]?.[effectiveSubsectionId]?.[effectiveQuestionId] || "";
  const [combinedTrigger, setCombinedTrigger] = useState(initialCombined);

  // When hazard changes, reset phases to default.
  useEffect(() => {
    setPhases([
      {
        phaseTitle: defaultPhaseTitle,
        source: "",
        threshold: "",
        leadTime: "",
        probability: "",
      },
    ]);
  }, [hazardSelection, defaultPhaseTitle]);

  // Whenever the combined trigger text changes, update the AAP data.
  useEffect(() => {
    updateField(effectiveSectionId, effectiveSubsectionId, effectiveQuestionId, combinedTrigger);
  }, [combinedTrigger, effectiveSectionId, effectiveSubsectionId, effectiveQuestionId, updateField]);

  // Toggle visibility: if the combined trigger already has content, start collapsed.
  const [generatorVisible, setGeneratorVisible] = useState(() => {
    return combinedTrigger.trim() === "" ? true : false;
  });

  // Validation: all added phases must have the required fields filled.
  const allFieldsFilled = phases.every(
    (phase) =>
      phase.phaseTitle.trim() !== "" &&
      phase.source.trim() !== "" &&
      phase.threshold.trim() !== "" &&
      phase.leadTime.trim() !== ""
  );

  // Generate the combined trigger statement for all phases.
  const generateCombinedTrigger = () => {
    const generated = phases
      .map((phase, index) => {
        let statement = `When the ${phase.source} forecasts ${phase.threshold} at ${phase.leadTime}`;
        if (phase.probability.trim() !== "") {
          statement += ` and with a ${phase.probability}`;
        }
        statement += ", actions will be taken.";
        return `Phase ${index + 1} (${phase.phaseTitle}):\n${statement}`;
      })
      .join("\n\n");
    setCombinedTrigger(generated);
  };

  // Update a field in a given phase.
  const handleFieldChange = (index, field, value) => {
    setPhases((prev) => {
      const newPhases = [...prev];
      newPhases[index] = { ...newPhases[index], [field]: value };
      return newPhases;
    });
  };

  // Add a phase (up to three phases).
  const addPhase = () => {
    if (phases.length >= 3) return;
    let defaultPhase;
    if (phases.length === 1) {
      defaultPhase = {
        phaseTitle: t("triggerDesigner.defaultPhase2") || "Advanced Operational Readiness Activities",
        source: "",
        threshold: "",
        leadTime: "",
        probability: "",
      };
    } else if (phases.length === 2) {
      defaultPhase = {
        phaseTitle: t("triggerDesigner.defaultPhase3") || "Triggering of Anticipatory Actions",
        source: "",
        threshold: "",
        leadTime: "",
        probability: "",
      };
    }
    setPhases((prev) => [...prev, defaultPhase]);
  };

  // Remove a phase.
  const removePhase = (index) => {
    setPhases((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Box sx={{ border: "1px solid #ccc", p: 2, borderRadius: 1 }}>
      {hazardSelection ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", flex: 1 }}>
              {t("triggerDesigner.header", { hazard: hazardSelection })}
            </Typography>
            <Button
              variant="text"
              onClick={() => setGeneratorVisible(!generatorVisible)}
              sx={{ mb: 2 }}
            >
              {generatorVisible ? t("triggerDesigner.hideGenerator") : t("triggerDesigner.showGenerator")}
            </Button>
          </Box>
          <Collapse in={generatorVisible}>
            {phases.map((phase, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ flex: 1, textAlign: "center" }}>
                    {t("triggerDesigner.phase")} {index + 1}
                  </Typography>
                  {phases.length > 1 && (
                    <IconButton onClick={() => removePhase(index)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <TextField
                  label={t("triggerDesigner.phaseTitle")}
                  variant="outlined"
                  fullWidth
                  value={phase.phaseTitle}
                  onChange={(e) => handleFieldChange(index, "phaseTitle", e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    label={t("triggerDesigner.source")}
                    variant="outlined"
                    placeholder={sourcePlaceholder}
                    value={phase.source}
                    onChange={(e) => handleFieldChange(index, "source", e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={t("triggerDesigner.threshold")}
                    variant="outlined"
                    placeholder={thresholdPlaceholder}
                    value={phase.threshold}
                    onChange={(e) => handleFieldChange(index, "threshold", e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    label={t("triggerDesigner.leadTime")}
                    variant="outlined"
                    placeholder={leadTimePlaceholder}
                    value={phase.leadTime}
                    onChange={(e) => handleFieldChange(index, "leadTime", e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={t("triggerDesigner.probability")}
                    variant="outlined"
                    placeholder={probabilityPlaceholder}
                    value={phase.probability}
                    onChange={(e) => handleFieldChange(index, "probability", e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            ))}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              {phases.length < 3 && (
                <Button variant="outlined" onClick={addPhase}>
                  {t("triggerDesigner.addPhase")}
                </Button>
              )}
              <Button
                variant="contained"
                onClick={generateCombinedTrigger}
                disabled={!allFieldsFilled}
                sx={{ flexGrow: 1 }}
              >
                {t("triggerDesigner.generate")}
              </Button>
            </Box>
          </Collapse>
        </>
      ) : (
        <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
          {t("triggerDesigner.hazardNotSelected")}
        </Typography>
      )}
      {/* Always show the combined trigger text field */}
      <ExpandableTextField
        storageKey={`trigger-${effectiveSectionId}-${effectiveSubsectionId}-${effectiveQuestionId}`}
        placeholder={t("triggerDesigner.generatedTrigger")}
        value={combinedTrigger}
        onChange={(e) => setCombinedTrigger(e.target.value)}
        rows={6}
      />
    </Box>
  );
}
