import { useState, useEffect } from "react";

const GIST_URL =
  "https://gist.githubusercontent.com/tmrk/27d1348f855547079dc8d00ab5454c06/raw/AAP-template.md";
const TEMPLATE_STORAGE_KEY = "AAP_MD_TEMPLATE";

function canFetchRemote() {
  return typeof navigator !== "undefined" && navigator.onLine === true;
}

function parseMarkdown(mdText) {
  const lines = mdText.split("\n");
  const steps = [];

  let currentStep = null;
  let currentSubsection = null;
  let currentSubsubsection = null;

  const makeIdFromTitle = (title) =>
    title.toLowerCase().replace(/\s+/g, "-");

  // Push any pending sub‑sub‑section into the current subsection
  const pushSubsubsection = () => {
    if (currentSubsection && currentSubsubsection) {
      if (!currentSubsection.subsubsections) {
        currentSubsection.subsubsections = [];
      }
      currentSubsection.subsubsections.push(currentSubsubsection);
      currentSubsubsection = null;
    }
  };

  // Push the current subsection (including any pending sub‑sub‑section) into the current step
  const pushSubsection = () => {
    pushSubsubsection();
    if (currentStep && currentSubsection) {
      if (!currentStep.subsections) {
        currentStep.subsections = [];
      }
      currentStep.subsections.push(currentSubsection);
      currentSubsection = null;
    }
  };

  // Push the current step (including any pending subsection) into the steps array
  const pushStep = () => {
    pushSubsection();
    if (currentStep) {
      steps.push(currentStep);
      currentStep = null;
    }
  };

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("# ")) {
      pushStep();
      const title = line.replace("# ", "");
      currentStep = {
        id: makeIdFromTitle(title),
        title,
        subsections: [],
      };
    } else if (line.startsWith("## ")) {
      pushSubsection();
      const title = line.replace("## ", "");
      currentSubsection = {
        id: makeIdFromTitle(title),
        title,
        type: null,
        placeholder: "",
        options: [],
        characterLimit: 0,
        required: false,
        hint: "",
        example: "",
        subsubsections: [],
      };
    } else if (line.startsWith("### ")) {
      pushSubsubsection();
      const title = line.replace("### ", "");
      currentSubsubsection = {
        id: makeIdFromTitle(title),
        title,
        type: null,
        placeholder: "",
        options: [],
        characterLimit: 0,
        required: false,
        hint: "",
        example: "",
      };
    } else if (line.startsWith("Type:")) {
      const val = line.replace("Type:", "").trim();
      if (currentSubsubsection) {
        currentSubsubsection.type = val;
      } else if (currentSubsection) {
        currentSubsection.type = val;
      } else if (currentStep) {
        currentStep.type = val;
      }
    } else if (line.startsWith("Placeholder:")) {
      const val = line.replace("Placeholder:", "").trim();
      if (currentSubsubsection) {
        currentSubsubsection.placeholder = val;
      } else if (currentSubsection) {
        currentSubsection.placeholder = val;
      } else if (currentStep) {
        currentStep.placeholder = val;
      }
    } else if (line.startsWith("Options:")) {
      const val = line.replace("Options:", "").trim();
      const arr = val.split(",").map((opt) => opt.trim());
      if (currentSubsubsection) {
        currentSubsubsection.options = arr;
      } else if (currentSubsection) {
        currentSubsection.options = arr;
      } else if (currentStep) {
        currentStep.options = arr;
      }
    } else if (line.startsWith("Character limit:")) {
      const val = line.replace("Character limit:", "").trim();
      const num = parseInt(val, 10);
      if (currentSubsubsection) {
        currentSubsubsection.characterLimit = Number.isNaN(num) ? 0 : num;
      } else if (currentSubsection) {
        currentSubsection.characterLimit = Number.isNaN(num) ? 0 : num;
      } else if (currentStep) {
        currentStep.characterLimit = Number.isNaN(num) ? 0 : num;
      }
    } else if (line.startsWith("Required:")) {
      const val = line.replace("Required:", "").trim().toLowerCase();
      const req = ["true", "yes", "1"].includes(val);
      if (currentSubsubsection) {
        currentSubsubsection.required = req;
      } else if (currentSubsection) {
        currentSubsection.required = req;
      } else if (currentStep) {
        currentStep.required = req;
      }
    } else if (line.startsWith("Hint:")) {
      const val = line.replace("Hint:", "").trim();
      if (currentSubsubsection) {
        currentSubsubsection.hint = val;
      } else if (currentSubsection) {
        currentSubsection.hint = val;
      } else if (currentStep) {
        currentStep.hint = val;
      }
    } else if (line.startsWith("Example:")) {
      const val = line.replace("Example:", "").trim();
      if (currentSubsubsection) {
        currentSubsubsection.example = val;
      } else if (currentSubsection) {
        currentSubsection.example = val;
      } else if (currentStep) {
        currentStep.example = val;
      }
    }
  }

  pushStep();
  return steps;
}

export default function useMarkdownTemplate() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const local = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setTemplate(parsed);
      } catch (e) {
        console.error("Failed to parse local template data:", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!canFetchRemote()) {
      return;
    }
    (async () => {
      try {
        const resp = await fetch(GIST_URL);
        if (!resp.ok) {
          throw new Error(`Network error: ${resp.status}`);
        }
        const mdText = await resp.text();
        const parsed = parseMarkdown(mdText);
        if (JSON.stringify(parsed) !== JSON.stringify(template)) {
          localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(parsed));
          setTemplate(parsed);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    })();
  }, [template]);

  return {
    template,
    loading: template === null && loading,
    error,
  };
}
