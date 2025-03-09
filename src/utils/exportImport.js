import { saveAs } from "file-saver";

export function exportAAPFile(aapFile) {
  const jsonStr = JSON.stringify(aapFile);
  const blob = new Blob([jsonStr], { type: "application/json" });
  saveAs(blob, `AAP_${aapFile.id}.json`);
}

export function importAAPFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsText(file);
  });
}
