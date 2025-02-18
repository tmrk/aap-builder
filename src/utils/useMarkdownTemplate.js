import { useState, useEffect } from "react";

const GIST_URL = import.meta.env.VITE_AAP_TEMPLATE_URL;
const TEMPLATE_STORAGE_KEY = "AAP_MD_TEMPLATE";

function canFetchRemote() {
  return typeof navigator !== "undefined" && navigator.onLine === true;
}

function parseMarkdown(mdText) {
  const lines = mdText.split("\n");
  const steps = [];

  let currentStep = null;
  let currentSubsection = null;

  const makeIdFromTitle = (title) =>
    title.toLowerCase().replace(/\s+/g, "-");

  const pushSubsection = () => {
    if (currentStep && currentSubsection) {
      currentStep.subsections.push(currentSubsection);
      currentSubsection = null;
    }
  };

  const pushStep = () => {
    if (currentStep) {
      pushSubsection();
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
      };
    } else if (line.startsWith("Type:")) {
      const val = line.replace("Type:", "").trim();
      if (currentSubsection) {
        currentSubsection.type = val;
      } else if (currentStep) {
        currentStep.type = val;
      }
    } else if (line.startsWith("Placeholder:")) {
      const val = line.replace("Placeholder:", "").trim();
      if (currentSubsection) {
        currentSubsection.placeholder = val;
      } else if (currentStep) {
        currentStep.placeholder = val;
      }
    } else if (line.startsWith("Options:")) {
      const val = line.replace("Options:", "").trim();
      if (currentSubsection) {
        const arr = val.split(",").map((opt) => opt.trim());
        currentSubsection.options = arr;
      } else if (currentStep) {
        const arr = val.split(",").map((opt) => opt.trim());
        currentStep.options = arr;
      }
    } else if (line.startsWith("Character limit:")) {
      const val = line.replace("Character limit:", "").trim();
      if (currentSubsection) {
        const num = parseInt(val, 10);
        currentSubsection.characterLimit = Number.isNaN(num) ? 0 : num;
      } else if (currentStep) {
        const num = parseInt(val, 10);
        currentStep.characterLimit = Number.isNaN(num) ? 0 : num;
      }
    } else if (line.startsWith("Required:")) {
      const val = line.replace("Required:", "").trim().toLowerCase();
      if (currentSubsection) {
        currentSubsection.required = ["true", "yes", "1"].includes(val);
      } else if (currentStep) {
        currentStep.required = ["true", "yes", "1"].includes(val);
      }
    } else if (line.startsWith("Hint:")) {
      const val = line.replace("Hint:", "").trim();
      if (currentSubsection) {
        currentSubsection.hint = val;
      } else if (currentStep) {
        currentStep.hint = val;
      }
    } else if (line.startsWith("Example:")) {
      const val = line.replace("Example:", "").trim();
      if (currentSubsection) {
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
