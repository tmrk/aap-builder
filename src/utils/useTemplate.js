import { useState, useEffect, useContext } from "react";
import { AAPContext } from "../context/AAPContext";

/**
 * A hook to retrieve a JSON-based template from the store by URL (preferred) or legacy ID.
 * If the template is not found locally and the reference looks like a valid URL, it will be
 * fetched over the network, cached into localStorage / AAP_TEMPLATES, and then returned.
 *
 * @param {string} templateRef - URL of the template (new) or ID (legacy)
 * @returns {{template: object|null, loading: boolean, error: string|null}}
 */
export default function useTemplate(templateRef) {
  const { store, addTemplate } = useContext(AAPContext);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveTemplate() {
      if (!templateRef) {
        setError("No template reference provided");
        setLoading(false);
        return;
      }

      const templates = store.AAP_TEMPLATES || [];
      const found = templates.find(
        (t) => t.metadata?.url === templateRef || t.id === templateRef
      );

      if (found) {
        if (!cancelled) {
          setTemplate(found);
          localStorage.setItem("AAP_TEMPLATE", JSON.stringify(found));
          setLoading(false);
        }
        return;
      }

      // Not in cache – if templateRef is a URL try fetching it.
      if (/^https?:\/\//i.test(templateRef)) {
        try {
          const resp = await fetch(templateRef);
          if (!resp.ok) {
            throw new Error(`Network error: ${resp.status}`);
          }
          const jsonData = await resp.json();
          if (!jsonData.template) {
            throw new Error("Invalid template format");
          }

          const fetchedTemplate = {
            id: `url-${Date.now()}`,
            metadata: { ...jsonData.metadata, url: templateRef },
            template: jsonData.template,
          };

          // Add to global store so that subsequent loads are instant
          addTemplate(fetchedTemplate);
          if (!cancelled) {
            setTemplate(fetchedTemplate);
            localStorage.setItem("AAP_TEMPLATE", JSON.stringify(fetchedTemplate));
            setLoading(false);
          }
        } catch (e) {
          if (!cancelled) {
            setError(e.message);
            setLoading(false);
          }
        }
      } else {
        setError("Template not found in cache");
        setLoading(false);
      }
    }

    resolveTemplate();

    return () => {
      cancelled = true;
    };
    // We purposely *exclude* store from deps to avoid infinite loops when addTemplate fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateRef, addTemplate]);

  return { template, loading, error };
}
