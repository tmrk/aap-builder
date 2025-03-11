import React, { useContext, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Collapse,
  Divider,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from "@mui/icons-material/Link";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { AAPContext } from "../context/AAPContext";
import TemplateSelector from "./TemplateSelector";
import { LanguageContext } from "../context/LanguageContext";
import { exportAAPFile, importAAPFile } from "../utils/exportImport";
import useCountries from "../utils/useCountries";

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const MM = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${ss}`;
};

export default function Dashboard() {
  const { store, loadFileById, deleteFile, importFile } = useContext(AAPContext);
  const { t } = useContext(LanguageContext);
  const countries = useCountries();
  const [activeInterface, setActiveInterface] = useState(null); // null, 'import', or 'template'
  const [importUrl, setImportUrl] = useState("");
  const [fileToDelete, setFileToDelete] = useState(null);

  const toggleInterface = (type) => {
    setActiveInterface(activeInterface === type ? null : type);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        importFile(importedData);
        setActiveInterface(null); // Close interface after successful import
      } catch (error) {
        console.error("Error importing file", error);
      }
    }
  };

  const handleImportFromURL = async () => {
    if (!importUrl) return;
    try {
      const resp = await fetch(importUrl);
      if (!resp.ok) {
        throw new Error(`Network error: ${resp.status}`);
      }
      const importedData = await resp.json();
      importFile(importedData);
      setImportUrl("");
      setActiveInterface(null); // Close interface after successful import
    } catch (error) {
      console.error("Error importing file from URL", error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Alert severity="info"
        sx={{ mb: 3, py: 2, borderRadius: 1, fontSize: "1.1rem" }}>
        <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          {t("dashboard.welcome")}
        </AlertTitle>
        {t("dashboard.intro")}
      </Alert>

      {/* Main Action Buttons */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          gap: 2, 
          mb: 1
        }}
      >
        <Button
          variant={activeInterface === 'import' ? "contained" : "outlined"}
          color="primary"
          size="large"
          fullWidth
          startIcon={<FileOpenIcon />}
          onClick={() => toggleInterface('import')}
          sx={{ 
            py: 2,
            flex: activeInterface === "import" ? 6 : 5,
            fontSize: "1.1rem",
            borderWidth: 2,
            transition: "all 0.2s",
            minHeight: "64px"
          }}
        >
          {t("dashboard.openAAPfromFile")}
        </Button>
        
        <Button
          variant={activeInterface === 'template' ? "contained" : "outlined"}
          color="primary"
          size="large"
          fullWidth
          startIcon={<CreateIcon />}
          onClick={() => toggleInterface('template')}
          sx={{ 
            py: 2,
            flex: activeInterface === "template" ? 6 : 5,
            fontSize: "1.1rem",
            borderWidth: 2,
            transition: "all 0.2s",
            minHeight: "64px"
          }}
        >
          {t("dashboard.newAAP")}
        </Button>
      </Box>

      {/* Import Interface */}
      <Collapse in={activeInterface === 'import'} timeout={500}>
        <Box
          sx={{
            mb: 1,
            py: 2,
            position: "relative"
          }}
        >

          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
            {t("dashboard.openAAPfromFile")}
          </Typography>
          
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", md: "row" },
              gap: 3
            }}
          >
            {/* Import from File Section */}
            <Box 
              sx={{ 
                flex: 1,
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center",
                gap: 1
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                {t("dashboard.selectFileFromComputer")}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                component="label" 
                startIcon={<UploadFileIcon />}
                sx={{ 
                  width: "100%", 
                  py: 2,
                }}
              >
                {t("dashboard.selectFileToOpen")}
                <input 
                  type="file" 
                  accept="application/json" 
                  hidden 
                  onChange={handleImportFile} 
                />
              </Button>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />
            <Divider sx={{ display: { xs: "block", md: "none" }, width: "100%" }} />

            {/* Import from URL Section */}
            <Box 
              sx={{ 
                flex: 1,
                display: "flex", 
                flexDirection: "column", 
                gap: 1
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}>
                {t("dashboard.importUrl")}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignContent: "stretch" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  color="primary"
                  placeholder={t("dashboard.urlPlaceholder") || "https://example.com/aap.json"}
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon color="primary" />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleImportFromURL}
                  disabled={!importUrl}
                >
                  {t("dashboard.buttonLoadFromUrl")}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Collapse>

      {/* Template Selector Interface */}
      <Collapse in={activeInterface === 'template'} timeout={500}>
        <Box sx={{
          mb: 1,
          py: 2,
          position: "relative"
        }}>
          <TemplateSelector 
            onClose={() => setActiveInterface(null)} 
          />
        </Box>
      </Collapse>

      {/* Saved Files Section */}

      {store.AAP_FILES && store.AAP_FILES.length > 0 && (
        <>
        <Box sx={{ mt: 2, border: "1px solid #ccc", p: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.5)" }}>
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            {t("dashboard.savedAAPfiles")}
          </Typography>
          <Divider sx={{ mt: 2 }} />
          <List>
            {[...store.AAP_FILES]
              .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))
              .map((file) => {
                const templateUsed = store.AAP_TEMPLATES.find(template => template.id === file.aap_template);
                const templateName = templateUsed ? (templateUsed.metadata?.name || templateUsed.name) : t("dashboard.unknownTemplate");

                return (
                <Box key={file.id} sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemButton variant="outlined" onClick={() => loadFileById(file.id)} sx={{ flex: 1, borderRadius: 1 }}>
                    <DescriptionIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={`
                        ${file.AAP_BUILDER_DATA?.summary?.hazard?.hazard || t("dashboard.unspecifiedHazard")} - 
                        ${countries.find(c => c.alpha2 === (file.AAP_BUILDER_DATA?.summary?.country?.country || ""))?.name || t("dashboard.unspecifiedCountry")} - 
                        ${file.AAP_BUILDER_DATA?.summary?.["custodian-organisation"]?.["custodian-organisation"] || t("dashboard.unspecifiedCustodian")} 
                        (${file.last_updated.slice(0, 10)})
                      `}
                      secondary={
                        t("dashboard.templateUsed") + ": " + templateName +
                        " | " +
                        t("dashboard.lastEdited") + ": " + formatDateTime(file.last_updated)
                      }                      
                    />
                    <Tooltip title={t("dashboard.fileDownload")}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          exportAAPFile(file);
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("dashboard.fileDelete")}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setFileToDelete(file);
                        }}
                        sx={{ "&:hover": { color: "error.main" } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                </Box>
              )}
            )}
          </List>
          {fileToDelete && (
            <Dialog
              open={Boolean(fileToDelete)}
              onClose={() => setFileToDelete(null)}
            >
              <DialogTitle>
                {t("dashboard.confirmDeleteTitle")}
              </DialogTitle>
              <DialogContent>
                <Typography>
                  {t("dashboard.confirmDeleteMessage")}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setFileToDelete(null)}>
                  {t("dashboard.cancel")}
                </Button>
                <Button
                  onClick={() => {
                    deleteFile(fileToDelete.id);
                    setFileToDelete(null);
                  }}
                  color="error"
                >
                  {t("dashboard.confirm")}
                </Button>
              </DialogActions>
            </Dialog>
          )}
        <Alert severity="warning" sx={{ borderRadius: 1 }}>
          {t("dashboard.localFilesWarning")}
        </Alert>
        </Box>

        </>
      )}
    </Box>
  );
}