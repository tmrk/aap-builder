export function getSectionStatus(step, aapData) {
  let answeredAny = false;
  let missingRequired = false;
  let exceededCharLimit = false;

  // If the step has subsections, validate each subsection:
  if (step.subsections && step.subsections.length > 0) {
    for (const subsection of step.subsections) {
      const sectionId = step.id;
      const subsectionId = subsection.id;
      const questionId = subsectionId;

      const rawValue =
        aapData?.[sectionId]?.[subsectionId]?.[questionId] || "";
      const val = Array.isArray(rawValue)
        ? rawValue.join(", ")
        : String(rawValue).trim();

      if (val.length > 0) {
        answeredAny = true;
      }

      if (subsection.required && val.length === 0) {
        missingRequired = true;
      }

      if (subsection.characterLimit > 0 && val.length > subsection.characterLimit) {
        exceededCharLimit = true;
      }
    }
  }
  // If the step has no subsections but has a type, it's a single field:
  else if (step.type) {
    const rawValue =
      aapData?.[step.id]?.[step.id]?.[step.id] || "";
    const val = Array.isArray(rawValue)
      ? rawValue.join(", ")
      : String(rawValue).trim();

    if (val.length > 0) {
      answeredAny = true;
    }

    if (step.required && val.length === 0) {
      missingRequired = true;
    }

    if (step.characterLimit > 0 && val.length > step.characterLimit) {
      exceededCharLimit = true;
    }
  }

  // Now assign status
  if (!answeredAny) {
    return "unstarted";
  }
  if (missingRequired || exceededCharLimit) {
    return "inprogress";
  }
  return "complete";
}
