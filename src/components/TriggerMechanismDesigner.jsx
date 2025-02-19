import React, { useState, useContext, useEffect } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import ExpandableTextField from "./ExpandableTextField";

export default function TriggerMechanismDesigner({ sectionId, subsectionId, questionId }) {
  // Use default keys if none are provided so that the trigger statement is saved/retrieved under:
  // "risk-analysis" → "hazard(s)" → "hazard(s)"
  const effectiveSectionId = sectionId || "risk-analysis";
  const effectiveSubsectionId = subsectionId || "hazard(s)";
  const effectiveQuestionId = questionId || "hazard(s)";

  const { aapData, updateField } = useContext(AAPContext);

  // Retrieve the selected hazard from the AAP summary.
  const hazardSelection = aapData?.["summary"]?.["hazard"]?.["hazard"] || "";

  // Load any saved trigger statement from aapData (persisted via localStorage).
  const [triggerOutput, setTriggerOutput] = useState(
    aapData?.[effectiveSectionId]?.[effectiveSubsectionId]?.[effectiveQuestionId] || ""
  );

  // Ensure that whenever aapData changes (e.g. on page reload), we update the trigger statement.
  useEffect(() => {
    const saved = aapData?.[effectiveSectionId]?.[effectiveSubsectionId]?.[effectiveQuestionId] || "";
    setTriggerOutput(saved);
  }, [aapData, effectiveSectionId, effectiveSubsectionId, effectiveQuestionId]);

  // State for input fields (all required).
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [input3, setInput3] = useState("");

  // Set dynamic labels based on the hazard.
  let label1 = "24‑hr Rainfall Threshold (mm)";
  let label2 = "River Gauge Level (m)";
  let label3 = "Return Period (years)";
  const hazardKey = hazardSelection.toLowerCase();

  if (hazardKey.includes("cyclone")) {
    label1 = "Sustained Wind Speed Threshold (km/h)";
    label2 = "Minimum Central Pressure (hPa)";
    label3 = "Historical Intensity (e.g. return period in years)";
  } else if (hazardKey.includes("drought")) {
    label1 = "Cumulative Rainfall Threshold (mm)";
    label2 = "Hydrological Index Threshold";
    label3 = "Historical Drought Frequency (years)";
  } else if (hazardKey.includes("flood")) {
    // Defaults for riverine flood remain.
    label1 = "24‑hr Rainfall Threshold (mm)";
    label2 = "River Gauge Level (m)";
    label3 = "Return Period (years)";
  }

  // When the hazard changes, reset the input fields.
  useEffect(() => {
    setInput1("");
    setInput2("");
    setInput3("");
  }, [hazardSelection]);

  // Ensure the generate button is enabled only when all required fields are filled.
  const isGenerateEnabled = () => {
    return input1 !== "" && input2 !== "" && input3 !== "";
  };

  const generateTrigger = () => {
    let text = "";
    if (!hazardSelection) {
      text = "Please select a hazard in the Summary to define a custom trigger.";
    } else if (hazardKey.includes("flood")) {
      text = `If a 24‑hr rainfall exceeding ${input1} mm is observed, and the river gauge reaches ${input2} m – indicative of an extreme hydrological event (with a return period of ${input3} years) – then the predefined AAP measures are triggered.`;
    } else if (hazardKey.includes("cyclone")) {
      text = `If forecasted sustained wind speeds exceed ${input1} km/h, and the minimum central pressure falls below ${input2} hPa – as supported by historical intensity data indicating a return period of ${input3} years – then the predefined AAP measures are triggered.`;
    } else if (hazardKey.includes("drought")) {
      text = `If cumulative rainfall over the designated period is below ${input1} mm, and the hydrological index remains under ${input2} – corroborated by historical drought frequency of ${input3} years – then the predefined AAP measures are triggered.`;
    } else {
      text = `Unknown hazard: ${hazardSelection}. Please review the input criteria.`;
    }
    setTriggerOutput(text);
    updateField(effectiveSectionId, effectiveSubsectionId, effectiveQuestionId, text);
  };

  const handleTriggerOutputChange = (newVal) => {
    setTriggerOutput(newVal);
    updateField(effectiveSectionId, effectiveSubsectionId, effectiveQuestionId, newVal);
  };

  return (
    <Box sx={{ border: "1px solid #ccc", p: 2, borderRadius: 1 }}>
      {hazardSelection ? (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
            Trigger statement generator for {hazardSelection.toLowerCase()}
          </Typography>
          <TextField
            label={label1}
            variant="outlined"
            fullWidth
            type="number"
            sx={{ mb: 2 }}
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
          <TextField
            label={label2}
            variant="outlined"
            fullWidth
            type="number"
            sx={{ mb: 2 }}
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
          />
          <TextField
            label={label3}
            variant="outlined"
            fullWidth
            type="number"
            sx={{ mb: 2 }}
            value={input3}
            onChange={(e) => setInput3(e.target.value)}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={generateTrigger}
            sx={{ mb: 2 }}
            disabled={!isGenerateEnabled()}
          >
            Generate trigger statement
          </Button>
        </>
      ) : (
        <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
          Hazard not selected. Please set a hazard in the Summary (step 1) to enable the generator.
        </Typography>
      )}
      <ExpandableTextField
        storageKey={`expand-${effectiveSectionId}-${effectiveSubsectionId}-${effectiveQuestionId}-trigger`}
        placeholder="Trigger statement"
        value={triggerOutput}
        onChange={(e) => handleTriggerOutputChange(e.target.value)}
        rows={4}
      />
    </Box>
  );
}
