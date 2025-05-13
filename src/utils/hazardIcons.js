import CycloneIconUrl  from "../assets/Icon_Tropical_Cyclone.svg";
import DroughtIconUrl  from "../assets/Icon_Drought.svg";
import FloodIconUrl    from "../assets/Icon_Flood.svg";
import HeatwaveIconUrl from "../assets/Icon_Heatwave.svg";
import DiseaseIconUrl  from "../assets/Icon_Disease.svg";

/**
 * Returns the matching icon URL for the given hazard text.
 * – works with English & French terms
 * – accent-insensitive
 */
export function getHazardIcon(label = "") {
  const txt = label
    .toLowerCase()
    .normalize("NFD") // strip accents
    .replace(/[\u0300-\u036f]/g, "");

  if (txt.includes("cyclone"))                                    return CycloneIconUrl;
  if (txt.includes("drought")   || txt.includes("secheresse"))    return DroughtIconUrl;
  if (txt.includes("flood")     || txt.includes("inondation"))    return FloodIconUrl;
  if (txt.includes("heat")      || txt.includes("canicule"))      return HeatwaveIconUrl;
  if (txt.includes("disease")   || txt.includes("maladie"))       return DiseaseIconUrl;

  return "";
}