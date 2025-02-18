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
      {stepIndex + 1}
    </Box>
  );
}

export default function VerticalStepper() {
  const [activeStep, setActiveStep] = useState(0);
  const { aapData } = useContext(AAPContext);

  const { template, loading, error } = useMarkdownTemplate();

  const handleExport = () => {
    exportToDocx(aapData);
  };

  if (loading) {
    return <Typography>Loading template...</Typography>;
  }
  if (error) {
    return <Typography color="error">Error loading template: {error}</Typography>;
  }
  if (!template || template.length === 0) {
    return <Typography>No template data available.</Typography>;
  }

  const steps = template;
  const totalSteps = steps.length;

  const stepStatus = (i) => getSectionStatus(steps[i], aapData);

  const handleStepClick = (index) => {
    setActiveStep(index);
  };

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
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
              <Typography sx={{ fontWeight: "bold" }}>{step.title}</Typography>
            </StepLabel>
            <StepContent>
              <SectionContent step={step} />
              <Box sx={{ mb: 2 }}>
                <Button disabled={idx === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={idx === totalSteps - 1}
                >
                  Next
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
      <Box sx={{ mb: 2, justifyContent: "space-between", display: "flex"}}>
        {steps.map((step, idx) => {
          const status = stepStatus(idx);
          const active = idx === activeStep;
          return (
            <Box
              key={step.id || idx}
              onClick={() => handleStepClick(idx)}
              sx={{
                minWidth: 32,
                height: 32,
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
        steps={totalSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={handleNext}
            disabled={activeStep === totalSteps - 1}
          >
            Next
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            Back
          </Button>
        }
      />
    </Box>
  );

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {mobileTopStepper}
      {desktopStepper}
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" size="large" fullWidth color="primary" onClick={handleExport}>
          Export to docx
        </Button>
      </Box>
    </Box>
  );
}
