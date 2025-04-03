import React, { useContext } from "react";
import { Box, Button, Typography } from "@mui/material";
import { LanguageContext } from "../context/LanguageContext";
import SettingsIcon from "@mui/icons-material/Settings";
import { AAPContext } from "../context/AAPContext";
import LogoAAPBuilder from "../../public/icon.svg";


export default function Footer({ onToggleDrawer, onToggleFullScreen, currentFile }) {

  const { t } = useContext(LanguageContext);

  return (
    <Box
      component="footer"
      sx={{ backgroundColor: "rgba(0,0,0,0.05)" }}
    >
      <Box sx={{ 
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        pr: { md: 3, xs: 0 },
        pl: { md: 3, xs: 2 },
        maxWidth: "md", margin: "0 auto", width: "100%" 
      }}>
        <img
          src={LogoAAPBuilder}
          alt="AAP Builder"
          style={{
            width: 40,
            height: 40,
            marginRight: 12,
            objectFit: "contain",
            alignSelf: "center",
            borderRadius: "32%",
          }}
        />
        <Box sx={{ flex: 1, alignContent: "center" }}>
          <Typography variant="subtitle2">
            {t("header.title")} © 2025 
          </Typography>
        </Box>

        <Box>
          {/* == WILL NEED TO  MOVE THE EXPORT BUTTON HERE ==
          {currentFile && (
            <Button
              onClick={onToggleDrawer}
              startIcon={<DownloadIcon />}
              color="text"
              size="large"
              sx={{ 
                py: 2,
                borderRadius: 0,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.1)"}
              }}
            >
              { t("stepper.exportToDocx") }
            </Button>
          )}
          */}

          <Button
            onClick={onToggleDrawer}
            startIcon={<SettingsIcon />}
            color="text"
            size="large"
            sx={{ 
              py: 2,
              borderRadius: 0,
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.1)"}
            }}
          >
            { t("settings.title") }
          </Button>

        </Box>
      </Box>
    </Box>
  );
}