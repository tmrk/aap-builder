import React, { useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Checkbox,
  Autocomplete,
  Collapse,
  Button
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";
import useCountries from "../utils/useCountries";
import { getHazardIcon } from "../utils/hazardIcons";
import TriggerMechanismDesigner from "./TriggerMechanismDesigner";
import ExpandableTextField from "./ExpandableTextField";
import { useGlobalVisibility } from "../utils/useGlobalVisibility";
import DOMPurify from "dompurify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const SubsectionInput = ({ stepId, subsection, isSummary }) => {
  const { currentFile, updateField } = useContext(AAPContext);
  const { t, dateFnsLocale } = useContext(LanguageContext);
  const aapData = currentFile ? currentFile.AAP_BUILDER_DATA : {};
  const subsectionId = subsection.id;
  const questionId = subsectionId;
  const storedValue = aapData?.[stepId]?.[subsectionId]?.[questionId] || "";
  const value = Array.isArray(storedValue) ? storedValue : String(storedValue);
  
  const requiredStar = subsection.required ? (
    <span style={{ color: "red", marginLeft: 4 }}>*</span>
  ) : null;
  const characterLimit = subsection.characterLimit || 0;
  const exceedLimit = characterLimit > 0 && value.length > characterLimit;
  const type = (subsection.type || "").toLowerCase();
  const theme = useTheme();
  const [hintOpen, toggleHint, alwaysDisplayHints] = useGlobalVisibility(true, stepId, subsectionId, null);
  const [exampleOpen, toggleExample, alwaysDisplayExamples] = useGlobalVisibility(false, stepId, subsectionId, null);
  
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
              src={getHazardIcon(opt)}
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
          options={countries}
          getOptionLabel={(option) => option.name || ""}
          value={countries.find(c => c.alpha2 === value) || null}
          onChange={(e, newVal) =>
            updateField(stepId, subsectionId, questionId, newVal ? newVal.alpha2 : "")
          }
          renderOption={(props, option) => {
            // Destructure 'key' from props and pass it explicitly
            const { key, ...rest } = props;
            return (
              <Box 
                key={key} 
                {...rest}
                component="li"
                sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
              >
                {option?.alpha2 && (
                  <img
                    loading="lazy"
                    width="20"
                    srcSet={`https://flagcdn.com/w40/${option.alpha2.toLowerCase()}.png 2x`}
                    src={`https://flagcdn.com/w20/${option.alpha2.toLowerCase()}.png`}
                    alt=""
                  />
                )}
                {option.name}
              </Box>
            );
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
          onChange={(e, newVal) =>
            updateField(stepId, subsectionId, questionId, newVal || "")
          }
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
  } else if (type === "datepicker") {
    inputElem = (
      <DatePicker
        locale={dateFnsLocale}
        value={value ? new Date(value) : null}
        onChange={(newValue) =>
          updateField(stepId, subsectionId, questionId, newValue ? newValue.toISOString() : "")
        }
        format="yyyy-MM-dd"
        slots={{ textField: TextField }}
        slotProps={{
          textField: {
            variant: "outlined",
            placeholder: subsection.placeholder,
            fullWidth: true
          }
        }}
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
  
  if (!inputElem && (!subsection.subsubsections || subsection.subsubsections.length === 0)) {
    return null;
  }
  
  if (isSummary) {
    return (
      <Box>
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

  const helpTextStyles = {
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    "& table": {
      p: 1,
      border: "1px solid rgba(0,0,0,0.2)",
      borderCollapse: "collapse",
      my: 1,
    },
    "& table td, & table th": {
      border: "1px solid rgba(0,0,0,0.2)",
      p: 2,
    },
    "& table th": {
      textAlign: "center",
      fontWeight: "bold",
    },
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {subsection.title}
          {requiredStar}
        </Typography>
        {subsection.hint && !alwaysDisplayHints && (
          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={toggleHint}>
            {hintOpen ? t("button.hideHint") : t("button.hint")}
          </Button>
        )}
        {subsection.example && !alwaysDisplayExamples && (
          <Button variant="text" size="small" sx={{ ml: 1 }} onClick={toggleExample}>
            {exampleOpen ? t("button.hideExample") : t("button.example")}
          </Button>
        )}
      </Box>
      {subsection.hint && (
        <Collapse in={hintOpen} sx={{ mb: hintOpen ? 1 : 0 }}>
          <Box sx={{
            px: 0.5, mb: 1,
            ...theme.typography.body2,
            color: "text.secondary", 
            ...helpTextStyles,
          }}>
            <Typography variant="inherit" sx={{ display: "inline", fontWeight: "bold" }}>{t("sectionContent.explanatoryNote")}: </Typography>
            <Box sx={{ display: "inline" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subsection.hint) }} />
          </Box>
        </Collapse>
      )}
      {subsection.example && (
        <Collapse in={exampleOpen} sx={{ mb: exampleOpen ? 1 : 0 }}>
          <Box sx={{
            px: 0.5, mb: 1,
            ...theme.typography.body2,
            color: "text.secondary", 
            fontStyle: "italic",
            ...helpTextStyles,
          }}>
            <Typography variant="inherit" sx={{ display: "inline", fontWeight: "bold" }}>{t("sectionContent.exampleText")}: </Typography>
            <Box sx={{ display: "inline" }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subsection.example) }} />
          </Box>
        </Collapse>
      )}
      {inputElem}
      {characterLimit > 0 && type !== "textarea" && (
        <Typography variant="body2" sx={{ mt: 0.5, textAlign: "right", color: exceedLimit ? "red" : "text.secondary" }}>
          {value.length} / {characterLimit}
        </Typography>
      )}
      {subsection.subsubsections && subsection.subsubsections.length > 0 && (
        <Box sx={{ ml: 3, borderLeft: "2px solid #eee", pl: 2, mt: 2 }}>
          {subsection.subsubsections.map((subsub) => (
            <SubsectionInput key={subsub.id} stepId={stepId} subsection={subsub} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SubsectionInput;
