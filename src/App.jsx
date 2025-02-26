import React from "react";
import { AAPProvider } from "./context/AAPContext";
import { LanguageProvider } from "./context/LanguageContext";
import VerticalStepper from "./components/VerticalStepper";
import Header from "./components/Header";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Container } from "@mui/material";

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
      main: "rgb(47, 171, 22)", // green
      light: "rgb(214, 228, 200)", // green-3
      dark: "rgb(14, 105, 46)", // dark-green
    },
    success: {
      main: "rgb(89, 150, 228)", // blue
    },
    warning: {
      main: "rgb(255, 158, 17)", // orange
    },
    error: {
      main: "rgb(207, 0, 51)", // blaze-red
    },
    background: {
      default: "rgb(247, 244, 224)", // wheat-2
      light: "rgb(229, 216, 175)", // wheat-1
      dark: "rgb(169, 144, 115)", // brown-2
    },
    text: {
      primary: "rgb(57, 43, 39)", // dark-brown
      secondary: "rgb(92, 69, 60)", // brown-1
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AAPProvider>
          <Header />
          <Container maxWidth="md" sx={{ pb: 5 }}>
            <VerticalStepper />
          </Container>
        </AAPProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
