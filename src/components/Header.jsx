import React, { useContext, useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import SettingsIcon from "@mui/icons-material/Settings";
import CycloneIconUrl from "../assets/Icon_Tropical_Cyclone.svg";
import DroughtIconUrl from "../assets/Icon_Drought.svg";
import FloodIconUrl from "../assets/Icon_Flood.svg";
import HeatwaveIconUrl from "../assets/Icon_Heatwave.svg";
import DiseaseIconUrl from "../assets/Icon_Disease.svg";
import SettingsDrawer from "./SettingsDrawer";

export default function Header() {
  const { aapData } = useContext(AAPContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hazard = aapData?.["summary"]?.["hazard"]?.["hazard"] || "";
  const country = aapData?.["summary"]?.["country"]?.["country"] || "";
  const custodian = aapData?.["summary"]?.["custodian-organisation"]?.["custodian-organisation"] || "";

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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Scroll to top behavior
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "rgb(14, 105, 46)" }}>
        <Box sx={{ maxWidth: "md", margin: "0 auto", width: "100%" }}>
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
                    cursor: "pointer", // Let user see it's clickable
                  }}
                  onClick={scrollToTop} // Smooth scroll to top
                />
              )}
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "#fff", fontWeight: "bold", lineHeight: 1, mt: 0.5 }}
                >
                  AAP Builder
                </Typography>
                <Typography variant="subtitle" sx={{ color: "#fff", mt: 0 }}>
                  {subLine}
                </Typography>
              </Box>
            </Box>
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </Box>
      </AppBar>
      <SettingsDrawer open={drawerOpen} onClose={handleDrawerToggle} />
    </>
  );
}
