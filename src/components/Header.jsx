import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  useScrollTrigger,
} from "@mui/material";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import LanguageIcon from "@mui/icons-material/Language";
import CycloneIconUrl from "../assets/Icon_Tropical_Cyclone.svg";
import DroughtIconUrl from "../assets/Icon_Drought.svg";
import FloodIconUrl from "../assets/Icon_Flood.svg";
import HeatwaveIconUrl from "../assets/Icon_Heatwave.svg";
import DiseaseIconUrl from "../assets/Icon_Disease.svg";
import SettingsDrawer from "./SettingsDrawer";
import useCountries from "../utils/useCountries";

export default function Header({ onToggleDrawer, onToggleFullScreen }) {
  const { currentFile, setCurrentFile } = useContext(AAPContext);
  const {
    t,
    language,
    availableLanguages,
    changeLanguage,
    getNativeLanguageName,
  } = useContext(LanguageContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Language menu state
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const handleLangMenuOpen = (event) => {
    setLangAnchorEl(event.currentTarget);
  };
  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  // Mapping of language codes to flag country codes
  const languageFlags = {
    en: "gb",
    fr: "fr",
    pt: "pt",
    sn: "zw",
    ny: "mw",
    sw: "ke",
    lg: "ug",
  };

  const countries = useCountries();
  const storedCountryCode =
    currentFile?.AAP_BUILDER_DATA?.["summary"]?.["country"]?.["country"] || "";

  const hazard =
    currentFile?.AAP_BUILDER_DATA?.["summary"]?.["hazard"]?.["hazard"] || "";
  const country =
    countries.find((c) => c.alpha2 === storedCountryCode)?.name || "";
  const custodian =
    currentFile?.AAP_BUILDER_DATA?.["summary"]?.["custodian-organisation"]?.[
      "custodian-organisation"
    ] || "";

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

  function ElevationScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
      disableHysteresis: true,
      threshold: 0,
    });
  
    return children
      ? React.cloneElement(children, {
          elevation: trigger ? 4 : 0,
        })
      : null;
  }

  return (
    <>
      <ElevationScroll>
        <AppBar sx={{ 
          top: 0,
          zIndex: 1300,
          backgroundColor: "rgb(14, 105, 46)"
        }}>
          <Box sx={{ maxWidth: "md", margin: "0 auto", width: "100%" }}>
            <Toolbar sx={{ height: "100%", alignItems: "stretch", px: { md: 3, xs: 0 } }}>
              <Box sx={{ display: "flex", alignItems: "center", flex: 1, px: { md: 0, xs: 2 } }}>
                {hazardIconUrl && (
                  <img
                    src={hazardIconUrl}
                    alt={hazard}
                    style={{
                      width: 32,
                      height: 32,
                      marginRight: 12,
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onClick={scrollToTop}
                  />
                )}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "#fff", fontWeight: "bold", lineHeight: 1, mt: 0.5 }}
                  >
                    {t("header.title")}
                  </Typography>
                  <Typography variant="subtitle" sx={{ color: "#fff", mt: 0 }}>
                    {subLine}
                  </Typography>
                </Box>
              </Box>

              {/*
              <IconButton color="inherit" onClick={handleDrawerToggle}
                sx={{ borderRadius: 0, "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" } }}
              >
                <SettingsIcon fontSize="large" />
              </IconButton>
              */}

              {currentFile ? (
                <>

                  <Tooltip title={t("button.enterFullscreen")}>
                    <IconButton color="inherit" onClick={onToggleFullScreen}
                      sx={{ 
                        borderRadius: 0, "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
                      }}
                    >
                      <FullscreenIcon sx={{ fontSize: { md: 35, sx: 15 } }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t("header.saveAndClose")}>
                    <IconButton color="inherit" onClick={handleSaveAndClose} 
                      sx={{ borderRadius: 0, "&:hover": { backgroundColor: "error.main" } }}
                    >
                      <CloseIcon sx={{ fontSize: { md: 35, sx: 15 } }} />
                    </IconButton>
                  </Tooltip>

                </>
              ) : (
                <>
                  <IconButton color="inherit" onClick={handleLangMenuOpen}
                  sx={{ 
                    borderRadius: 0, "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
                    mr: { md: 0, xs: 1 }
                  }}
                >
                  <Badge badgeContent={language.toUpperCase()} color="primary">
                    <LanguageIcon sx={{ fontSize: { md: 35, sx: 15 } }} />
                  </Badge>
                </IconButton>
                <Menu
                  anchorEl={langAnchorEl}
                  open={Boolean(langAnchorEl)}
                  onClose={handleLangMenuClose}
                >
                  {availableLanguages.map((lang) => (
                    <MenuItem
                      key={lang}
                      onClick={() => {
                        changeLanguage(lang);
                        handleLangMenuClose();
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <img
                          src={`https://flagcdn.com/20x15/${languageFlags[lang].toLowerCase()}.png`}
                          alt={lang}
                          style={{ width: 20, height: 15 }}
                        />
                        {getNativeLanguageName(lang)}
                      </Box>
                    </MenuItem>
                  ))}
                </Menu>
              </>
              )}
            </Toolbar>
          </Box>
        </AppBar>
      </ElevationScroll>
      <SettingsDrawer open={drawerOpen} onClose={handleDrawerToggle} />
    </>
  );
}
