import React from "react";
import { Box, Typography } from "@mui/material";
import SubsectionInput from "./SubsectionInput";

const SummarySection = ({ step }) => {
  return (
    <Box sx={{ mt: 2 }}>
      {step.subsections.map((subsec) => (
        <Box key={subsec.id} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ width: "30%", textAlign: "right", pr: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {subsec.title}
              {subsec.required && (
                <span style={{ color: "red", marginLeft: 4 }}>*</span>
              )}
            </Typography>
          </Box>
          <Box sx={{ width: "70%" }}>
            <SubsectionInput stepId={step.id} subsection={subsec} isSummary />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SummarySection;
