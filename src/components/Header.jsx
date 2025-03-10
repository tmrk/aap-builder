import React, { useContext, useState } from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from '@mui/icons-material/Close';
import CycloneIconUrl from "../assets/Icon_Tropical_Cyclone.svg";
import DroughtIconUrl from "../assets/Icon_Drought.svg";
import FloodIconUrl from "../assets/Icon_Flood.svg";
import HeatwaveIconUrl from "../assets/Icon_Heatwave.svg";
import DiseaseIconUrl from "../assets/Icon_Disease.svg";
import SettingsDrawer from "./SettingsDrawer";
import useCountries from "../utils/useCountries";

export default function Header() {
  const { currentFile, setCurrentFile } = useContext(AAPContext);
  const { t } = useContext(LanguageContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const countries = useCountries();
  const storedCountryCode = currentFile?.AAP_BUILDER_DATA?.["summary"]?.["country"]?.["country"] || "";

  const hazard = currentFile?.AAP_BUILDER_DATA?.["summary"]?.["hazard"]?.["hazard"] || "";
  const country = countries.find(c => c.alpha2 === storedCountryCode)?.name || "";
  const custodian = currentFile?.AAP_BUILDER_DATA?.["summary"]?.["custodian-organisation"]?.["custodian-organisation"] || "";

  const subLine = [hazard, country, custodian].filter(Boolean).join(", ");

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveAndClose = () => {
    // With auto-save via context, simply clear the current file to return to the dashboard.
    setCurrentFile(null);
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "rgb(14, 105, 46)" }}>
        <Box sx={{ maxWidth: "md", margin: "0 auto", width: "100%" }}>
          <Toolbar>
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              {hazardIconUrl && (
                <img
                  src={hazardIconUrl}
                  alt={hazard}
                  style={{
                    width: 32,
                    height: 32,
                    marginRight: 12,
                    objectFit: "contain",
                    cursor: "pointer"
                  }}
                  onClick={scrollToTop}
                />
              )}
              <Box>
                <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", lineHeight: 1, mt: 0.5 }}>
                  {t("header.title")}
                </Typography>
                <Typography variant="subtitle" sx={{ color: "#fff", mt: 0 }}>
                  {subLine}
                </Typography>
              </Box>
            </Box>
              {currentFile && (
                <Tooltip title={t("header.saveAndClose")}>
                  <IconButton color="inherit" onClick={handleSaveAndClose}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              )}
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
