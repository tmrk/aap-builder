import React, { useContext, useState, useEffect } from "react";
import { AAPContext } from "../context/AAPContext";
import { LanguageContext } from "../context/LanguageContext";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Paper,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useScrollTrigger
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PrintIcon from "@mui/icons-material/Print";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import useCountries from "../utils/useCountries";

// Helper function: recursively build TOC items from non-summary sections.
function buildTOCItems(sections, parentNumber = "") {
  let items = [];
  sections.forEach((section, idx) => {
    const numbering = parentNumber ? `${parentNumber}.${idx + 1}` : `${idx + 1}`;
    items.push({
      label: `${numbering}. ${section.title}`,
      target: `section-${section.id}`,
      level: parentNumber ? parentNumber.split(".").length + 1 : 1
    });
    if (section.subsections && section.subsections.length > 0) {
      items = items.concat(buildTOCItems(section.subsections, numbering));
    }
  });
  return items;
}

// Helper function: smooth scroll with offset.
function scrollToWithOffset(targetId, offset = 64) {
  const el = document.getElementById(targetId);
  if (el) {
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementPosition - offset - 10, behavior: "smooth" });
  }
}

// Helper: format text with line breaks.
function formatTextWithLineBreaks(text) {
  if (!text) return "";
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

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

// AppBar component.
function FullScreenAppBar({ onToggleDrawer, onClose, onPrint, darkMode, toggleDarkMode }) {
  const { t } = useContext(LanguageContext);
  const iconColor = darkMode ? "white" : "black";
  return (
    <ElevationScroll>
      <AppBar
        sx={{
          top: 0,
          zIndex: 1300,
          backdropFilter: "blur(8px)",
          backgroundColor: darkMode ? "rgba(50,50,50,0.7)" : "rgba(255,255,255,0.7)",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          transition: "background-color 0.3s"
        }}
      >
        <Box sx={{ maxWidth: "md", margin: "0 auto", width: "100%" }}>       
          <Toolbar sx={{ height: "100%", alignItems: "stretch", color: iconColor, px: { md: 3, xs: 0 } }}>

            <Tooltip title={t("fullscreen.tableOfContents")}>
              <IconButton onClick={onToggleDrawer} sx={{ color: iconColor, borderRadius: 0 }}>
                <MenuIcon sx={{ fontSize: { md: 35, sx: 15 } }} />
              </IconButton>
            </Tooltip>

            <Typography variant="h6" sx={{ 
                flexGrow: 1, textAlign: "center", color: iconColor,
                alignSelf: "center"
              }}>
              { t("fullscreen.AAPFullScreenView") }
            </Typography>

            <Tooltip title={t("button.print")}>
              <IconButton onClick={onPrint} sx={{ color: iconColor, borderRadius: 0 }}>
                <PrintIcon sx={{ fontSize: { md: 35, sx: 15 } }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={darkMode? t("button.switchToLightMode") : t("button.switchToDarkMode")}>
              <IconButton onClick={toggleDarkMode} sx={{ color: iconColor, borderRadius: 0 }}>
                {darkMode ? 
                  <Brightness7Icon sx={{ fontSize: { md: 35, sx: 15 } }} /> : 
                  <Brightness4Icon sx={{ fontSize: { md: 35, sx: 15 } }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t("button.exitFullscreen")}>
              <IconButton onClick={onClose}
                sx={{ color: iconColor, borderRadius: 0 }}
              >
                <FullscreenExitIcon sx={{ fontSize: { md: 35, sx: 15 } }} />
              </IconButton>
            </Tooltip>

          </Toolbar>
        </Box>
      </AppBar>
    </ElevationScroll>
  );
}

// Recursive component for rendering subsections.
function RenderSubsections({ parentId, subsections, aapData, numberingPrefix = "", textColor }) {
  const heading2Style = { fontWeight: "bold", mb: 1, color: "primary.main" };
  const heading3Style = { fontWeight: "bold", mb: 1, color: textColor };
  return subsections.map((subsec, idx) => {
    const subNumber = numberingPrefix ? `${numberingPrefix}.${idx + 1}` : `${idx + 1}`;
    const answer = aapData?.[parentId]?.[subsec.id]?.[subsec.id] || subsec.content || "";
    return (
      <Box key={subsec.id} sx={{ mb: 3 }}>
        <Typography id={`section-${subsec.id}`} variant="h5" sx={heading2Style}>
          {subNumber} {subsec.title}
        </Typography>
        {answer && (
          <Typography variant="body1" sx={{ mb: 1, color: textColor, textAlign: "justify", hyphens: "auto" }}>
            {formatTextWithLineBreaks(answer)}
          </Typography>
        )}
        {subsec.subsubsections && subsec.subsubsections.length > 0 && (
          <Box>
            {subsec.subsubsections.map((subsub, subIdx) => {
              const subsubNumber = `${subNumber}.${subIdx + 1}`;
              const subsubAnswer = aapData?.[parentId]?.[subsec.id]?.[subsub.id] || subsub.content || "";
              return (
                <Box key={subsub.id} sx={{ mb: 2 }}>
                  <Typography id={`section-${subsub.id}`} variant="h6" sx={heading3Style}>
                    {subsubNumber} {subsub.title}
                  </Typography>
                  {subsubAnswer && (
                    <Typography variant="body1" sx={{ color: textColor, textAlign: "justify", hyphens: "auto" }}>
                      {formatTextWithLineBreaks(subsubAnswer)}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  });
}

// Component to render a non-summary section.
function RenderSection({ section, aapData, numbering, textColor }) {
  const heading1Style = { fontWeight: "bold", mb: 2, color: "primary.main" };
  const answer = aapData?.[section.id]?.[section.id]?.[section.id] || section.content || "";
  return (
    <Box sx={{ mb: 4 }}>
      <Typography id={`section-${section.id}`} variant="h4" sx={heading1Style}>
        {numbering}. {section.title}
      </Typography>
      {answer && (
        <Typography variant="body1" sx={{ mb: 2, color: textColor, textAlign: "justify", hyphens: "auto" }}>
          {formatTextWithLineBreaks(answer)}
        </Typography>
      )}
      {section.subsections && section.subsections.length > 0 && (
        <RenderSubsections
          parentId={section.id}
          subsections={section.subsections}
          aapData={aapData}
          numberingPrefix={numbering}
          textColor={textColor}
        />
      )}
    </Box>
  );
}

export default function FullScreenAAPView({ onClose }) {
  const { currentFile } = useContext(AAPContext);
  const { t } = useContext(LanguageContext);
  const countries = useCountries();
  const [template, setTemplate] = useState(null);
  const [darkMode, setDarkMode] = useState(currentFile.AAP_BUILDER_SETTINGS?.darkMode || false);
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const [showAllSummary, setShowAllSummary] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle TOC drawer.
  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  // When collapsing summary ("Show less"), smooth scroll to top.
  const handleToggleShowSummary = () => {
    if (showAllSummary) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setShowAllSummary(prev => !prev);
  };

  // Scroll to top on mount.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const templateStr = localStorage.getItem("AAP_TEMPLATE");
    if (templateStr) {
      try {
        const parsed = JSON.parse(templateStr);
        setTemplate(parsed.template ? parsed.template : parsed);
      } catch (err) {
        console.error("Error parsing template", err);
      }
    }
  }, []);

  if (!currentFile || !template) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">
          {t("fullscreen.loading") || "Loading..."}
        </Typography>
      </Box>
    );
  }

  const aapData = currentFile.AAP_BUILDER_DATA || {};
  const contentBg = darkMode ? "#121212" : "white";
  const textColor = darkMode ? "white" : "black";

  // Build TOC items:
  // Include Summary as one item (no numbering) plus non-summary sections (with numbering).
  const tocItems = [];
  const summarySection = template.find(sec => sec.id === "summary");
  if (summarySection) {
    tocItems.push({
      label: summarySection.title,
      target: "section-summary",
      level: 1
    });
  }
  const nonSummarySections = template.filter(sec => sec.id !== "summary");
  tocItems.push(...buildTOCItems(nonSummarySections));

  // Summary section: show only Hazard, Country, and Custodian organisation by default.
  const defaultSummarySubsections = summarySection?.subsections
    ? summarySection.subsections.filter(subsec => {
        const title = subsec.title.toLowerCase();
        return title.includes("hazard") || title.includes("country") || title.includes("custodian");
      })
    : [];
  const displayedSummarySubsections = showAllSummary
    ? summarySection.subsections
    : defaultSummarySubsections;
  const showToggleButton =
    summarySection &&
    summarySection.subsections &&
    summarySection.subsections.length > defaultSummarySubsections.length;

  // Other sections: non-summary sections.
  const otherSections = nonSummarySections;

  return (
    <Box
      sx={{
        backgroundColor: contentBg,
        minHeight: "100vh",
        overflowY: "auto",
        position: "relative",
        lineHeight: 1.6,
        color: textColor,
        pb: 4
      }}
    >
      <style>
        {`
          @media print {
            body { background-color: white !important; color: black !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <FullScreenAppBar
        onToggleDrawer={toggleDrawer}
        onClose={onClose}
        onPrint={() => {
          const prevMode = darkMode;
          setDarkMode(false);
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              setDarkMode(prevMode);
            }, 500);
          }, 100);
        }}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      {/* TOC Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={toggleDrawer}
        slotProps={{
          paper: {
            sx: {
              top: "55px", // offset for fixed AppBar
              height: "calc(100% - 55px)",
              backgroundColor: darkMode ? "#121212" : "white",
              color: darkMode ? "white" : "black"
            }
          }
        }}
      >
        <Box sx={{ width: 250 }}>
          <Typography variant="h6" sx={{ p: 2, textAlign: "center" }}>
            { t("fullscreen.tableOfContents") }
          </Typography>
          <Divider sx={{ mx: 2 }}/>
          <List>
            {tocItems.map((item, idx) => (
              <ListItemButton
                key={idx}
                onClick={() => {
                  scrollToWithOffset(item.target, 64);
                  toggleDrawer();
                }}
                sx={
                  darkMode
                    ? {
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white"
                        }
                      }
                    : {}
                }
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontWeight: item.level === 1 ? 'bold' : 'inherit', pl: (item.level - 1) * 2 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box sx={{ maxWidth: "md", mx: "auto", pt: 10, px: 4 }}>
        {summarySection && (
          <Box sx={{ mb: 4 }}>
            <Typography id="section-summary" variant="h4" sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}>
              {summarySection.title}
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                mb: 2,
                backgroundColor: darkMode ? "#333" : "inherit",
                color: textColor
              }}
            >
              <Table>
                <TableBody>
                  {displayedSummarySubsections.map((subsec) => {
                    let answer =
                      aapData?.[summarySection.id]?.[subsec.id]?.[subsec.id] ||
                      subsec.content ||
                      "";
                    if (subsec.id === "last-update") {
                      answer = answer ? new Date(answer).toISOString().slice(0, 10) : "";
                    } else if (subsec.id === "country") {
                      const countryObj = countries.find(c => c.alpha2 === answer);
                      if (countryObj) {
                        answer = countryObj.name;
                      }
                    }
                    return (
                      <TableRow key={subsec.id}>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", width: "30%", color: textColor }}
                        >
                          {subsec.title}
                        </TableCell>
                        <TableCell sx={{ color: textColor }}>
                          {formatTextWithLineBreaks(answer)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {showToggleButton && (
              <Box sx={{ textAlign: "right" }}>
                <Button
                  onClick={handleToggleShowSummary}
                  variant="outlined"
                  className="no-print"
                  endIcon={showAllSummary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showAllSummary ? t("button.showLess") : t("button.showMore")}
                </Button>
              </Box>
            )}
          </Box>
        )}
        {otherSections.map((sec, idx) => (
          <RenderSection key={sec.id || idx} section={sec} aapData={aapData} numbering={idx + 1} textColor={textColor} />
        ))}
      </Box>
    </Box>
  );
}
