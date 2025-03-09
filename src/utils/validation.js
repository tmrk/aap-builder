/**
 * Returns "unstarted", "inprogress", or "complete" for a given step.
 * 
 * - "unstarted": no required or optional fields have any values (nothing entered).
 * - "inprogress": at least one field has a value, but at least one required is empty
 *   or a field exceeds its characterLimit.
 * - "complete": all required fields are filled and within their character limits,
 *   and at least one field has a value.
 */
export function getSectionStatus(step, aapData) {
  // 1) Collect all nodes under `step` that define inputs (node.type is truthy).
  const allNodes = collectAllInputNodes(step);

  let answeredAny = false;
  let missingRequired = false;
  let exceededCharLimit = false;

  // 2) For each node, read its stored value from aapData[step.id][node.id][node.id].
  //    Then update these flags accordingly.
  for (const node of allNodes) {
    const val = getValue(aapData, step.id, node.id);

    // Check if anything is answered
    if (val.length > 0) {
      answeredAny = true;
    }

    // Required fields must not be empty
    if (node.required && val.length === 0) {
      missingRequired = true;
    }

    // Check character limits
    if (node.characterLimit && node.characterLimit > 0 && val.length > node.characterLimit) {
      exceededCharLimit = true;
    }
  }

  // 3) Decide the final status
  if (!answeredAny) {
    return "unstarted";
  }
  if (missingRequired || exceededCharLimit) {
    return "inprogress";
  }
  return "complete";
}

/**
 * Recursively collects every node that can contain an input.
 * That means any node with `node.type` is considered an "input node."
 * 
 * For example, a step might have multiple subsections, which might have subsubsections.
 * This function unrolls that entire tree into a flat array.
 */
function collectAllInputNodes(node, result = []) {
  // If this node is itself an input (node.type is truthy), store it.
  if (node.type) {
    result.push(node);
  }

  // Recurse for subsections
  if (Array.isArray(node.subsections)) {
    for (const child of node.subsections) {
      collectAllInputNodes(child, result);
    }
  }

  // Recurse for subsubsections
  if (Array.isArray(node.subsubsections)) {
    for (const child of node.subsubsections) {
      collectAllInputNodes(child, result);
    }
  }

  return result;
}

/**
 * Retrieves a string value from the aapData at [stepId][nodeId][nodeId].
 * Returns "" if nothing is stored or the path doesn't exist.
 */
function getValue(aapData, stepId, nodeId) {
  const raw = aapData?.[stepId]?.[nodeId]?.[nodeId];
  if (!raw) {
    return "";
  }
  if (Array.isArray(raw)) {
    return raw.join(", ").trim();
  }
  return String(raw).trim();
}
