import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import SubsectionInput from "./SubsectionInput";
import StepInput from "./StepInput";
import SummarySection from "./SummarySection";

export default function SectionContent({ step }) {
  const { subsections } = step;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // For desktop, show summary as table; for mobile, use the default layout.
  if (step.id === "summary" && isDesktop) {
    return <SummarySection step={step} />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {step.type && <StepInput step={step} />}
      {subsections && subsections.length > 0 &&
        subsections.map((subsec) => (
          <SubsectionInput key={subsec.id} stepId={step.id} subsection={subsec} />
        ))
      }
      {(!step.type && (!subsections || subsections.length === 0)) && (
        <Typography sx={{ mb: 2 }}>
          There are no subsections or input fields defined for this step.
        </Typography>
      )}
    </Box>
  );
}
