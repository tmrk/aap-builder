import React, { useContext, useState } from "react";
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
  Button
} from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import useCountries from "../utils/useCountries";
import TriggerMechanismDesigner from "./TriggerMechanismDesigner";

/* Renders an input field for a "subsection" object. */
function SubsectionInput({ stepId, subsection }) {
  const { aapData, updateField } = useContext(AAPContext);
  const [hintOpen, setHintOpen] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);

  const subsectionId = subsection.id;
  const questionId = subsectionId;
  const storedValue =
    aapData?.[stepId]?.[subsectionId]?.[questionId] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);
  const requiredStar = subsection.required ? (
    <span style={{ color: "red", marginLeft: 4 }}>*</span>
  ) : null;
  const characterLimit = subsection.characterLimit || 0;
  const exceedLimit = characterLimit > 0 && value.length > characterLimit;
  const type = (subsection.type || "").toLowerCase();
  let inputElem = null;

  if (type === "dropdown") {
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
            <TextField
              {...params}
              variant="outlined"
              placeholder={subsection.placeholder}
              label={subsection.title}
            />
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
            <TextField
              {...params}
              variant="outlined"
              placeholder={subsection.placeholder}
              label={subsection.title}
            />
          )}
        />
      );
    }
  } else if (type === "radio") {
    const opts = Array.isArray(subsection.options) ? subsection.options : [];
    inputElem = (
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={value}
          onChange={(e) => {
            updateField(stepId, subsectionId, questionId, e.target.value);
          }}
        >
          {opts.map((opt) => (
            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
          ))}
        </RadioGroup>
      </FormControl>
    );
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
      <TextField
        placeholder={subsection.placeholder}
        fullWidth
        multiline
        rows={4}
        value={value}
        onChange={(e) =>
          updateField(stepId, subsectionId, questionId, e.target.value)
        }
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
  } else {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {subsection.title}
          {requiredStar}
        </Typography>
        {subsection.hint && (
          <Button
            variant="text"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setHintOpen((p) => !p)}
          >
            Hint
          </Button>
        )}
        {subsection.example && (
          <Button
            variant="text"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setExampleOpen((p) => !p)}
          >
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
      {characterLimit > 0 && (
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

/* Renders a step-level input for steps without subsections. */
function StepInput({ step }) {
  const { aapData, updateField } = useContext(AAPContext);

  const [hintOpen, setHintOpen] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);

  // We'll store the data under aapData[step.id][step.id][step.id]
  const storedValue = aapData?.[step.id]?.[step.id]?.[step.id] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);

  const characterLimit = step.characterLimit || 0;
  const exceedLimit = characterLimit > 0 && value.length > characterLimit;
  const type = (step.type || "").toLowerCase();

  let inputElem = null;
  if (type === "dropdown") {
    const countries = useCountries();
    const opts = Array.isArray(step.options) ? step.options : [];
    if (step.id === "country") {
      inputElem = (
        <Autocomplete
          options={Array.isArray(countries) ? countries : []}
          value={value || ""}
          onChange={(e, newVal) => {
            updateField(step.id, step.id, step.id, newVal || "");
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" placeholder={step.placeholder} />
          )}
        />
      );
    } else {
      inputElem = (
        <Autocomplete
          options={opts}
          value={value || ""}
          onChange={(e, newVal) => {
            updateField(step.id, step.id, step.id, newVal || "");
          }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" placeholder={step.placeholder} />
          )}
        />
      );
    }
  } else if (type === "radio") {
    const opts = Array.isArray(step.options) ? step.options : [];
    inputElem = (
      <FormControl component="fieldset">
        <RadioGroup
          row
          value={value}
          onChange={(e) => {
            updateField(step.id, step.id, step.id, e.target.value);
          }}
        >
          {opts.map((opt) => (
            <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
          ))}
        </RadioGroup>
      </FormControl>
    );
  } else if (type === "checkbox") {
    const opts = Array.isArray(step.options) ? step.options : [];
    const arrVal = Array.isArray(value) ? value : [];
    const handleCheck = (opt) => {
      if (arrVal.includes(opt)) {
        updateField(step.id, step.id, step.id, arrVal.filter((x) => x !== opt));
      } else {
        updateField(step.id, step.id, step.id, [...arrVal, opt]);
      }
    };
    inputElem = (
      <Box>
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
    );
  } else if (type === "triggerdesigner") {
    inputElem = (
      <TriggerMechanismDesigner
        sectionId={step.id}
        subsectionId={step.id}
        questionId={step.id}
      />
    );
  } else if (type === "textarea") {
    inputElem = (
      <TextField
        placeholder={step.placeholder}
        fullWidth
        multiline
        rows={4}
        value={value}
        onChange={(e) => updateField(step.id, step.id, step.id, e.target.value)}
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

  if (!inputElem) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {step.hint && (
          <Button
            variant="text"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setHintOpen((p) => !p)}
          >
            Hint
          </Button>
        )}
        {step.example && (
          <Button
            variant="text"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setExampleOpen((p) => !p)}
          >
            Example
          </Button>
        )}
      </Box>
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
      {characterLimit > 0 && (
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

/* Renders the content for a given step, 
   either as multiple subsections or a single step-level input. */
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
