import React, { useContext, useState, useRef } from "react";
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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function ElevationScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

/* -------------------------- HEADER -------------------------- */
export default function Header({ onToggleFullScreen }) {
  const { currentFile, setCurrentFile } = useContext(AAPContext);
  const {
    t,
    language,
    availableLanguages,
    changeLanguage,
    getNativeLanguageName,
  } = useContext(LanguageContext);

  /* ---------- language menu (shown only when !currentFile) ---------- */
  const langButtonRef = useRef(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const openLangMenu = () => setLangMenuOpen(true);
  const closeLangMenu = () => setLangMenuOpen(false);

  /* ---------- save & close handler ---------- */
  const handleSaveAndClose = () => {
    // Context auto-persists, so just clear the active file.
    setCurrentFile(null);
  };

  /* ---------- hazard icon & subtitle ---------- */
  const countries = useCountries();
  const hazard =
    currentFile?.AAP_BUILDER_DATA?.summary?.hazard?.hazard || "";
  const storedCountryCode =
    currentFile?.AAP_BUILDER_DATA?.summary?.country?.country || "";
  const country =
    countries.find((c) => c.alpha2 === storedCountryCode)?.name || "";
  const custodian =
    currentFile?.AAP_BUILDER_DATA?.summary?.["custodian-organisation"]?.[
      "custodian-organisation"
    ] || "";
  const subLine = [hazard, country, custodian].filter(Boolean).join(", ");

  let hazardIconUrl = null;
  switch (true) {
    case /cyclone/i.test(hazard):
      hazardIconUrl = CycloneIconUrl;
      break;
    case /drought/i.test(hazard):
      hazardIconUrl = DroughtIconUrl;
      break;
    case /flood/i.test(hazard):
      hazardIconUrl = FloodIconUrl;
      break;
    case /heatwave?|heat wave/i.test(hazard):
      hazardIconUrl = HeatwaveIconUrl;
      break;
    case /disease/i.test(hazard):
      hazardIconUrl = DiseaseIconUrl;
      break;
    default:
      break;
  }

  /* ---------- map ISO-flags to languages ---------- */
  const languageFlags = {
    en: "gb",
    fr: "fr",
    pt: "pt",
    sn: "zw",
    ny: "mw",
    sw: "ke",
    lg: "ug",
  };

  /* ---------------------------- render ---------------------------- */
  return (
    <>
      <ElevationScroll>
        <AppBar sx={{ top: 0, zIndex: 1199, backgroundColor: "rgb(14,105,46)" }}>
          <Box sx={{ maxWidth: "md", mx: "auto", width: "100%" }}>
            <Toolbar
              sx={{ height: "100%", alignItems: "stretch", px: { md: 3, xs: 0 } }}
            >
              {/* -------- title, icon & subtitle -------- */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  px: { md: 0, xs: 2 },
                }}
              >
                {hazardIconUrl && (
                  <Box
                    component="img"
                    src={hazardIconUrl}
                    alt={hazard}
                    sx={{ width: 32, height: 32, mr: 1.5, cursor: "pointer" }}
                    onClick={scrollToTop}
                  />
                )}
                <Box sx={{ color: "#fff" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1, mt: 0.5 }}>
                    {currentFile?.aap_template?.metadata?.title ||
                      t("header.title")}
                  </Typography>
                  {subLine && (
                    <Typography variant="subtitle" sx={{ mt: 0 }}>
                      {subLine}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/*
              <IconButton color="inherit" onClick={handleDrawerToggle}
                sx={{ borderRadius: 0, "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" } }}
              >
                <SettingsIcon fontSize="large" />
              </IconButton>
              */}

              {/* -------- right-hand controls -------- */}
              {currentFile ? (
                <>
                  {/* full-screen toggle */}
                  <Tooltip
                    title={t("button.enterFullscreen")}
                    disableFocusListener
                    disableTouchListener
                  >
                    <IconButton
                      color="inherit"
                      onClick={onToggleFullScreen}
                      sx={{
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
                      }}
                    >
                      <FullscreenIcon sx={{ fontSize: { md: 35, xs: 24 } }} />
                    </IconButton>
                  </Tooltip>

                  {/* save & close */}
                  <Tooltip
                    title={t("header.saveAndClose")}
                    disableFocusListener
                    disableTouchListener
                  >
                    <IconButton
                      color="inherit"
                      onClick={handleSaveAndClose}
                      sx={{
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "error.main" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: { md: 35, xs: 24 } }} />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                /* ===== no file open -> language selector ===== */
                <>
                  <IconButton
                    ref={langButtonRef}
                    color="inherit"
                    onClick={openLangMenu}
                    sx={{
                      borderRadius: 0,
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.2)" },
                      mr: { md: 0, xs: 1 },
                    }}
                  >
                    <Badge badgeContent={language.toUpperCase()} color="primary">
                      <LanguageIcon sx={{ fontSize: { md: 35, xs: 24 } }} />
                    </Badge>
                  </IconButton>

                  <Menu
                    anchorEl={langButtonRef.current}
                    open={langMenuOpen}
                    onClose={closeLangMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                  >
                    {availableLanguages.map((lang) => (
                      <MenuItem
                        key={lang}
                        onClick={() => {
                          changeLanguage(lang);
                          closeLangMenu();
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <img
                            src={`https://flagcdn.com/20x15/${(
                              languageFlags[lang] || "gb"
                            ).toLowerCase()}.png`}
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

      {/* the settings drawer is instantiated elsewhere, so nothing here */}
      <SettingsDrawer open={false} onClose={() => {}} />
    </>
  );
}
