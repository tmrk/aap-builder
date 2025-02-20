export function getSectionStatus(step, aapData) {
  let answeredAny = false;
  let missingRequired = false;
  let exceededCharLimit = false;

  // If the step has subsections, validate each subsection and its sub-subsections
  if (step.subsections && step.subsections.length > 0) {
    for (const subsection of step.subsections) {
      const sectionId = step.id;
      const subsecId = subsection.id;
      const questionId = subsecId;
      
      // Validate the subsection's own input value
      const rawValue = aapData?.[sectionId]?.[subsecId]?.[questionId] || "";
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

      // Now validate any sub-sub-sections (third-level inputs)
      if (subsection.subsubsections && subsection.subsubsections.length > 0) {
        for (const subsub of subsection.subsubsections) {
          const subsubId = subsub.id;
          const rawValSubsub = aapData?.[sectionId]?.[subsecId]?.[subsubId] || "";
          const valSubsub = Array.isArray(rawValSubsub)
            ? rawValSubsub.join(", ")
            : String(rawValSubsub).trim();

          if (valSubsub.length > 0) {
            answeredAny = true;
          }
          if (subsub.required && valSubsub.length === 0) {
            missingRequired = true;
          }
          if (subsub.characterLimit > 0 && valSubsub.length > subsub.characterLimit) {
            exceededCharLimit = true;
          }
        }
      }
    }
  }
  // Otherwise, if the step has no subsections but has its own type (a single input field)
  else if (step.type) {
    const rawValue = aapData?.[step.id]?.[step.id]?.[step.id] || "";
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

  if (!answeredAny) {
    return "unstarted";
  }
  if (missingRequired || exceededCharLimit) {
    return "inprogress";
  }
  return "complete";
}
