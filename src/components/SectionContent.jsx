import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Collapse,
  Button,
} from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AAPContext } from "../context/AAPContext";
import useCountries from "../utils/useCountries";
import TriggerMechanismDesigner from "./TriggerMechanismDesigner";
import ExpandableTextField from "./ExpandableTextField";
import CycloneIconUrl from "../assets/Icon_Tropical_Cyclone.svg";
import DroughtIconUrl from "../assets/Icon_Drought.svg";
import FloodIconUrl from "../assets/Icon_Flood.svg";
import HeatwaveIconUrl from "../assets/Icon_Heatwave.svg";
import DiseaseIconUrl from "../assets/Icon_Disease.svg";

const GLOBAL_SETTINGS_KEY = "AAP_BUILDER_SETTINGS";

function getLocalSettings() {
  try {
    const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    if (!parsed.hintsVisibility) parsed.hintsVisibility = {};
    if (!parsed.examplesVisibility) parsed.examplesVisibility = {};
    return parsed;
  } catch {
    return { hintsVisibility: {}, examplesVisibility: {} };
  }
}

function saveLocalSettings(data) {
  localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("AAP_SETTINGS_UPDATED"));
}

function getHintKey(stepId, subsectionId, subsubId) {
  return subsubId
    ? `hint-${stepId}-${subsectionId}-${subsubId}`
    : `hint-${stepId}-${subsectionId}`;
}
function getExampleKey(stepId, subsectionId, subsubId) {
  return subsubId
    ? `example-${stepId}-${subsectionId}-${subsubId}`
    : `example-${stepId}-${subsectionId}`;
}

function useGlobalVisibility(isHint, stepId, subsectionId, subsubId) {
  const storageKey = isHint
    ? getHintKey(stepId, subsectionId, subsubId)
    : getExampleKey(stepId, subsectionId, subsubId);
  const [localVisible, setLocalVisible] = useState(() => {
    const s = getLocalSettings();
    return isHint ? !!s.hintsVisibility[storageKey] : !!s.examplesVisibility[storageKey];
  });
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return parsed;
    } catch {
      return {};
    }
  });
  
  const globalFlag = isHint
    ? globalSettings.alwaysDisplayAllHints
    : globalSettings.alwaysDisplayAllExamples;
  
  const effectiveVisible = globalFlag ? true : localVisible;

  const toggle = () => {
    setLocalVisible((prev) => !prev);
    const s = getLocalSettings();
    if (isHint) {
      s.hintsVisibility[storageKey] = !localVisible;
    } else {
      s.examplesVisibility[storageKey] = !localVisible;
    }
    saveLocalSettings(s);
  };

  useEffect(() => {
    function handleGlobalUpdate() {
      const s = getLocalSettings();
      const newLocal = isHint
        ? !!s.hintsVisibility[storageKey]
        : !!s.examplesVisibility[storageKey];
      setLocalVisible(newLocal);
      try {
        const stored = localStorage.getItem(GLOBAL_SETTINGS_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        setGlobalSettings(parsed);
      } catch {
        setGlobalSettings({});
      }
    }
    window.addEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
    return () =>
      window.removeEventListener("AAP_SETTINGS_UPDATED", handleGlobalUpdate);
  }, [isHint, storageKey]);

  return [effectiveVisible, toggle, globalFlag];
}

// --------------------------------------------------------------------------------------
// SUB-SUBSECTION
// --------------------------------------------------------------------------------------
function SubSubsectionInput({ stepId, parentSubsectionId, subsubsection }) {
  const { aapData, updateField } = useContext(AAPContext);
  const subsubId = subsubsection.id;

  const storedValue = aapData?.[stepId]?.[parentSubsectionId]?.[subsubId] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);
  const requiredStar = subsubsection.required ? (
    <span style={{ color: "red", marginLeft: 4 }}>*</span>
  ) : null;
  const characterLimit = subsubsection.characterLimit || 0;
  const exceedLimit =
    characterLimit > 0 && value.length > characterLimit;
  const type = (subsubsection.type || "").toLowerCase();

  const [hintOpen, toggleHint, globalHint] = useGlobalVisibility(
    true,
    stepId,
    parentSubsectionId,
    subsubId
  );
  const [exampleOpen, toggleExample, globalExample] = useGlobalVisibility(
    false,
    stepId,
    parentSubsectionId,
    subsubId
  );

  let inputElem = null;
  if (type === "dropdown") {
    const opts = Array.isArray(subsubsection.options)
      ? subsubsection.options
      : [];
    inputElem = (
      <Autocomplete
        options={opts}
        value={value || ""}
        onChange={(e, newVal) =>
          updateField(stepId, parentSubsectionId, subsubId, newVal || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={subsubsection.placeholder}
          />
        )}
      />
    );
  } else if (type === "radio") {
    const opts = Array.isArray(subsubsection.options)
      ? subsubsection.options
      : [];
    inputElem = (
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={value}
          onChange={(e) =>
            updateField(stepId, parentSubsectionId, subsubId, e.target.value)
          }
        >
          {opts.map((opt) => (
            <FormControlLabel
              key={opt}
              value={opt}
              control={<Radio />}
              label={opt}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  } else if (type === "checkbox") {
    const opts = Array.isArray(subsubsection.options)
      ? subsubsection.options
      : [];
    const arrVal = Array.isArray(value) ? value : [];
    const handleCheck = (opt) => {
      if (arrVal.includes(opt)) {
        updateField(
          stepId,
          parentSubsectionId,
          subsubId,
          arrVal.filter((x) => x !== opt)
        );
      } else {
        updateField(stepId, parentSubsectionId, subsubId, [...arrVal, opt]);
      }
    };
    inputElem = (
      <Box>
        <FormLabel>{subsubsection.title}</FormLabel>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {opts.map((opt) => (
            <FormControlLabel
              key={opt}
              control={
                <Checkbox
                  checked={arrVal.includes(opt)}
                  onChange={() => handleCheck(opt)}
                />
              }
              label={opt}
            />
          ))}
        </Box>
      </Box>
    );
  } else if (type === "textarea") {
    inputElem = (
      <ExpandableTextField
        storageKey={`expand-${stepId}-${parentSubsectionId}-${subsubId}`}
        placeholder={subsubsection.placeholder}
        value={value}
        onChange={(e) =>
          updateField(stepId, parentSubsectionId, subsubId, e.target.value)
        }
        rows={4}
        characterLimit={subsubsection.characterLimit || 0}
      />
    );
  } else if (type === "text") {
    inputElem = (
      <TextField
        placeholder={subsubsection.placeholder}
        fullWidth
        value={value}
        onChange={(e) =>
          updateField(stepId, parentSubsectionId, subsubId, e.target.value)
        }
      />
    );
  } else if (type === "triggerdesigner") {
    inputElem = (
      <TriggerMechanismDesigner
        sectionId={stepId}
        subsectionId={parentSubsectionId}
        questionId={subsubId}
      />
    );
  }

  if (
    !inputElem &&
    (!subsubsection.subsubsections ||
      subsubsection.subsubsections.length === 0)
  ) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {subsubsection.title}
          {requiredStar}
        </Typography>
        {subsubsection.hint && !globalHint && (
          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={toggleHint}>
            Hint
          </Button>
        )}
        {subsubsection.example && !globalExample && (
          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={toggleExample}>
            Example
          </Button>
        )}
      </Box>
      {subsubsection.hint && (
        <Collapse in={hintOpen} sx={{ mb: hintOpen ? 1 : 0 }}>
          <Box sx={{ px: 0.5, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {subsubsection.hint}
            </Typography>
          </Box>
        </Collapse>
      )}
      {subsubsection.example && (
        <Collapse in={exampleOpen} sx={{ mb: exampleOpen ? 1 : 0 }}>
          <Box sx={{ p: 1, border: "1px dashed #aaa", borderRadius: 1, mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontStyle: "italic" }}
            >
              {subsubsection.example}
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
            color: exceedLimit ? "red" : "text.secondary",
          }}
        >
          {value.length} / {characterLimit}
        </Typography>
      )}
    </Box>
  );
}

// --------------------------------------------------------------------------------------
// SUBSECTION
// --------------------------------------------------------------------------------------
function SubsectionInput({ stepId, subsection }) {
  const { aapData, updateField } = useContext(AAPContext);
  const subsectionId = subsection.id;
  const questionId = subsectionId;
  const storedValue = aapData?.[stepId]?.[subsectionId]?.[questionId] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);

  const requiredStar = subsection.required ? (
    <span style={{ color: "red", marginLeft: 4 }}>*</span>
  ) : null;
  const characterLimit = subsection.characterLimit || 0;
  const exceedLimit =
    characterLimit > 0 && value.length > characterLimit;
  const type = (subsection.type || "").toLowerCase();

  const [hintOpen, toggleHint, globalHint] = useGlobalVisibility(
    true,
    stepId,
    subsectionId,
    null
  );
  const [exampleOpen, toggleExample, globalExample] = useGlobalVisibility(
    false,
    stepId,
    subsectionId,
    null
  );

  let inputElem = null;
  if (type === "radio" && subsectionId === "hazard") {
    const opts = Array.isArray(subsection.options) ? subsection.options : [];
    inputElem = (
      <ToggleButtonGroup
        value={value || null}
        exclusive
        onChange={(event, newValue) => {
          if (newValue === null) {
            updateField(stepId, subsectionId, questionId, "");
          } else {
            updateField(stepId, subsectionId, questionId, newValue);
          }
        }}
        sx={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {opts.map((opt) => (
          <ToggleButton
            key={opt}
            value={opt}
            sx={{
              fontSize: "1rem",
              padding: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              flex: 1,
              "&.Mui-selected, &.Mui-selected:hover, &:active": {
                backgroundColor: "primary.light",
                borderLeft: "1px solid rgba(0, 0, 0, 0.1)",
                "& img": { filter: "none" },
              },
              "& img": { filter: "grayscale(100%)" },
            }}
          >
            <img
              src={
                opt.toLowerCase().includes("cyclone")
                  ? CycloneIconUrl
                  : opt.toLowerCase().includes("drought")
                  ? DroughtIconUrl
                  : opt.toLowerCase().includes("flood")
                  ? FloodIconUrl
                  : opt.toLowerCase().includes("heat")
                  ? HeatwaveIconUrl
                  : opt.toLowerCase().includes("disease")
                  ? DiseaseIconUrl
                  : ""
              }
              alt={opt}
              style={{ width: 64, height: 64 }}
            />
            <Typography sx={{ fontWeight: "bold", textTransform: "none" }}>
              {opt}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  } else if (type === "radio") {
    const opts = Array.isArray(subsection.options) ? subsection.options : [];
    inputElem = (
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={value}
          onChange={(e) =>
            updateField(stepId, subsectionId, questionId, e.target.value)
          }
        >
          {opts.map((opt) => (
            <FormControlLabel
              key={opt}
              value={opt}
              control={<Radio />}
              label={opt}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  } else if (type === "dropdown") {
    if (subsectionId === "country") {
      const countries = useCountries();
      inputElem = (
        <Autocomplete
          options={Array.isArray(countries) ? countries : []}
          value={value || ""}
          onChange={(e, newVal) => {
            updateField(stepId, subsectionId, questionId, newVal || "");
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" placeholder={subsection.placeholder} />
          )}
        />
      );
    } else {
      const opts = Array.isArray(subsection.options) ? subsection.options : [];
      inputElem = (
        <Autocomplete
          options={opts}
          value={value || ""}
          onChange={(e, newVal) => {
            updateField(stepId, subsectionId, questionId, newVal || "");
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" placeholder={subsection.placeholder} />
          )}
        />
      );
    }
  } else if (type === "checkbox") {
    const opts = Array.isArray(subsection.options) ? subsection.options : [];
    const arrVal = Array.isArray(value) ? value : [];
    const handleCheck = (opt) => {
      if (arrVal.includes(opt)) {
        updateField(
          stepId,
          subsectionId,
          questionId,
          arrVal.filter((x) => x !== opt)
        );
      } else {
        updateField(stepId, subsectionId, questionId, [...arrVal, opt]);
      }
    };
    inputElem = (
      <Box>
        <FormLabel>{subsection.title}</FormLabel>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {opts.map((opt) => (
            <FormControlLabel
              key={opt}
              control={
                <Checkbox
                  checked={arrVal.includes(opt)}
                  onChange={() => handleCheck(opt)}
                />
              }
              label={opt}
            />
          ))}
        </Box>
      </Box>
    );
  } else if (type === "triggerdesigner") {
    inputElem = (
      <TriggerMechanismDesigner
        sectionId={stepId}
        subsectionId={subsectionId}
        questionId={questionId}
      />
    );
  } else if (type === "textarea") {
    inputElem = (
      <ExpandableTextField
        storageKey={`expand-${stepId}-${subsectionId}-${questionId}`}
        placeholder={subsection.placeholder}
        value={value}
        onChange={(e) =>
          updateField(stepId, subsectionId, questionId, e.target.value)
        }
        rows={4}
        characterLimit={subsection.characterLimit || 0}
      />
    );
  } else if (type === "text") {
    inputElem = (
      <TextField
        placeholder={subsection.placeholder}
        fullWidth
        value={value}
        onChange={(e) =>
          updateField(stepId, subsectionId, questionId, e.target.value)
        }
      />
    );
  }

  if (
    !inputElem &&
    (!subsection.subsubsections || subsection.subsubsections.length === 0)
  ) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {subsection.title}
          {requiredStar}
        </Typography>
        {subsection.hint && !globalHint && (
          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={toggleHint}>
            Hint
          </Button>
        )}
        {subsection.example && !globalExample && (
          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={toggleExample}>
            Example
          </Button>
        )}
      </Box>
      {subsection.hint && (
        <Collapse in={hintOpen} sx={{ mb: hintOpen ? 1 : 0 }}>
          <Box sx={{ px: 0.5, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {subsection.hint}
            </Typography>
          </Box>
        </Collapse>
      )}
      {subsection.example && (
        <Collapse in={exampleOpen} sx={{ mb: exampleOpen ? 1 : 0 }}>
          <Box sx={{ p: 1, border: "1px dashed #aaa", borderRadius: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              {subsection.example}
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
            color: exceedLimit ? "red" : "text.secondary",
          }}
        >
          {value.length} / {characterLimit}
        </Typography>
      )}
      {subsection.subsubsections && subsection.subsubsections.length > 0 && (
        <Box sx={{ ml: 3, borderLeft: "2px solid #eee", pl: 2, mt: 2 }}>
          {subsection.subsubsections.map((subsub) => (
            <SubSubsectionInput
              key={subsub.id}
              stepId={stepId}
              parentSubsectionId={subsectionId}
              subsubsection={subsub}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

// --------------------------------------------------------------------------------------
// STEP (for if a step has type but no subsections)
// --------------------------------------------------------------------------------------
function StepInput({ step }) {
  const { aapData, updateField } = useContext(AAPContext);
  const storedValue = aapData?.[step.id]?.[step.id]?.[step.id] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);
  const characterLimit = step.characterLimit || 0;
  const exceedLimit = characterLimit > 0 && value.length > characterLimit;
  const type = (step.type || "").toLowerCase();

  const [hintOpen, toggleHint, globalHint] = useGlobalVisibility(
    true,
    step.id,
    step.id,
    null
  );
  const [exampleOpen, toggleExample, globalExample] = useGlobalVisibility(
    false,
    step.id,
    step.id,
    null
  );

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
          {step.hint && !globalHint && (
            <Button variant="text" size="small" sx={{ mr: 1 }} onClick={toggleHint}>
              Hint
            </Button>
          )}
          {step.example && !globalExample && (
            <Button variant="text" size="small" onClick={toggleExample}>
              Example
            </Button>
          )}
        </Box>
      )}
      {step.hint && (
        <Collapse in={hintOpen} sx={{ mb: hintOpen ? 1 : 0 }}>
          <Box sx={{ px: 0.5, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {step.hint}
            </Typography>
          </Box>
        </Collapse>
      )}
      {step.example && (
        <Collapse in={exampleOpen} sx={{ mb: exampleOpen ? 1 : 0 }}>
          <Box sx={{ p: 1, border: "1px dashed #aaa", borderRadius: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
              {step.example}
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
            color: exceedLimit ? "red" : "text.secondary",
          }}
        >
          {value.length} / {characterLimit}
        </Typography>
      )}
    </Box>
  );
}

// --------------------------------------------------------------------------------------
// MAIN EXPORT
// --------------------------------------------------------------------------------------
export default function SectionContent({ step }) {
  const { subsections } = step;

  if ((!subsections || subsections.length === 0) && step.type) {
    return (
      <Box sx={{ mt: 2 }}>
        <StepInput step={step} />
      </Box>
    );
  }

  if (!subsections || subsections.length === 0) {
    return (
      <Typography sx={{ mb: 2 }}>
        There are no subsections or input fields defined for this step.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {subsections.map((subsec) => (
        <SubsectionInput key={subsec.id} stepId={step.id} subsection={subsec} />
      ))}
    </Box>
  );
}
