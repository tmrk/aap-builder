import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import CycloneIconUrl from "../assets/Icon_Tropical_Cyclone.svg";
import DroughtIconUrl from "../assets/Icon_Drought.svg";
import FloodIconUrl from "../assets/Icon_Flood.svg";
import HeatwaveIconUrl from "../assets/Icon_Heatwave.svg";
import DiseaseIconUrl from "../assets/Icon_Disease.svg";

export default function Header() {
  const { aapData } = useContext(AAPContext);

  const hazard =
    aapData?.["summary"]?.["hazard"]?.["hazard"] || "";
  const country =
    aapData?.["summary"]?.["country"]?.["country"] || "";
  const custodian =
    aapData?.["summary"]?.["custodian-organisation"]?.["custodian-organisation"] || "";

  const subLine = [hazard, country, custodian].filter(Boolean).join(", ");

  // Determine which icon to show based on hazard text
  let hazardIconUrl = null;
  const hazardLower = hazard.toLowerCase();
  if (hazardLower.includes("cyclone")) {
    hazardIconUrl = CycloneIconUrl;
  } else if (hazardLower.includes("drought")) {
    hazardIconUrl = DroughtIconUrl;
  } else if (hazardLower.includes("flood")) {
    hazardIconUrl = FloodIconUrl;
  } else if (hazardLower.includes("heat")) {
    hazardIconUrl = HeatwaveIconUrl;
  } else if (hazardLower.includes("disease")) {
    hazardIconUrl = DiseaseIconUrl;
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "rgb(14, 105, 46)" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {hazardIconUrl && (
            <img
              src={hazardIconUrl}
              alt={hazard}
              style={{
                width: 32,
                height: 32,
                marginRight: 12,
                objectFit: "contain",
              }}
            />
          )}
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", lineHeight: 1, mt: 0.5 }}>
              AAP Builder
            </Typography>
            <Typography variant="subtitle" sx={{ color: "#fff", mt: 0 }}>
              {subLine}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
