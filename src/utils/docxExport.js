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

function blank() {
  // Return a single empty paragraph with Normal style
  return new Paragraph({ style: "Normal", children: [] });
}

/**
 * To avoid fully justified short lines, split multiline text into multiple paragraphs.
 */
function wrapContent(text) {
  if (!text || !text.trim()) {
    return [new Paragraph({ style: "Normal", children: [] })];
  }
  const lines = text.split("\n");
  return lines.map((line) =>
    new Paragraph({
      style: "Normal",
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun(line)],
    })
  );
}

function getNumberingOptions(styleName) {
  if (styleName === "Heading1") return { reference: "aap-numbering", level: 0 };
  if (styleName === "Heading2") return { reference: "aap-numbering", level: 1 };
  if (styleName === "Heading3") return { reference: "aap-numbering", level: 2 };
  return undefined;
}

/**
 * Create a table for the summary section.
 */
function buildAAPSummaryTable(summarySection, aapData) {
  if (!summarySection?.subsections?.length) return null;

  const rows = summarySection.subsections.map((subsec) => {
    const answer = aapData?.[summarySection.id]?.[subsec.id]?.[subsec.id] || "";

    return new TableRow({
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
          children: wrapContent(answer),
        }),
      ],
    });
  });

  return new Table({
    rows,
    style: "AAPTableGrid",
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function wrapHeadingOrType(sectionOrSubsec, fallbackHeading) {
  return fallbackHeading;
}

// Export the document using the AAP data and template stored under "AAP_TEMPLATE"
export async function exportToDocx(aapData) {
  const templateStr = localStorage.getItem("AAP_TEMPLATE");
  let parsedTemplate = null;
  let sections = [];
  if (templateStr) {
    try {
      parsedTemplate = JSON.parse(templateStr);
      // If the stored object has a "template" property, use that.
      if (parsedTemplate && parsedTemplate.template) {
        sections = parsedTemplate.template;
      } else {
        sections = parsedTemplate;
      }
    } catch (err) {
      console.error("Error parsing AAP template from localStorage", err);
    }
  }

  const docContent = [];

  // Title
  docContent.push(
    new Paragraph({
      text: "Anticipatory Action Plan (AAP)",
      style: "Title",
      alignment: AlignmentType.CENTER,
    })
  );
  docContent.push(blank());
  docContent.push(blank());

  // Handle summary section
  const summarySection = sections.find((sec) => sec.id === "summary");
  if (summarySection) {
    docContent.push(wrapHeading("Summary", "Heading1", false));
    docContent.push(blank());
    const summaryTable = buildAAPSummaryTable(summarySection, aapData);
    if (summaryTable) {
      docContent.push(summaryTable);
    } else {
      docContent.push(...wrapContent("No summary subsections found."));
    }
    docContent.push(blank());
    docContent.push(blank());
  }

  // Other sections
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.id === "summary") continue;

    docContent.push(wrapHeading(section.title, "Heading1", true));
    const sectionHasContent =
      (section.questions && section.questions.length > 0) ||
      section.type ||
      (section.subsections && section.subsections.length > 0);
    if (sectionHasContent) {
      docContent.push(blank());
    }

    if (section.questions && section.questions.length > 0) {
      for (const q of section.questions) {
        docContent.push(wrapHeading(q.label, "Heading2", true));
        docContent.push(blank());
        const ans = aapData?.[section.id]?.[section.id]?.[q.id] || "";
        docContent.push(...wrapContent(ans));
        docContent.push(blank());
      }
    } else if (section.type) {
      const ans = aapData?.[section.id]?.[section.id]?.[section.id] || "";
      docContent.push(...wrapContent(ans));
      docContent.push(blank());
    }

    if (section.subsections && section.subsections.length > 0) {
      for (const subsec of section.subsections) {
        docContent.push(wrapHeading(subsec.title, "Heading2", true));
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
          paragraph: {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { line: 276, lineRule: "auto" },
          },
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
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
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

  const hazardType = aapData?.["summary"]?.["hazard"]?.["hazard"] || "UnknownHazard";
  const country = aapData?.["summary"]?.["country"]?.["country"] || "UnknownCountry";
  const custodian =
    aapData?.["summary"]?.["custodian-organisation"]?.["custodian-organisation"] || "UnknownCustodian";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}_${HH}.${min}`;
  const filename = `AAP-${hazardType}-${country}-${custodian}-${formattedDate}.docx`;

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
