import React, { useState, useContext } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Button,
  MobileStepper
} from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import useMarkdownTemplate from "../utils/useMarkdownTemplate";
import { getSectionStatus } from "../utils/validation";
import SectionContent from "./SectionContent";
import { exportToDocx } from "../utils/docxExport";
import { LanguageContext } from "../context/LanguageContext";

const APP_BAR_OFFSET = 80; // px offset so the label isn't hidden beneath the AppBar

function TriStateStepIcon({ stepIndex, status, active }) {
  let bgColor = "grey.400";
  if (status === "inprogress") {
    bgColor = active ? "warning.dark" : "warning.main";
  } else if (status === "complete") {
    bgColor = active ? "success.dark" : "success.main";
  }
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
      }}
    >
      {stepIndex}
    </Box>
  );
}

export default function VerticalStepper() {

  const [activeStep, setActiveStep] = useState(() => {
    const stored = localStorage.getItem("AAP_ACTIVE_STEP");
    return stored !== null ? Number(stored) : 0;
  });

  const { t } = useContext(LanguageContext);
  

  const { aapData } = useContext(AAPContext);

  const { template, loading, error } = useMarkdownTemplate();

  const handleExport = () => {
    exportToDocx(aapData);
  };

  if (loading) {
    return <Typography>{ t("stepper.loadingTemplate")}</Typography>;
  }
  if (error) {
    return <Typography color="error">{ t("stepper.errorLoadingTemplate")} {error}</Typography>;
  }
  if (!template || template.length === 0) {
    return <Typography>{ t("stepper.noTemplateData")}</Typography>;
  }

  const steps = template;
  const totalSteps = steps.length;

  const stepStatus = (i) => getSectionStatus(steps[i], aapData);

  // This is called when the step's content finishes expanding
  // We'll scroll the step's label into view with an AppBar offset
  const handleStepContentEntered = (idx, stepId) => {
    if (idx === activeStep && window.innerWidth >= 960) {
      const labelEl = document.getElementById(`step-label-${stepId}`);
      if (labelEl) {
        const rect = labelEl.getBoundingClientRect();
        const scrollTop = window.scrollY + rect.top - APP_BAR_OFFSET;
        window.scrollTo({ top: scrollTop, behavior: "smooth" });
      }
    }
  };

  // Switch to a step (desktop or mobile) but do not immediately scroll
  // For desktop, we'll let the step open first, then handleStepContentEntered does the scroll
  const handleStepClick = (index) => {
    setActiveStep(index);
    localStorage.setItem("AAP_ACTIVE_STEP", index);
  };

  const desktopStepper = (
    <Stepper
      activeStep={activeStep}
      orientation="vertical"
      nonLinear
      sx={{ display: { xs: "none", md: "block" } }}
    >
      {steps.map((step, idx) => {
        const status = stepStatus(idx);

        return (
          <Step key={step.id || idx} completed={false}>
            <StepLabel
              icon={
                <TriStateStepIcon
                  stepIndex={idx}
                  status={status}
                  active={idx === activeStep}
                />
              }
              sx={{
                cursor: "pointer",
                ".MuiStepLabel-label": {
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                },
              }}
              onClick={() => handleStepClick(idx)}
            >
              {/* We give the label an ID so we can scroll to it later */}
              <Typography id={`step-label-${step.id}`} sx={{ fontWeight: "bold" }}>
                {step.title}
              </Typography>
            </StepLabel>

            <StepContent
              TransitionProps={{
                onEntered: () => handleStepContentEntered(idx, step.id),
              }}
            >
              <SectionContent step={step} />
              <Box sx={{ mb: 2 }}>
                <Button
                  disabled={idx === 0}
                  onClick={() => handleStepClick(idx - 1)}
                  sx={{ mt: 1, mr: 1 }}
                >
                  { t("stepper.back")}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleStepClick(idx + 1)}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={idx === totalSteps - 1}
                >
                  { t("stepper.next")}
                </Button>
              </Box>
            </StepContent>
          </Step>
        );
      })}
    </Stepper>
  );

  const mobileTopStepper = (
    <Box sx={{ display: { xs: "block", md: "none" } }}>
      <Box
        sx={{
          mb: 2,
          justifyContent: "space-between",
          display: "flex",
          backgroundColor: "background.light",
          borderRadius: 4,
        }}
      >
        {steps.map((step, idx) => {
          const status = stepStatus(idx);
          const active = idx === activeStep;
          return (
            <Box
              key={step.id || idx}
              onClick={() => handleStepClick(idx)}
              sx={{
                minWidth: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                cursor: "pointer",
              }}
            >
              <TriStateStepIcon stepIndex={idx} status={status} active={active} />
            </Box>
          );
        })}
      </Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
        {steps[activeStep].title}
      </Typography>
      <SectionContent step={steps[activeStep]} />
      <MobileStepper
        variant="text"
        steps={totalSteps - 1}
        position="static"
        activeStep={activeStep - 1}
        nextButton={
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              handleStepClick(Math.min(activeStep + 1, totalSteps - 1))
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={activeStep === totalSteps - 1}
          >
            { t("stepper.next")}
          </Button>
        }
        backButton={
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              handleStepClick(Math.max(activeStep - 1, 0))
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={activeStep === 0}
          >
            { t("stepper.back")}
          </Button>
        }
      />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {/* Mobile stepper at top */}
      {mobileTopStepper}

      {/* Desktop vertical stepper */}
      {desktopStepper}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          color="primary"
          onClick={handleExport}
        >
          { t("stepper.exportToDocx")}
        </Button>
      </Box>
    </Box>
  );
}
