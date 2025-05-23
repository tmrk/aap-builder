import React, { useState, useContext } from "react";
import { AAPProvider, AAPContext } from "./context/AAPContext";
import { LanguageProvider, LanguageContext } from "./context/LanguageContext";
import VerticalStepper from "./components/VerticalStepper";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import FullScreenAAPView from "./components/FullScreenAAPView";
import SettingsDrawer from "./components/SettingsDrawer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, Container } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

/*
blue: rgb(89, 150, 228);
blue-light: rgb(128, 176, 234);
violet: rgb(176, 40, 133);
violet-light: rgb(204, 130, 179);
blaze-red: rgb(207, 0, 51);
blaze-red-light: rgb(211, 109, 133);
orange: rgb(255, 158, 17);
orange-light: rgb(246, 199, 125);
yellow: rgb(248, 216, 50);
yellow-light: rgb(249, 236, 163);
cta-blaze-red: rgb(230, 32, 62);
dark-green: rgb(14, 105, 46);
green-1: rgb(126, 190, 98);
green-2: rgb(157, 206, 135);
green-3: rgb(185, 216, 157);
green-4: rgb(214, 228, 200);
dark-brown: rgb(57, 43, 39);
brown-1: rgb(92, 69, 60);
brown-2: rgb(169, 144, 115);
wheat-1: rgb(229, 216, 175);
wheat-2: rgb(247, 244, 224);
*/

const theme = createTheme({
  palette: {
    primary: {
      main: "rgb(47, 171, 22)",
      light: "rgb(214, 228, 200)",
      dark: "rgb(14, 105, 46)",
    },
    secondary: {
      main: "rgb(89, 150, 228)",
      light: "rgb(128, 176, 234)",
    },
    success: {
      main: "rgb(89, 150, 228)",
    },
    warning: {
      main: "rgb(255, 158, 17)",
    },
    error: {
      main: "rgb(207, 0, 51)",
    },
    background: {
      default: "rgb(247, 244, 224)",
      light: "rgb(229, 216, 175)",
      dark: "rgb(169, 144, 115)",
    },
    text: {
      primary: "rgb(57, 43, 39)",
      secondary: "rgb(92, 69, 60)",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

// Wrap content in a flex column so that the footer is pushed to the bottom when content is short.
function AppContentWithFooter({ onToggleFullScreen }) {
  const { currentFile } = useContext(AAPContext);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const toggleSettingsDrawer = () => setSettingsDrawerOpen((prev) => !prev);

  return (
    <>
      <Header 
        drawerOpen={settingsDrawerOpen} 
        onToggleDrawer={toggleSettingsDrawer}
        onToggleFullScreen={currentFile ? onToggleFullScreen : undefined}
      />
      <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
        <Container maxWidth="md" sx={{ pb: 5 }}>
          {currentFile ? <VerticalStepper /> : <Dashboard />}
        </Container>
      </Box>
      <Footer
        onToggleDrawer={toggleSettingsDrawer}
        onToggleFullScreen={currentFile ? onToggleFullScreen : undefined}
        currentFile={currentFile}
      />
      <SettingsDrawer open={settingsDrawerOpen} onClose={toggleSettingsDrawer} />
    </>
  );
}

function AppWithLocalization({ onToggleFullScreen }) {
  const { dateFnsLocale } = useContext(LanguageContext);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateFnsLocale}>
      <AppContentWithFooter onToggleFullScreen={onToggleFullScreen} />
    </LocalizationProvider>
  );
}

function App() {
  const [fullScreen, setFullScreen] = useState(false);
  const toggleFullScreen = () => setFullScreen((prev) => !prev);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AAPProvider>
          {fullScreen ? (
            <FullScreenAAPView onClose={() => setFullScreen(false)} />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <AppWithLocalization onToggleFullScreen={toggleFullScreen} />
            </Box>
          )}
        </AAPProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
