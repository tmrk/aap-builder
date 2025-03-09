import { useState, useEffect, useContext } from "react";
import { AAPContext } from "../context/AAPContext";

/**
 * A hook to retrieve a JSON-based template from the store by ID.
 * 
 * @param {string} templateId - ID of the template to fetch
 * @returns { template, loading, error }
 */
export default function useTemplate(templateId) {
  const { store } = useContext(AAPContext);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!templateId) {
      setError("No template ID provided");
      setLoading(false);
      return;
    }
    const templates = store.AAP_TEMPLATES || [];
    const found = templates.find((t) => t.id === templateId);
    if (found) {
      setTemplate(found);
      setLoading(false);
      return;
    }
    setError("Template not found in store");
    setLoading(false);
  }, [templateId, store]);

  return { template, loading, error };
}
