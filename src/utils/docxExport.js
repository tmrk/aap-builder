import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Footer,
  PageNumber,
} from "docx";

// Create a Normal paragraph with line-height 1.15
function createNormalParagraph(text) {
  return new Paragraph({
    style: "Normal",
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 276, lineRule: "auto" },
    children: [new TextRun({ text })],
  });
}

// Returns a completely blank Normal paragraph.
function blank() {
  return createNormalParagraph("");
}

// wrapHeading now returns ONLY the heading paragraph (no trailing blank).
function wrapHeading(text, styleName, withNumbering = true) {
  const numbering = withNumbering ? getNumberingOptions(styleName) : undefined;
  return new Paragraph({
    style: styleName,
    numbering,
    children: [
      new TextRun({
        text,
        size: (!withNumbering && styleName === "Heading1") ? 32 : undefined,
      }),
    ],
  });
}

// wrapContent returns the content paragraphs (with no extra blank lines).
function wrapContent(text) {
  if (text.trim() === "") {
    return [createNormalParagraph("")];
  }
  return [createNormalParagraph(text)];
}

// Numbering configuration for headings.
function getNumberingOptions(styleName) {
  if (styleName === "Heading1") return { reference: "aap-numbering", level: 0 };
  if (styleName === "Heading2") return { reference: "aap-numbering", level: 1 };
  if (styleName === "Heading3") return { reference: "aap-numbering", level: 2 };
  return undefined;
}

// Create a paragraph for table cells.
function createTableCellParagraph(text, options = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: 20, // 10pt (half-points)
        bold: options.bold || false,
      }),
    ],
  });
}

// Build the summary table (always iterates over all subsections).
function buildAAPSummaryTable(summarySection, aapData) {
  if (!summarySection.subsections || summarySection.subsections.length === 0) {
    return null;
  }
  const rows = [];
  summarySection.subsections.forEach((subsec) => {
    const answer = aapData?.[summarySection.id]?.[subsec.id]?.[subsec.id] || "";
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3260, type: WidthType.DXA },
            margins: { top: 113, bottom: 113, left: 113, right: 113 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: subsec.title,
                    size: 20,
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            margins: { top: 113, bottom: 113, left: 113, right: 113 },
            children: [createTableCellParagraph(answer)],
          }),
        ],
      })
    );
  });
  return new Table({
    rows,
    style: "AAPTableGrid",
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// Main export function.
export async function exportToDocx(aapData) {
  // Retrieve the Markdown template.
  const templateStr = localStorage.getItem("AAP_MD_TEMPLATE");
  let sections = [];
  if (templateStr) {
    try {
      sections = JSON.parse(templateStr);
    } catch (err) {
      console.error("Error parsing AAP template from localStorage", err);
    }
  }
  const docContent = [];

  // Add the document title.
  docContent.push(
    new Paragraph({
      text: "Anticipatory Action Protocol (AAP)",
      style: "Title",
      alignment: AlignmentType.CENTER,
    })
  );
  // Two blank lines after the title.
  docContent.push(blank());
  docContent.push(blank());

  // Process the summary section.
  const summarySection = sections.find((sec) => sec.id === "summary");
  if (summarySection) {
    // Add Summary heading (un-numbered Heading1).
    docContent.push(wrapHeading("Summary", "Heading1", false));
    // One blank line between heading and content.
    docContent.push(blank());
    const summaryTable = buildAAPSummaryTable(summarySection, aapData);
    if (summaryTable) {
      docContent.push(summaryTable);
    } else {
      docContent.push(...wrapContent("No summary subsections found."));
    }
    // After summary, next heading is Heading1 → insert TWO blank lines.
    docContent.push(blank());
    docContent.push(blank());
  }

  // Process all other sections.
  // (All section headings are Heading1.)
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.id === "summary") continue;

    // Add section heading.
    docContent.push(wrapHeading(section.title, "Heading1", true));
    // If section has content, add ONE blank line between heading and content.
    const sectionHasContent =
      (section.questions && section.questions.length > 0) ||
      section.type ||
      (section.subsections && section.subsections.length > 0);
    if (sectionHasContent) {
      docContent.push(blank());
    }

    // Process step-level questions (if any).
    if (section.questions && section.questions.length > 0) {
      for (const q of section.questions) {
        docContent.push(wrapHeading(q.label, "Heading2", true));
        // One blank line between Heading2 and its content.
        docContent.push(blank());
        const ans = aapData?.[section.id]?.[section.id]?.[q.id] || "";
        docContent.push(...wrapContent(ans));
        // After each question block, add ONE blank line.
        docContent.push(blank());
      }
    } else if (section.type) {
      const ans = aapData?.[section.id]?.[section.id]?.[section.id] || "";
      docContent.push(...wrapContent(ans));
      docContent.push(blank());
    }

    // Process subsections.
    if (section.subsections && section.subsections.length > 0) {
      for (const subsec of section.subsections) {
        // Add subsection heading (Heading2).
        docContent.push(wrapHeading(subsec.title, "Heading2", true));
        // If subsection has content, add ONE blank line between heading and content.
        const subsecHasContent =
          (subsec.questions && subsec.questions.length > 0) ||
          subsec.type ||
          (subsec.subsubsections && subsec.subsubsections.length > 0);
        if (subsecHasContent) {
          docContent.push(blank());
        }
        if (subsec.questions && subsec.questions.length > 0) {
          for (const qq of subsec.questions) {
            docContent.push(wrapHeading(qq.label, "Heading3", true));
            docContent.push(blank());
            const ans = aapData?.[section.id]?.[subsec.id]?.[qq.id] || "";
            docContent.push(...wrapContent(ans));
            docContent.push(blank());
          }
        } else if (subsec.type) {
          const ans = aapData?.[section.id]?.[subsec.id]?.[subsec.id] || "";
          docContent.push(...wrapContent(ans));
          docContent.push(blank());
        }
        // Process sub‑sub‑sections.
        if (subsec.subsubsections && subsec.subsubsections.length > 0) {
          for (const subsub of subsec.subsubsections) {
            docContent.push(wrapHeading(subsub.title, "Heading3", true));
            docContent.push(blank());
            const ans = aapData?.[section.id]?.[subsec.id]?.[subsub.id] || "";
            docContent.push(...wrapContent(ans));
            docContent.push(blank());
          }
        }
      }
    }

    // After finishing a section, if there is another section coming,
    // the next heading will be Heading1 so insert TWO blank lines.
    let hasNext = false;
    for (let j = i + 1; j < sections.length; j++) {
      if (sections[j].id !== "summary") {
        hasNext = true;
        break;
      }
    }
    if (hasNext) {
      docContent.push(blank());
      docContent.push(blank());
    }
  }

  // Construct the final Document with 2cm margins (approx. 1134 twips).
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "aap-numbering",
          levels: [
            { level: 0, format: "decimal", text: "%1", alignment: AlignmentType.LEFT, start: 1 },
            { level: 1, format: "decimal", text: "%1.%2", alignment: AlignmentType.LEFT, start: 1 },
            { level: 2, format: "decimal", text: "%1.%2.%3", alignment: AlignmentType.LEFT, start: 1 },
          ],
        },
      ],
    },
    styles: {
      default: { document: { run: { font: "Arial" } } },
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: { size: 24, color: "000000" },
          paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 276, lineRule: "auto" } },
        },
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, font: "Arial", color: "2FAB16" },
          paragraph: { alignment: AlignmentType.CENTER },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 44, bold: true, color: "2FAB16", allCaps: true },
          paragraph: { alignment: AlignmentType.LEFT },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, color: "2FAB16", allCaps: true },
          paragraph: { alignment: AlignmentType.LEFT },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, color: "000000" },
          paragraph: { alignment: AlignmentType.LEFT },
        },
        {
          id: "Heading4",
          name: "Heading 4",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, color: "000000" },
          paragraph: { alignment: AlignmentType.LEFT },
        },
      ],
      tableStyles: [
        {
          id: "AAPTableGrid",
          name: "AAPTableGrid",
          basedOn: "TableNormal",
          unhideWhenUsed: true,
          uiPriority: 99,
          run: { size: 20 },
          table: {
            margins: { top: 113, bottom: 113, left: 113, right: 113 },
            width: { size: 100, type: WidthType.PERCENTAGE },
          },
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } },
        children: docContent,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                style: "Normal",
                children: [
                  new TextRun("Page "),
                  new TextRun({ children: [PageNumber.CURRENT], field: true }),
                  new TextRun(" of "),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], field: true }),
                ],
              }),
            ],
          }),
        },
      },
    ],
  });

  // Build filename dynamically.
  const hazardType = aapData?.["summary"]?.["hazard"]?.["hazard"] || "UnknownHazard";
  const country = aapData?.["summary"]?.["country"]?.["country"] || "UnknownCountry";
  const custodian = aapData?.["summary"]?.["custodian-organisation"]?.["custodian-organisation"] || "UnknownCustodian";
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}_${HH}:${min}`;
  const filename = `AAP-${hazardType}-${country}-${custodian}-${formattedDate}.docx`;

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
