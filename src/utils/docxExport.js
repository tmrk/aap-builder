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

function createNormalParagraph(text) {
  return new Paragraph({
    style: "Normal",
    alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text })],
  });
}

/* Numbering config for headings */
function getNumberingOptions(styleName) {
  if (styleName === "Heading1") return { reference: "aap-numbering", level: 0 };
  if (styleName === "Heading2") return { reference: "aap-numbering", level: 1 };
  if (styleName === "Heading3") return { reference: "aap-numbering", level: 2 };
  return undefined;
}

/* Returns an array of paragraphs:
 * - A normal blank line (and an extra one if Heading1)
 * - The heading itself (with or without numbering)
 * - Another blank line
 * If styleName is "Heading1", an extra blank line is inserted before. */
function wrapHeading(text, styleName, withNumbering = true) {
  const numbering = withNumbering ? getNumberingOptions(styleName) : undefined;

  const paragraphs = [];

  // Extra blank line before Heading1
  if (styleName === "Heading1") {
    paragraphs.push(createNormalParagraph(""));
  }

  paragraphs.push(
    createNormalParagraph(""),
    new Paragraph({
      style: styleName,
      numbering,
      children: [new TextRun({ text })],
    }),
    createNormalParagraph("")
  );

  return paragraphs;
}

/* Wraps body text with an empty Normal paragraph before and after for spacing.
   If text is empty, returns two empty paragraphs. */
function wrapContent(text) {
  if (text.trim() === "") {
    return [createNormalParagraph(""), createNormalParagraph("")];
  }
  return [createNormalParagraph(""), createNormalParagraph(text), createNormalParagraph("")];
}

/* Creates a paragraph for table cells, left-aligned, with 10pt text size.
   Optionally bold. */
function createTableCellParagraph(text, options = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: 20, // half-points -> 10pt
        bold: options.bold || false,
      }),
    ],
  });
}

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

/* Main export function to produce the DOCX */
export async function exportToDocx(aapData) {
  // Grab the template from localStorage
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

  // Title at the top
  docContent.push(
    new Paragraph({
      text: "Anticipatory Action Protocol (AAP)",
      style: "Title",
      alignment: AlignmentType.CENTER,
    })
  );
  docContent.push(createNormalParagraph(""));

  // The first section is "summary". It's Heading1 style but excluded from numbering.
  const summarySection = sections.find((sec) => sec.id === "summary");
  if (summarySection) {
    docContent.push(...wrapHeading("Summary", "Heading1", false));
    // If it has subsections, build the table
    const summaryTable = buildAAPSummaryTable(summarySection, aapData);
    if (summaryTable) {
      docContent.push(summaryTable);
    } else {
      docContent.push(...wrapContent("No summary subsections found."));
    }
  }

  // All other sections => Heading1 with numbering
  sections.forEach((section) => {
    if (section.id === "summary") return;

    // Section title as heading1 with numbering
    docContent.push(...wrapHeading(section.title, "Heading1", true));

    // Step-level questions
    if (section.questions && section.questions.length > 0) {
      section.questions.forEach((q) => {
        const ans = aapData?.[section.id]?.[section.id]?.[q.id] || "";
        docContent.push(...wrapHeading(q.label, "Heading2"));
        docContent.push(...wrapContent(ans));
      });
    } else if (section.type) {
      // Single input step
      const ans = aapData?.[section.id]?.[section.id]?.[section.id] || "";
      docContent.push(...wrapContent(ans));
    }

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      section.subsections.forEach((subsec) => {
        docContent.push(...wrapHeading(subsec.title, "Heading2"));
        if (subsec.questions && subsec.questions.length > 0) {
          subsec.questions.forEach((qq) => {
            const ans = aapData?.[section.id]?.[subsec.id]?.[qq.id] || "";
            docContent.push(...wrapHeading(qq.label, "Heading3"));
            docContent.push(...wrapContent(ans));
          });
        } else if (subsec.type) {
          const ans = aapData?.[section.id]?.[subsec.id]?.[subsec.id] || "";
          docContent.push(...wrapContent(ans));
        }
      });
    }
  });

  // Construct the final Document with numbering, styles, and a footer.
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "aap-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1",
              alignment: AlignmentType.LEFT,
              start: 1,
            },
            {
              level: 1,
              format: "decimal",
              text: "%1.%2",
              alignment: AlignmentType.LEFT,
              start: 1,
            },
            {
              level: 2,
              format: "decimal",
              text: "%1.%2.%3",
              alignment: AlignmentType.LEFT,
              start: 1,
            },
          ],
        },
      ],
    },
    styles: {
      default: {
        document: {
          run: { font: "Arial" },
        },
      },
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: { size: 24, color: "000000" },
          paragraph: { alignment: AlignmentType.JUSTIFIED },
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
        children: docContent,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                style: "Normal",
                children: [
                  new TextRun("Page "),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    field: true,
                  }),
                  new TextRun(" of "),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    field: true,
                  }),
                ],
              }),
            ],
          }),
        },
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "AAP-Builder-Export.docx");
}
