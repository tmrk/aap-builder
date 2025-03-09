import React, { useContext } from "react";
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
  Grow
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import CloseIcon from "@mui/icons-material/Close";
import { AAPContext } from "../context/AAPContext";
import TemplateSelector from "./TemplateSelector";
import { LanguageContext } from "../context/LanguageContext";
import { exportAAPFile, importAAPFile } from "../utils/exportImport";

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
  const [selectingTemplate, setSelectingTemplate] = React.useState(false);
  const [importerOpen, setImporterOpen] = React.useState(false);
  const [importUrl, setImportUrl] = React.useState("");
  const [fileToDelete, setFileToDelete] = React.useState(null);

  const handleNewAAP = () => {
    setSelectingTemplate(true);
    setImporterOpen(false);
  };

  const handleImportAAP = () => {
    setImporterOpen(true);
    setSelectingTemplate(false);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        importFile(importedData);
        setImporterOpen(false);
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
      setImporterOpen(false);
      setImportUrl("");
    } catch (error) {
      console.error("Error importing file from URL", error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Alert severity="info" sx={{ mb: 2, py: 5, borderRadius: 1, fontSize: "1.2rem" }}>
        {t("dashboard.intro")}
      </Alert>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2
        }}
      >
        <Box
          sx={{
            flex: { md: importerOpen ? 5 : 1 },
            transition: "flex 0.1s linear",
            width: { xs: "100%", md: "auto" }
          }}
        >
          {importerOpen ? (
            <Grow in={importerOpen} timeout={500}>
              <Box sx={{ width: "100%", height: "100%" }}>
                <Box
                  sx={{
                    backgroundColor: "secondary.main",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    px: 2,
                    mb: 2,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="h6" sx={{ textAlign: "center", textTransform: "uppercase", flex: 1, color: "#fff"}}>
                    {t("dashboard.openAAPfromFile")}
                  </Typography>
                  <IconButton color="inherit" onClick={() => setImporterOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{flex: 1, textAlign: "right"}}>{"Open from your computer"}</Typography>
                  <Button variant="outlined" color="secondary" size="large" component="label" sx={{ mt: 1, py: 2, flex: 1 }}>
                    {t("dashboard.selectFile")}
                    <input type="file" accept="application/json" hidden onChange={handleImportFile} />
                  </Button>
                </Box>
                <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
                  <Typography variant="subtitle1" sx={{flex: 1, textAlign: "right"}}>
                    {t("dashboard.importUrl")}
                  </Typography>
                  <Box sx={{ display: "flex", mt: 1, flex: 1, alignItems: "stretch" }}>
                    <TextField
                      
                      variant="outlined"
                      color="secondary"
                      placeholder={t("dashboard.urlPlaceholder") || "https://example.com/aap.json"}
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                    />
                    <Button variant="contained" color="secondary" sx={{ ml: 1 }} onClick={handleImportFromURL}>
                      {t("dashboard.buttonLoadFromUrl")}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grow>
          ) : (
            <Button
              variant="contained" 
              color="secondary"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                fontSize: "1.5rem",
                transition: "flex 0.1s linear"
              }}
              onClick={handleImportAAP}
            >
              <FileOpenIcon sx={{ width: "40%", height: "40%" }} />
              { !selectingTemplate && (t("dashboard.openAAPfromFile")) }
            </Button>
          )}
        </Box>
        <Box
          sx={{
            flex: { md: selectingTemplate ? 5 : 2 },
            transition: "flex 0.1s linear",
            width: { xs: "100%", md: "auto" }
          }}
        >
          {selectingTemplate ? (
            <Grow in={selectingTemplate} timeout={500}>
              <Box sx={{ width: "100%", height: "100%" }}>
                <Box
                  sx={{
                    backgroundColor: "primary.main",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    px: 2,
                    mb: 2,
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ textAlign: "center", textTransform: "uppercase", flex: 1, color: "#fff"}}>
                    <Typography variant="h4" sx={{ lineHeight: 1, mt: 0.5 }}>
                      {t("dashboard.newAAP")}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", letterSpacing: 1 }}>
                      👇 {t("dashboard.templateSelectorTitle")} 👇
                    </Typography>
                  </Box>
                  <IconButton color="inherit" onClick={() => setSelectingTemplate(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <TemplateSelector onClose={() => setSelectingTemplate(false)} />
              </Box>
            </Grow>
          ) : (
            <Button
              variant="contained"
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                fontSize: "1.5rem",
                transition: "flex 0.1s linear"
              }}
              onClick={handleNewAAP}
            >
              <CreateIcon sx={{ width: "40%", height: "40%" }} />
              { !importerOpen && (t("dashboard.newAAP")) }
            </Button>
          )}
        </Box>
      </Box>

      {store.AAP_FILES && store.AAP_FILES.length > 0 && (
        <>
        <Box sx={{ mt: 2, border: "1px solid #ccc", p: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" }}>
          <Typography variant="h6" textAlign="center">
            {t("dashboard.savedAAPfiles")}
          </Typography>
          <List>
            {[...store.AAP_FILES]
              .sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated))
              .map((file) => (
                <Box key={file.id} sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemButton variant="outlined" onClick={() => loadFileById(file.id)} sx={{ flex: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={`
                        ${file.AAP_BUILDER_DATA?.summary?.hazard?.hazard || "Unspecified hazard"} - 
                        ${file.AAP_BUILDER_DATA?.summary?.country?.country || "unspecified country"} - 
                        ${file.AAP_BUILDER_DATA?.summary?.["custodian-organisation"]?.["custodian-organisation"] || "unspecified custodian"} 
                        / ${file.last_updated.slice(0, 10)}
                      `}
                      secondary={`Last updated: ${formatDateTime(file.last_updated)}`}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        exportAAPFile(file);
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileToDelete(file);
                      }}
                      sx={{ "&:hover": { color: "error.main" } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemButton>
                </Box>
              ))}
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
