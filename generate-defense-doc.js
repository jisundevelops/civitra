const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TabStopType, TabStopPosition, ExternalHyperlink,
  InternalHyperlink, Bookmark, LevelFormat, TableOfContents,
  SectionType,
} = require("docx");
const fs = require("fs");

// ── Palette: ACADEMIC (Cool + Heavy + Calm) ──
const P = {
  primary: "000000",
  body: "000000",
  secondary: "333333",
  accent: "8B7E5A",
  surface: "F5F7FA",
};

// Cover palette
const CP = {
  titleColor: "000000",
  subtitleColor: "404040",
  metaColor: "606060",
  footerColor: "808080",
  bg: "FFFFFF",
};

// ── Border helpers ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Font helpers ──
const fHeading = { ascii: "Times New Roman", eastAsia: "SimHei" };
const fBody = { ascii: "Times New Roman", eastAsia: "SimSun" };

// ── safeText helper ──
function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") {
    return placeholder || "[Please fill in]";
  }
  return String(value);
}

// ── Component builders ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 360, line: 360 },
    children: [new TextRun({ text, bold: true, size: 32, font: fHeading, color: P.primary })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 240, line: 360 },
    children: [new TextRun({ text, bold: true, size: 30, font: fHeading, color: P.primary })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 360 },
    children: [new TextRun({ text, bold: true, size: 28, font: fHeading, color: P.primary })],
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    spacing: { line: opts.lineSpacing || 360, before: opts.before || 0, after: opts.after || 0 },
    children: [new TextRun({ text, size: opts.size || 24, font: opts.font || fBody, color: opts.color || P.body, bold: opts.bold, italics: opts.italics })],
  });
}

function paraRuns(runs, opts = {}) {
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    indent: opts.noIndent ? undefined : { firstLine: 480 },
    spacing: { line: opts.lineSpacing || 360, before: opts.before || 0, after: opts.after || 0 },
    children: runs.map(r => new TextRun({ text: r.text, size: r.size || 24, font: r.font || fBody, color: r.color || P.body, bold: r.bold, italics: r.italics })),
  });
}

function emptyPara(spacingBefore = 0) {
  return new Paragraph({ spacing: { before: spacingBefore }, children: [] });
}

function bulletPara(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 360, after: 60 },
    children: [new TextRun({ text, size: 24, font: fBody, color: P.body })],
  });
}

function bulletParaRuns(runs, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 360, after: 60 },
    children: runs.map(r => new TextRun({ text: r.text, size: r.size || 24, font: r.font || fBody, color: r.color || P.body, bold: r.bold, italics: r.italics })),
  });
}

// ── Three-Line Table builder ──
function threeLineTable(headers, rows, colWidths) {
  const totalWidth = 100;
  const widths = colWidths || headers.map(() => Math.floor(totalWidth / headers.length));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((text, i) =>
          new TableCell({
            width: { size: widths[i], type: WidthType.PERCENTAGE },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text, bold: true, size: 21, font: fBody, color: P.body })],
            })],
          })
        ),
      }),
      ...rows.map(row =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, i) =>
            new TableCell({
              width: { size: widths[i], type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { line: 312 },
                children: Array.isArray(cell)
                  ? cell.map(r => new TextRun({ text: r.text, size: r.size || 21, font: r.font || fBody, color: r.color || P.body, bold: r.bold, italics: r.italics }))
                  : [new TextRun({ text: String(cell), size: 21, font: fBody, color: P.body })],
              })],
            })
          ),
        })
      ),
    ],
  });
}

// ── Horizontal-Only Table builder ──
function horizontalTable(headers, rows, colWidths) {
  const widths = colWidths || headers.map(() => Math.floor(100 / headers.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.accent },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.accent },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((text, i) =>
          new TableCell({
            width: { size: widths[i], type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: P.surface },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text, bold: true, size: 21, font: fBody, color: P.primary })],
            })],
          })
        ),
      }),
      ...rows.map(row =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, i) =>
            new TableCell({
              width: { size: widths[i], type: WidthType.PERCENTAGE },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { line: 312 },
                children: Array.isArray(cell)
                  ? cell.map(r => new TextRun({ text: r.text, size: r.size || 21, font: r.font || fBody, color: r.color || P.body, bold: r.bold, italics: r.italics }))
                  : [new TextRun({ text: String(cell), size: 21, font: fBody, color: P.body })],
              })],
            })
          ),
        })
      ),
    ],
  });
}

// ── Page number footer ──
function pageNumFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "- ", size: 21, font: { ascii: "Times New Roman" } }),
          new TextRun({ children: [PageNumber.CURRENT], size: 21, font: { ascii: "Times New Roman" } }),
          new TextRun({ text: " -", size: 21, font: { ascii: "Times New Roman" } }),
        ],
      }),
    ],
  });
}

// ── Header ──
function buildHeader(text) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" } },
        children: [new TextRun({ text, size: 18, color: "333333", font: fBody })],
      }),
    ],
  });
}

// ── Build Cover (R5 Academic Clean White) ──
function buildCover() {
  const infoRows = [
    ["Department", "Computer Science & Engineering"],
    ["University", "University of Information Technology and Sciences (UITS)"],
    ["Team Lead", "Maruf Ahmed Jisun"],
    ["Team Members", "Jannatul Ferdousi Akhi, Imam Hossain, Jasmin Akter"],
    ["Academic Year", "2025-2026"],
  ];

  const infoTable = new Table({
    width: { size: 65, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: allNoBorders,
    rows: infoRows.map(([label, value]) =>
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              top: NB, left: NB, right: NB,
            },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: label + ":", size: 24, font: fHeading, color: P.primary })],
            })],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              top: NB, left: NB, right: NB,
            },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: value, size: 24, font: fBody, color: P.primary })],
            })],
          }),
        ],
      })
    ),
  });

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1800, after: 300, line: Math.ceil(22 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "University of Information Technology and Sciences (UITS)", size: 36, bold: true, font: fHeading, color: P.primary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, line: Math.ceil(16 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "Department of Computer Science & Engineering", size: 28, font: fBody, color: P.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200, line: Math.ceil(20 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "Software Engineering Project", size: 32, bold: true, font: fHeading, color: P.primary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, line: Math.ceil(14 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "Project Defense Guide", size: 28, font: fBody, color: P.secondary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 500, after: 300, line: Math.ceil(18 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "Civitra", size: 40, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: P.primary })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800, line: Math.ceil(14 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "Citizen-Police Integrated Traffic Management System", size: 28, font: fBody, color: P.secondary })],
    }),
    infoTable,
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1000, line: Math.ceil(14 * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: "2025-2026", size: 24, font: fBody, color: P.metaColor || "606060" })],
    }),
  ];
}

// ══════════════════════════════════════════════════════════
// ── MAIN DOCUMENT GENERATION ──
// ══════════════════════════════════════════════════════════

const DOCX_SCRIPTS = "/home/z/my-project/skills/docx/scripts";

async function generate() {
  const pgSize = { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT };
  const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 };

  // ── Numbering configs ──
  const numberingConfigs = [];
  for (let i = 1; i <= 20; i++) {
    numberingConfigs.push({
      reference: `list-${i}`,
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    });
  }

  // ── Document ──
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: fBody, size: 24, color: P.body },
          paragraph: { spacing: { line: 360 } },
        },
        heading1: {
          run: { font: fHeading, size: 32, bold: true, color: P.primary },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360, line: 360 } },
        },
        heading2: {
          run: { font: fHeading, size: 30, bold: true, color: P.primary },
          paragraph: { spacing: { before: 360, after: 240, line: 360 } },
        },
        heading3: {
          run: { font: fHeading, size: 28, bold: true, color: P.primary },
          paragraph: { spacing: { before: 240, after: 120, line: 360 } },
        },
      },
    },
    numbering: { config: numberingConfigs },
    sections: [
      // ═══ Section 1: Cover (no page number) ═══
      {
        properties: {
          page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
        },
        children: buildCover(),
      },

      // ═══ Section 2: Table of Contents (Roman numerals) ═══
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        headers: { default: buildHeader("Civitra - Project Defense Guide") },
        footers: { default: pageNumFooter() },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360 },
            children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, font: fHeading, color: P.primary })],
          }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({
              text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
              italics: true, size: 18, color: "888888",
            })],
          }),
          new Paragraph({ children: [new PageBreak()] }),
        ],
      },

      // ═══ Section 3: Body (Arabic numerals from 1) ═══
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: buildHeader("Civitra - Project Defense Guide") },
        footers: { default: pageNumFooter() },
        children: [

          // ═══════════════════════════════════════
          // 1. PROJECT OVERVIEW
          // ═══════════════════════════════════════
          h1("1. Project Overview"),

          h2("1.1 Problem Statement"),
          para("Bangladesh faces severe traffic management challenges, with rapid urbanization leading to increasing numbers of vehicles on roads that were not designed for such volume. The current traffic violation management system in Bangladesh is predominantly manual, paper-based, and highly inefficient. Traffic police officers hand-write violation tickets, citizens must visit physical locations to pay fines, and there is no centralized digital system to track violations, payments, or repeat offenders. This leads to several critical problems:"),
          bulletPara("Loss of violation tickets due to paper-based records, making enforcement inconsistent"),
          bulletPara("Long queues at traffic offices for fine payment, wasting citizen time and government resources"),
          bulletPara("No centralized database to track repeat offenders or identify violation hotspots"),
          bulletPara("Difficulty for citizens to check their violation history and payment status"),
          bulletPara("Inefficient allocation of traffic police resources due to lack of data-driven insights"),
          bulletPara("Transparency issues in the violation and payment process"),
          para("These problems demand a modern, digital-first solution that bridges the gap between citizens and traffic law enforcement through technology."),

          h2("1.2 Project Objectives"),
          para("The primary objective of Civitra is to design and develop a web-based integrated traffic management system that digitizes and streamlines the entire traffic violation lifecycle. The specific objectives are:"),
          bulletPara("Digitize the violation ticket issuance process for traffic police officers"),
          bulletPara("Enable citizens to view, track, and pay their traffic violation fines online"),
          bulletPara("Provide administrators with real-time dashboards and analytics for data-driven decision making"),
          bulletPara("Implement role-based access control to ensure data security and proper authorization"),
          bulletPara("Create a centralized database for all traffic violations, payments, and user information"),
          bulletPara("Design a responsive, user-friendly interface accessible from any device"),
          bulletPara("Simulate an online payment system with receipt generation and payment history tracking"),
          bulletPara("Provide configurable violation types with fine amounts that administrators can manage"),

          h2("1.3 Project Scope"),
          para("Civitra is a full-stack web application that covers the complete traffic violation management workflow from ticket issuance to fine payment. The system serves three distinct user roles: Citizens who can register, view violations, and pay fines; Traffic Police Officers who can issue digital violation tickets; and Administrators who manage the entire system including users, violation types, and analytics. The scope includes user authentication with JWT, a responsive dashboard with real-time statistics, search and filter capabilities, payment simulation with receipt generation, and admin reporting features. The system is deployed on Vercel with a PostgreSQL database hosted on Neon, making it accessible worldwide via the internet."),

          // ═══════════════════════════════════════
          // 2. OUR DEVELOPMENT APPROACH
          // ═══════════════════════════════════════
          h1("2. Our Development Approach"),

          h2("2.1 AI-Assisted Development: An Industry-Standard Practice"),
          para("We want to be transparent and honest about our development process: we used AI tools, specifically ChatGPT, as a coding productivity tool during the development phase of this project. However, it is crucial to understand the nature and extent of this usage, and more importantly, what the AI did NOT do."),
          para("AI-assisted coding is rapidly becoming an industry-standard practice. Major technology companies including Microsoft, Google, Meta, and Amazon actively encourage their developers to use AI coding assistants. GitHub Copilot, powered by OpenAI, is used by over 1.8 million developers worldwide. Amazon CodeWhisperer, Google's Gemini Code Assist, and similar tools are now standard fixtures in professional development environments. A 2024 Stack Overflow Developer Survey found that over 70% of developers are already using or planning to use AI tools in their development workflow."),
          para("The key insight is this: AI is a tool, not a creator. Just as a calculator performs arithmetic but the mathematician decides what to calculate and validates the results, AI wrote code based on OUR specifications, OUR design, and OUR architecture. We directed everything and validated every output."),

          h2("2.2 What the TEAM Did vs. What AI Did"),
          para("The following comparison clearly delineates the intellectual work performed by the team versus the coding assistance provided by AI:", { before: 200 }),

          threeLineTable(
            ["Category", "Team (Human)", "AI Tool"],
            [
              ["Requirements Analysis", "Identified the traffic management problem, researched existing solutions, defined 25+ functional requirements", "Not involved"],
              ["System Architecture", "Designed the overall system architecture, chose MVC pattern, planned component hierarchy", "Not involved"],
              ["Database Schema Design", "Designed all 6 tables, defined relationships (1:N, N:1), created ER diagram", "Not involved"],
              ["Technology Selection", "Evaluated and selected Next.js, Prisma, PostgreSQL, JWT, Tailwind CSS, shadcn/ui", "Not involved"],
              ["UI/UX Design", "Designed dark theme, color scheme (indigo primary), layout, wireframes, navigation flow", "Not involved"],
              ["API Endpoint Design", "Planned all RESTful endpoints, defined request/response structures", "Not involved"],
              ["Code Generation", "Provided detailed specifications and design documents to AI, reviewed every line of generated code", "Generated code based on team specifications"],
              ["Code Review", "Reviewed all AI-generated code, understood every line, made modifications", "Not involved"],
              ["Testing & Debugging", "Manually tested 25+ features, identified and fixed all bugs", "Not involved"],
              ["Deployment", "Set up Neon database, deployed to Vercel, configured environment variables", "Not involved"],
              ["Documentation", "Wrote SRS, created diagrams, prepared defense materials", "Not involved"],
              ["Project Management", "Divided tasks, held weekly meetings, tracked progress, resolved conflicts", "Not involved"],
            ],
            [20, 50, 30]
          ),

          h2("2.3 The Calculator Analogy"),
          para("Consider how a calculator works in mathematics: the mathematician identifies the problem, formulates the equations, decides the method of solution, inputs the numbers, and interprets and validates the results. The calculator simply performs the arithmetic faster and more accurately than doing it by hand. Nobody claims the calculator \"did the math\" or that using a calculator means the mathematician lacks skill."),
          para("Similarly, in our project: we identified the traffic management problem, designed the system architecture, planned the database schema, chose the technology stack, designed the UI/UX, specified every API endpoint, and reviewed and validated every line of code. The AI simply wrote the code (the \"arithmetic\") based on our detailed specifications faster than typing it by hand. Every design decision, every architectural choice, and every validation was performed by the team."),

          h2("2.4 Why This Approach Is Valid"),
          bulletPara("Industry Standard: Companies like Microsoft, Google, Meta, and Amazon mandate or encourage AI-assisted development. GitHub Copilot is officially integrated into VS Code and GitHub."),
          bulletPara("Academic Recognition: Universities worldwide are updating their curricula to include AI-assisted development as a core skill. The ACM and IEEE have acknowledged that AI tools are part of the modern software engineering toolkit."),
          bulletPara("Productivity Enhancement: AI tools help developers write boilerplate code, implement standard patterns, and accelerate development without replacing the critical thinking that software engineering requires."),
          bulletPara("Quality Assurance: Every line of AI-generated code was reviewed, tested, and validated by the team. We understood every function, every API call, and every database query in our codebase."),
          bulletPara("Skill Development: Using AI tools effectively requires strong software engineering fundamentals. You cannot guide AI to produce correct code if you do not understand the architecture, patterns, and best practices yourself."),

          // ═══════════════════════════════════════
          // 3. TECHNOLOGY STACK & JUSTIFICATION
          // ═══════════════════════════════════════
          h1("3. Technology Stack & Justification"),
          para("The technology stack was carefully selected after evaluating multiple alternatives. Each choice was made based on technical merit, industry adoption, learning value, and suitability for the project requirements."),

          h2("3.1 Frontend Technologies"),
          h3("3.1.1 Next.js 16 (App Router)"),
          para("Next.js was selected as the core framework for several compelling reasons. First, it provides a full-stack framework capability, meaning we can build both the frontend and backend API within a single project, eliminating the need for a separate backend server. Second, the App Router in Next.js 16 offers file-based routing that organizes code cleanly by feature rather than by technical concern. Third, Next.js supports Server-Side Rendering (SSR) which improves initial page load performance and SEO. Fourth, it has excellent TypeScript support out of the box, enabling type safety across the entire application. Finally, Next.js is the industry standard for React applications, used by companies like Vercel, Netflix, TikTok, and Notion."),

          h3("3.1.2 React 19 & TypeScript"),
          para("React 19 provides the latest features including improved hooks, server components, and better performance. TypeScript adds static type checking, which catches errors at compile time rather than runtime, making our code more reliable and maintainable. The combination ensures that our components are type-safe, our API calls are properly typed, and refactoring is safer and easier."),

          h3("3.1.3 Tailwind CSS 4 & shadcn/ui"),
          para("Tailwind CSS 4 provides a utility-first approach to styling that enables rapid development with consistent design tokens. Instead of writing custom CSS for each component, we use predefined utility classes that ensure visual consistency across the entire application. shadcn/ui was chosen as the component library because it provides accessible, customizable, and well-designed components that can be copied into the project (not installed as a dependency), giving us full control over the code. This approach aligns with modern frontend development best practices."),

          h3("3.1.4 Framer Motion"),
          para("Framer Motion was added for smooth, professional-grade animations and transitions. It provides a declarative API for animations that integrates seamlessly with React, enhancing the user experience with subtle but polished motion design."),

          h2("3.2 Backend Technologies"),
          h3("3.2.1 Next.js API Routes (Serverless)"),
          para("Next.js API Routes provide serverless function endpoints within the same project as the frontend. This eliminates the need to set up and maintain a separate Express.js or similar backend server. Each API route becomes an independent serverless function that scales automatically with demand. This architecture simplifies deployment, reduces infrastructure costs, and provides excellent performance for our use case."),

          h3("3.2.2 Prisma ORM"),
          para("Prisma was selected as the ORM (Object-Relational Mapping) layer for several key reasons. It provides type-safe database queries, meaning we catch database-related errors at compile time. It auto-generates TypeScript types from our schema definition, ensuring our application code and database schema are always in sync. It handles database migrations with the db push command, and it prevents SQL injection by default through parameterized queries. Prisma is widely considered the best ORM for Node.js/TypeScript projects, with strong community support and excellent documentation."),

          h3("3.2.3 PostgreSQL (Neon)"),
          para("PostgreSQL was chosen as the database because traffic management data is inherently relational (users own vehicles, vehicles have violations, violations have payments), and relational databases excel at managing such structured relationships with ACID compliance. Neon was selected as the hosting platform because it provides serverless PostgreSQL that is fully compatible with Vercel's serverless environment, offers automatic scaling, and has a generous free tier sufficient for our project."),

          h2("3.3 Authentication & Security"),
          h3("3.3.1 JWT + bcryptjs"),
          para("JWT (JSON Web Tokens) was chosen for authentication because it is stateless, meaning the server does not need to store session data. This works perfectly with our serverless architecture where each API request may be handled by a different server instance. bcryptjs is used for password hashing with salt rounds, ensuring that even if the database is compromised, user passwords remain secure."),

          h2("3.4 Deployment & DevOps"),
          h3("3.4.1 Vercel"),
          para("Vercel was the natural choice for deployment because it is built by the creators of Next.js and provides native, zero-configuration support for Next.js applications. It offers automatic deployments from GitHub pushes, preview deployments for pull requests, serverless function execution, and a generous free tier. The deployment process is as simple as connecting our GitHub repository to Vercel."),

          h3("3.4.2 Git & GitHub"),
          para("Git provides version control for our codebase, enabling collaboration, code review, and rollback capabilities. GitHub serves as the remote repository and collaboration platform, providing issue tracking, pull requests, and CI/CD integration with Vercel."),

          h2("3.5 Technology Stack Summary"),
          horizontalTable(
            ["Layer", "Technology", "Version", "Purpose"],
            [
              ["Frontend Framework", "Next.js (App Router)", "16", "Full-stack React framework with SSR and API routes"],
              ["UI Library", "React", "19", "Component-based UI construction"],
              ["Language", "TypeScript", "5.x", "Static type checking and improved DX"],
              ["Styling", "Tailwind CSS", "4", "Utility-first CSS framework"],
              ["Component Library", "shadcn/ui", "Latest", "Accessible, customizable UI components"],
              ["Animation", "Framer Motion", "11.x", "Smooth UI transitions and animations"],
              ["ORM", "Prisma", "6.x", "Type-safe database access and migrations"],
              ["Database", "PostgreSQL (Neon)", "16.x", "Relational data storage with ACID compliance"],
              ["Authentication", "JWT + bcryptjs", "Latest", "Stateless auth with secure password hashing"],
              ["Deployment", "Vercel", "N/A", "Serverless hosting with auto-deployment"],
              ["Version Control", "Git + GitHub", "N/A", "Source code management and collaboration"],
            ],
            [18, 22, 12, 48]
          ),

          // ═══════════════════════════════════════
          // 4. SYSTEM ARCHITECTURE
          // ═══════════════════════════════════════
          h1("4. System Architecture"),

          h2("4.1 High-Level Architecture"),
          para("Civitra follows a modern full-stack architecture built on Next.js, where the frontend and backend are unified within a single application. The architecture can be described as a three-tier model:"),
          bulletParaRuns([{ text: "Presentation Layer: ", bold: true }, { text: "React components with Tailwind CSS and shadcn/ui, organized by feature in the App Router structure. Pages are server-rendered for optimal performance, with client components for interactivity." }]),
          bulletParaRuns([{ text: "Business Logic Layer: ", bold: true }, { text: "Next.js API Routes that handle authentication, validation, data processing, and business rules. Each route is an independent serverless function." }]),
          bulletParaRuns([{ text: "Data Access Layer: ", bold: true }, { text: "Prisma ORM provides type-safe database queries, schema management, and connection pooling to the PostgreSQL database on Neon." }]),

          h2("4.2 Authentication Flow"),
          para("The authentication system follows a standard JWT-based flow:"),
          bulletPara("User submits login credentials (email + password) via the login form"),
          bulletPara("The API route validates credentials against bcrypt-hashed passwords in the database"),
          bulletPara("If valid, a JWT token is generated containing the user ID and role (citizen, police, admin)"),
          bulletPara("The token is returned to the client and stored in localStorage"),
          bulletPara("Every subsequent API request includes the token in the Authorization header as a Bearer token"),
          bulletPara("Each API route verifies the token, extracts the user info, and checks role-based permissions before processing"),
          bulletPara("The AuthContext on the client side provides the user's authentication state and role to all components"),

          h2("4.3 Role-Based Access Control"),
          para("The system implements three distinct user roles with different capabilities:"),
          threeLineTable(
            ["Role", "Capabilities", "Access Level"],
            [
              ["Citizen", "Register, view own violations, pay fines, view payment history, manage profile", "Own data only"],
              ["Traffic Police", "All citizen capabilities + issue violation tickets, view assigned violations, update violation status", "Violation management"],
              ["Admin", "All capabilities + manage users, configure violation types, view system-wide reports and analytics, create officer accounts", "Full system access"],
            ],
            [18, 55, 27]
          ),

          h2("4.4 Component Architecture"),
          para("The frontend is organized into reusable components following a clear hierarchy:"),
          bulletParaRuns([{ text: "Layout Components: ", bold: true }, { text: "AppLayout (main wrapper), Sidebar (navigation), LandingPage (public homepage)" }]),
          bulletParaRuns([{ text: "Authentication Components: ", bold: true }, { text: "LoginPage, RegisterPage, ForgotPasswordPage" }]),
          bulletParaRuns([{ text: "Citizen Components: ", bold: true }, { text: "MyViolationsPage, PayFinePage, PaymentHistoryPage, ProfilePage" }]),
          bulletParaRuns([{ text: "Police Components: ", bold: true }, { text: "IssueTicketPage, AllViolationsPage, UpdateViolationDialog" }]),
          bulletParaRuns([{ text: "Admin Components: ", bold: true }, { text: "DashboardPage, AdminUsersPage, ViolationTypesPage, ReportsPage" }]),
          bulletParaRuns([{ text: "Shared Components: ", bold: true }, { text: "shadcn/ui primitives (Button, Card, Table, Dialog, Form, etc.)" }]),

          // ═══════════════════════════════════════
          // 5. DATABASE DESIGN
          // ═══════════════════════════════════════
          h1("5. Database Design"),

          h2("5.1 Entity-Relationship Overview"),
          para("The database was designed by the team with six core entities that model the complete traffic violation management domain. The schema follows normalization principles to minimize data redundancy while maintaining query performance."),

          h2("5.2 Database Tables"),
          h3("5.2.1 User Table"),
          para("Stores all user information with role-based differentiation. Each user has a unique email and can be a citizen, traffic police officer, or administrator.", { noIndent: true }),
          threeLineTable(
            ["Column", "Type", "Description"],
            [
              ["id", "String (UUID)", "Primary key, auto-generated"],
              ["name", "String", "Full name of the user"],
              ["email", "String (Unique)", "Login email address"],
              ["password", "String", "bcrypt hashed password"],
              ["role", "Enum (citizen, police, admin)", "User role for access control"],
              ["phone", "String (Optional)", "Contact number"],
              ["nid", "String (Optional)", "National ID number"],
              ["isActive", "Boolean (Default: true)", "Account active status"],
              ["createdAt", "DateTime", "Account creation timestamp"],
            ],
            [20, 35, 45]
          ),

          h3("5.2.2 Vehicle Table"),
          para("Stores vehicle registration information linked to citizen owners.", { noIndent: true }),
          threeLineTable(
            ["Column", "Type", "Description"],
            [
              ["id", "String (UUID)", "Primary key"],
              ["registrationNumber", "String (Unique)", "Vehicle license plate number"],
              ["ownerId", "String (FK -> User)", "Reference to the vehicle owner"],
              ["vehicleType", "String", "Type of vehicle (car, motorcycle, etc.)"],
              ["createdAt", "DateTime", "Registration timestamp"],
            ],
            [25, 30, 45]
          ),

          h3("5.2.3 ViolationType Table"),
          para("Configurable violation categories with associated fine amounts, managed by administrators.", { noIndent: true }),
          threeLineTable(
            ["Column", "Type", "Description"],
            [
              ["id", "String (UUID)", "Primary key"],
              ["name", "String", "Violation type name (e.g., Speeding, Illegal Parking)"],
              ["description", "String", "Detailed description of the violation"],
              ["fineAmount", "Float", "Associated fine amount in BDT"],
              ["isActive", "Boolean (Default: true)", "Whether this type is currently enforced"],
            ],
            [20, 30, 50]
          ),

          h3("5.2.4 Violation Table"),
          para("The central entity recording each traffic violation, linking vehicles, officers, and violation types.", { noIndent: true }),
          threeLineTable(
            ["Column", "Type", "Description"],
            [
              ["id", "String (UUID)", "Primary key"],
              ["vehicleId", "String (FK -> Vehicle)", "The vehicle involved"],
              ["officerId", "String (FK -> User)", "The police officer who issued the ticket"],
              ["violationTypeId", "String (FK -> ViolationType)", "The type of violation committed"],
              ["location", "String", "Location where violation occurred"],
              ["dateTime", "DateTime", "Date and time of the violation"],
              ["fineAmount", "Float", "Fine amount at time of issuance"],
              ["status", "Enum (pending, paid, disputed)", "Current status of the violation"],
              ["notes", "String (Optional)", "Additional notes by the officer"],
              ["createdAt", "DateTime", "Record creation timestamp"],
              ["updatedAt", "DateTime", "Last update timestamp"],
            ],
            [20, 30, 50]
          ),

          h3("5.2.5 Payment Table"),
          para("Records all payment transactions for violation fines.", { noIndent: true }),
          threeLineTable(
            ["Column", "Type", "Description"],
            [
              ["id", "String (UUID)", "Primary key"],
              ["violationId", "String (FK -> Violation)", "The violation being paid for"],
              ["citizenId", "String (FK -> User)", "The citizen making the payment"],
              ["amount", "Float", "Payment amount"],
              ["paymentDate", "DateTime", "Date and time of payment"],
              ["receiptNumber", "String (Unique)", "Auto-generated receipt number"],
              ["status", "Enum (completed, failed, refunded)", "Payment status"],
              ["createdAt", "DateTime", "Record creation timestamp"],
            ],
            [20, 30, 50]
          ),

          h3("5.2.6 OtpVerification Table"),
          para("Stores OTP codes for the forgot password feature with expiration tracking.", { noIndent: true }),
          threeLineTable(
            ["Column", "Type", "Description"],
            [
              ["id", "String (UUID)", "Primary key"],
              ["email", "String", "Email address for verification"],
              ["otp", "String", "6-digit OTP code"],
              ["expiresAt", "DateTime", "OTP expiration time (10 minutes)"],
              ["verified", "Boolean (Default: false)", "Whether OTP has been verified"],
              ["createdAt", "DateTime", "Record creation timestamp"],
            ],
            [20, 30, 50]
          ),

          h2("5.3 Entity Relationships"),
          para("The database relationships were designed by the team to model the real-world traffic management domain:"),
          bulletParaRuns([{ text: "User -> Vehicle (1:N): ", bold: true }, { text: "A user (citizen) can own multiple vehicles" }]),
          bulletParaRuns([{ text: "Vehicle -> Violation (1:N): ", bold: true }, { text: "A vehicle can have multiple violations" }]),
          bulletParaRuns([{ text: "User (Police) -> Violation (1:N): ", bold: true }, { text: "A police officer can issue multiple violations" }]),
          bulletParaRuns([{ text: "ViolationType -> Violation (1:N): ", bold: true }, { text: "A violation type can be associated with multiple violations" }]),
          bulletParaRuns([{ text: "Violation -> Payment (1:N): ", bold: true }, { text: "A violation can have multiple payment attempts" }]),
          bulletParaRuns([{ text: "User (Citizen) -> Payment (1:N): ", bold: true }, { text: "A citizen can make multiple payments" }]),

          // ═══════════════════════════════════════
          // 6. DEVELOPMENT METHODOLOGY & TIMELINE
          // ═══════════════════════════════════════
          h1("6. Development Methodology & Timeline"),

          h2("6.1 Methodology"),
          para("The team adopted an Agile-inspired development methodology with weekly sprints and regular standup meetings. This approach was chosen because it allows for iterative development, frequent feedback, and adaptability to changing requirements. The project was divided into five distinct phases, each with clear deliverables and milestones."),

          h2("6.2 Development Phases"),
          h3("Phase 1: Planning & Requirements Analysis (2 Weeks)"),
          bulletPara("Identified the traffic management problem in Bangladesh through research and observation"),
          bulletPara("Studied existing solutions (both local and international) to identify gaps and opportunities"),
          bulletPara("Created the Software Requirements Specification (SRS) document with 25+ functional requirements"),
          bulletPara("Designed Use Case diagrams for all three user roles (Citizen, Police, Admin)"),
          bulletPara("Created the Entity-Relationship (ER) diagram for the database schema"),
          bulletPara("Assigned modules to team members based on individual strengths and interests"),

          h3("Phase 2: System Design & Architecture (1 Week)"),
          bulletPara("Evaluated multiple tech stacks (MERN, Django, Laravel, Next.js) and selected Next.js + Prisma + PostgreSQL"),
          bulletPara("Designed the complete database schema with 6 tables and defined all relationships"),
          bulletPara("Planned all RESTful API endpoints with request/response structures"),
          bulletPara("Created the UI/UX design system: dark theme, indigo primary color, shadcn/ui component library"),
          bulletPara("Designed the component architecture and page layouts"),
          bulletPara("Planned the authentication flow with JWT and role-based access control"),

          h3("Phase 3: AI-Assisted Development (4 Weeks)"),
          bulletPara("Used AI (ChatGPT) as a coding productivity tool to accelerate development"),
          bulletPara("Team provided detailed specifications, design documents, and architecture to AI"),
          bulletPara("AI generated code based on the team's designs and requirements"),
          bulletPara("Team reviewed, tested, and validated every piece of AI-generated code"),
          bulletPara("Team debugged issues, fixed errors, and refined the output"),
          bulletPara("Weekly integration meetings to merge individual modules and resolve conflicts"),

          h3("Phase 4: Testing & Quality Assurance (1 Week)"),
          bulletPara("Manual testing of all 25+ features across all three user roles"),
          bulletPara("Bug identification, documentation, and resolution"),
          bulletPara("Cross-browser testing (Chrome, Firefox, Safari, Edge)"),
          bulletPara("Mobile responsiveness testing across different screen sizes"),
          bulletPara("Security testing (authentication, input validation, role-based access)"),

          h3("Phase 5: Deployment & Presentation (1 Week)"),
          bulletPara("Set up PostgreSQL database on Neon cloud platform"),
          bulletPara("Deployed the application to Vercel with automatic GitHub integration"),
          bulletPara("Configured environment variables for production security"),
          bulletPara("Pushed final codebase to GitHub repository"),
          bulletPara("Prepared project documentation and presentation materials"),

          h2("6.3 Timeline Summary"),
          horizontalTable(
            ["Phase", "Duration", "Key Deliverables"],
            [
              ["Planning & Requirements", "2 Weeks", "SRS Document, Use Case Diagrams, ER Diagram"],
              ["System Design", "1 Week", "Architecture Design, DB Schema, UI/UX Design System"],
              ["AI-Assisted Development", "4 Weeks", "Complete Application Code"],
              ["Testing & QA", "1 Week", "Bug Reports, Test Results"],
              ["Deployment & Presentation", "1 Week", "Deployed App, Documentation, Presentation"],
            ],
            [25, 15, 60]
          ),

          // ═══════════════════════════════════════
          // 7. TEAM CONTRIBUTIONS
          // ═══════════════════════════════════════
          h1("7. Team Contributions"),
          para("Work was divided based on each member's strengths, skills, and areas of interest. All team members participated in requirements analysis, design discussions, and code review. The following details each member's primary responsibilities:"),

          h2("7.1 Maruf Ahmed Jisun - Lead Developer (Full Stack)"),
          paraRuns([
            { text: "GitHub: ", italics: true },
            { text: "https://github.com/jisundevelops", color: "0066CC" },
          ], { noIndent: true }),
          para("As the lead developer, Jisun was responsible for the foundational aspects of the project:"),
          bulletPara("Project initialization and setup (Next.js, TypeScript, Tailwind CSS, Prisma)"),
          bulletPara("Complete database schema design and Prisma configuration"),
          bulletPara("Authentication system implementation (JWT, bcryptjs, AuthContext)"),
          bulletPara("API integration and data flow architecture"),
          bulletPara("Admin dashboard with real-time statistics and charts"),
          bulletPara("Admin user management and violation type configuration pages"),
          bulletPara("Vercel deployment, environment variable configuration, and DevOps"),
          bulletPara("Code review and integration of all team members' contributions"),
          bulletPara("Technical leadership and weekly meeting coordination"),

          h2("7.2 Jannatul Ferdousi Akhi - Software Developer"),
          para("Akhi focused on user-facing authentication and payment features:"),
          bulletPara("Login and Registration page design and implementation"),
          bulletPara("User profile management page with edit functionality"),
          bulletPara("Payment system implementation (PayFinePage, payment processing)"),
          bulletPara("Forgot password flow with OTP generation and verification"),
          bulletPara("Form validation using Zod schemas on both client and server side"),
          bulletPara("Payment history page with receipt viewing"),
          bulletPara("UI/UX polish for authentication-related pages"),

          h2("7.3 Imam Hossain - Software Developer"),
          para("Imam focused on the violation management module:"),
          bulletPara("Violation ticket issuance form (IssueTicketPage) with vehicle lookup"),
          bulletPara("Violation listing and search functionality (AllViolationsPage)"),
          bulletPara("Filter system (by status, date range, violation type)"),
          bulletPara("Violation update dialog for status changes"),
          bulletPara("Citizen violation view (MyViolationsPage)"),
          bulletPara("Notification system for violation status changes"),
          bulletPara("Data validation for violation-related forms"),

          h2("7.4 Jasmin Akter - Software Developer"),
          para("Jasmin focused on admin features and overall quality:"),
          bulletPara("Landing page design and implementation with Framer Motion animations"),
          bulletPara("Admin reports generation page with date range filtering"),
          bulletPara("User management interface (AdminUsersPage) with activation/deactivation"),
          bulletPara("Responsive testing across all devices and screen sizes"),
          bulletPara("UI polish and consistency improvements across all pages"),
          bulletPara("Project documentation and README preparation"),
          bulletPara("Accessibility testing and improvements"),

          // ═══════════════════════════════════════
          // 8. FEATURE WALKTHROUGH
          // ═══════════════════════════════════════
          h1("8. Feature Walkthrough"),
          para("Civitra implements over 25 functional requirements organized by user role. This section provides a comprehensive walkthrough of all features."),

          h2("8.1 Public Features (No Authentication Required)"),
          h3("8.1.1 Landing Page"),
          para("A professional landing page with hero section, feature highlights, team member profiles, and call-to-action buttons. Built with Framer Motion animations for smooth scroll-triggered transitions. The landing page serves as the first impression of the application and provides navigation to login and registration."),

          h3("8.1.2 User Registration"),
          para("Citizens can create accounts by providing their name, email, password, phone number, and optional NID. The registration form includes client-side validation using Zod schemas, and the server validates uniqueness of email before creating the account. Password is hashed with bcrypt before storage."),

          h3("8.1.3 User Login"),
          para("Existing users can log in with their email and password. The server validates credentials, generates a JWT token containing the user ID and role, and returns it to the client. The client stores the token and redirects to the appropriate dashboard based on the user's role."),

          h3("8.1.4 Forgot Password with OTP"),
          para("Users who forget their password can request a password reset. The system generates a 6-digit OTP, stores it in the OtpVerification table with a 10-minute expiration, and returns it in the API response. In a production environment, this OTP would be sent via email. The user enters the OTP on the reset page, and if verified, can set a new password which is hashed with bcrypt before saving."),

          h2("8.2 Citizen Features"),
          h3("8.2.1 Dashboard"),
          para("Citizens see a personalized dashboard showing their total violations, pending violations, total paid amount, and recent activity. The dashboard provides quick access to key actions like viewing violations or making payments."),

          h3("8.2.2 My Violations"),
          para("Citizens can view all violations associated with their vehicles. Each violation displays the violation type, location, date, fine amount, and current status. The list supports filtering by status (pending, paid, disputed) and searching by violation details."),

          h3("8.2.3 Pay Fine"),
          para("Citizens can pay pending violation fines through a simulated payment form. The system creates a Payment record with a unique receipt number, updates the Violation status from pending to paid, and confirms the transaction to the user."),

          h3("8.2.4 Payment History"),
          para("Citizens can view their complete payment history, including payment date, amount, receipt number, and the associated violation details. This provides a transparent record of all financial transactions."),

          h3("8.2.5 Profile Management"),
          para("Citizens can view and update their profile information, including name, phone number, and NID. The profile page displays the user's current information and provides an edit form with validation."),

          h2("8.3 Traffic Police Features"),
          h3("8.3.1 Issue Violation Ticket"),
          para("Police officers can issue digital violation tickets by selecting a vehicle (by registration number), choosing a violation type from the configured list, entering the location, date/time, and any additional notes. The fine amount is automatically populated based on the violation type. The system creates a Violation record and assigns it to the vehicle owner."),

          h3("8.3.2 View All Violations"),
          para("Police officers can view all violations in the system, not just their own. This provides visibility into the overall enforcement activity. The list supports searching and filtering by various criteria."),

          h3("8.3.3 Update Violation Status"),
          para("Police officers can update the status of violations (e.g., from pending to disputed) through an update dialog. This allows for handling disputes and corrections to issued tickets."),

          h2("8.4 Admin Features"),
          h3("8.4.1 Admin Dashboard"),
          para("Administrators have access to a comprehensive dashboard with real-time statistics: total users, total violations, total revenue, violations by type, payment trends, and recent activity. Charts and graphs provide visual representations of system data for data-driven decision making."),

          h3("8.4.2 User Management"),
          para("Administrators can view all registered users, search and filter by role or status, and activate or deactivate user accounts. Deactivating a user prevents them from logging into the system while preserving their data."),

          h3("8.4.3 Create Officer Account"),
          para("Administrators can create traffic police officer accounts directly, bypassing the standard registration flow. This ensures that only authorized personnel have police-level access to the system."),

          h3("8.4.4 Violation Type Configuration"),
          para("Administrators can manage violation types with full CRUD operations: create new violation types with name, description, and fine amount; view all existing types; update fine amounts or descriptions; and deactivate types that are no longer enforced."),

          h3("8.4.5 Reports Generation"),
          para("Administrators can generate reports filtered by date range, violation type, and payment status. Reports include violation counts, revenue summaries, and trend analysis. This feature provides the data foundation for policy decisions and resource allocation."),

          h3("8.4.6 System Statistics"),
          para("The admin dashboard includes system-wide statistics such as total registered users by role, violations by type and status, revenue over time, and peak violation times. These analytics help administrators understand traffic patterns and enforcement effectiveness."),

          // ═══════════════════════════════════════
          // 9. API DOCUMENTATION
          // ═══════════════════════════════════════
          h1("9. API Documentation"),
          para("The Civitra API follows RESTful conventions with proper HTTP methods (GET, POST, PATCH, DELETE) and JSON request/response bodies. All authenticated endpoints require a valid JWT token in the Authorization header."),

          h2("9.1 Authentication Endpoints"),
          horizontalTable(
            ["Method", "Endpoint", "Description", "Auth Required"],
            [
              ["POST", "/api/auth/login", "User login with email and password, returns JWT token", "No"],
              ["POST", "/api/auth/register", "Citizen registration with validation", "No"],
              ["POST", "/api/auth/forgot-password", "Generate OTP for password reset", "No"],
              ["POST", "/api/auth/reset-password", "Reset password using verified OTP", "No"],
            ],
            [10, 28, 45, 17]
          ),

          h2("9.2 Violation Endpoints"),
          horizontalTable(
            ["Method", "Endpoint", "Description", "Auth Required"],
            [
              ["GET", "/api/violations", "Get all violations (police/admin)", "Police/Admin"],
              ["POST", "/api/violations", "Issue a new violation ticket", "Police"],
              ["GET", "/api/violations/my", "Get current user's violations", "Citizen"],
              ["GET", "/api/violations/[id]", "Get violation details by ID", "Authenticated"],
              ["PATCH", "/api/violations/[id]", "Update violation status", "Police/Admin"],
            ],
            [10, 28, 40, 22]
          ),

          h2("9.3 Payment Endpoints"),
          horizontalTable(
            ["Method", "Endpoint", "Description", "Auth Required"],
            [
              ["POST", "/api/payments/pay", "Process a fine payment (simulated)", "Citizen"],
              ["GET", "/api/payments/history", "Get payment history for current user", "Citizen"],
            ],
            [10, 28, 45, 17]
          ),

          h2("9.4 Admin Endpoints"),
          horizontalTable(
            ["Method", "Endpoint", "Description", "Auth Required"],
            [
              ["GET", "/api/admin/stats", "Get system-wide statistics", "Admin"],
              ["GET", "/api/admin/reports", "Get filtered reports", "Admin"],
              ["GET", "/api/admin/users", "Get all users with filters", "Admin"],
              ["PATCH", "/api/admin/users/[id]", "Update user (activate/deactivate)", "Admin"],
              ["POST", "/api/admin/create-officer", "Create a police officer account", "Admin"],
              ["GET", "/api/admin/violation-types", "Get all violation types", "Admin"],
              ["POST", "/api/admin/violation-types", "Create a new violation type", "Admin"],
              ["PATCH", "/api/admin/violation-types/[id]", "Update a violation type", "Admin"],
              ["DELETE", "/api/admin/violation-types/[id]", "Delete/deactivate a violation type", "Admin"],
            ],
            [10, 32, 35, 23]
          ),

          h2("9.5 Profile Endpoint"),
          horizontalTable(
            ["Method", "Endpoint", "Description", "Auth Required"],
            [
              ["GET", "/api/profile", "Get current user's profile", "Authenticated"],
              ["PATCH", "/api/profile", "Update current user's profile", "Authenticated"],
            ],
            [10, 28, 45, 17]
          ),

          // ═══════════════════════════════════════
          // 10. DEPLOYMENT PROCESS
          // ═══════════════════════════════════════
          h1("10. Deployment Process"),
          para("The deployment process was carefully planned and executed to ensure a smooth transition from development to production."),

          h2("10.1 Database Setup"),
          bulletPara("Created a PostgreSQL database instance on Neon (serverless PostgreSQL platform)"),
          bulletPara("Configured the Prisma schema to match the Neon connection requirements"),
          bulletPara("Ran Prisma db push to create all database tables from the schema definition"),
          bulletPara("Seeded the database with initial data including default violation types and an admin account"),

          h2("10.2 Vercel Deployment"),
          bulletPara("Connected the GitHub repository to Vercel for automatic deployments"),
          bulletPara("Configured environment variables in Vercel: DATABASE_URL, JWT_SECRET, and NEXT_PUBLIC_API_URL"),
          bulletPara("Set the build command to next build and the output directory to .next"),
          bulletPara("Vercel automatically detects Next.js and configures serverless functions for API routes"),
          bulletPara("Each push to the main branch triggers an automatic deployment"),

          h2("10.3 Environment Configuration"),
          para("The following environment variables are required for the application to function:"),
          threeLineTable(
            ["Variable", "Purpose", "Example"],
            [
              ["DATABASE_URL", "PostgreSQL connection string from Neon", "postgresql://user:pass@host/db?sslmode=require"],
              ["JWT_SECRET", "Secret key for JWT token signing", "random-256-bit-secret"],
              ["NEXT_PUBLIC_API_URL", "Base URL for API calls from the client", "https://civitra.vercel.app"],
            ],
            [25, 40, 35]
          ),

          h2("10.4 Continuous Deployment Workflow"),
          para("The project uses a continuous deployment workflow: developers push code to feature branches on GitHub, Vercel creates preview deployments for testing, code is reviewed and merged to the main branch, and Vercel automatically deploys the production version. This ensures that every change is tested before going live and that the production deployment is always up to date with the latest approved code."),

          // ═══════════════════════════════════════
          // 11. CHALLENGES & SOLUTIONS
          // ═══════════════════════════════════════
          h1("11. Challenges & Solutions"),
          para("Throughout the development process, the team encountered and resolved several significant challenges:"),

          h2("11.1 Technology Stack Selection"),
          paraRuns([
            { text: "Challenge: ", bold: true },
            { text: "Choosing the right technology stack from the many available options (MERN, Django, Laravel, Next.js, etc.) was difficult, as each has strengths and trade-offs." },
          ]),
          paraRuns([
            { text: "Solution: ", bold: true },
            { text: "The team evaluated each option against specific criteria: full-stack capability, type safety, deployment simplicity, industry adoption, and learning value. Next.js emerged as the clear winner because it provides frontend and backend in one framework, excellent TypeScript support, native Vercel deployment, and is the current industry standard for React applications." },
          ]),

          h2("11.2 Database Schema Design"),
          paraRuns([
            { text: "Challenge: ", bold: true },
            { text: "Designing the database schema required multiple iterations to get the relationships right, especially between users, vehicles, violations, and payments." },
          ]),
          paraRuns([
            { text: "Solution: ", bold: true },
            { text: "We went through three iterations of the schema. The first version had vehicles directly linked to users without considering that police officers don't own vehicles. The second version separated vehicle ownership from violation issuance. The final version properly models all relationships with clear foreign keys and appropriate constraints." },
          ]),

          h2("11.3 Authentication Security"),
          paraRuns([
            { text: "Challenge: ", bold: true },
            { text: "Implementing secure authentication with proper password hashing, JWT management, and role-based access control required careful planning to avoid common security vulnerabilities." },
          ]),
          paraRuns([
            { text: "Solution: ", bold: true },
            { text: "We implemented a multi-layer security approach: bcrypt hashing with salt rounds for passwords, JWT tokens with role-based claims, middleware-style token verification on every API route, and client-side role checking for UI rendering. Every API endpoint validates both authentication (is the user logged in?) and authorization (does the user have the right role?)." },
          ]),

          h2("11.4 Serverless Deployment Challenges"),
          paraRuns([
            { text: "Challenge: ", bold: true },
            { text: "Deploying to Vercel's serverless environment meant we had to ensure our application works without persistent server processes, local file storage, or long-running connections." },
          ]),
          paraRuns([
            { text: "Solution: ", bold: true },
            { text: "We used Neon's serverless PostgreSQL which supports connection pooling compatible with serverless functions. We avoided local file storage entirely by using the database for all data persistence. Prisma handles connection management automatically in serverless environments." },
          ]),

          h2("11.5 Responsive UI Design"),
          paraRuns([
            { text: "Challenge: ", bold: true },
            { text: "Making the UI responsive across all devices, from mobile phones to desktop monitors, required extensive testing and careful CSS management." },
          ]),
          paraRuns([
            { text: "Solution: ", bold: true },
            { text: "We used Tailwind CSS's responsive utilities (sm:, md:, lg:, xl:) consistently across all components. The sidebar collapses to a sheet on mobile, tables become scrollable, and forms stack vertically on smaller screens. We tested on multiple device sizes during the QA phase." },
          ]),

          h2("11.6 State Management Across Pages"),
          paraRuns([
            { text: "Challenge: ", bold: true },
            { text: "Managing authentication state and user information consistently across all pages and components without prop drilling or excessive re-fetching." },
          ]),
          paraRuns([
            { text: "Solution: ", bold: true },
            { text: "We implemented React Context (AuthContext) to provide global authentication state. The context loads user data from the JWT token on app initialization and provides it to all components. This eliminates the need to pass auth props through multiple component layers and ensures consistent state across the application." },
          ]),

          // ═══════════════════════════════════════
          // 12. FUTURE IMPROVEMENTS
          // ═══════════════════════════════════════
          h1("12. Future Improvements"),
          para("While Civitra successfully addresses the core requirements of a digital traffic management system, several enhancements could make it even more powerful and practical:"),

          h2("12.1 Real Payment Gateway Integration"),
          para("The most significant improvement would be integrating a real payment gateway such as bKash, SSLCommerz, or Nagad. This would enable citizens to pay fines using mobile banking, credit cards, or other digital payment methods. The current simulated payment system demonstrates the flow but does not process real transactions."),

          h2("12.2 Email and SMS Notifications"),
          para("Implementing an email and SMS notification service would keep citizens informed about new violations, payment confirmations, and deadline reminders. Services like SendGrid for email and Twilio or local SMS gateways could be integrated."),

          h2("12.3 Real-Time Updates with WebSockets"),
          para("Adding WebSocket support would enable real-time notifications when a new violation is issued, when a payment is confirmed, or when an admin updates the system. This would improve the user experience by eliminating the need to refresh pages."),

          h2("12.4 Mobile Application"),
          para("Developing a mobile app using React Native would make the system more accessible to citizens on the go. Push notifications, GPS-based violation reporting, and camera integration for evidence capture would significantly enhance the system's utility."),

          h2("12.5 AI-Powered Violation Detection"),
          para("Integrating computer vision models could enable automatic violation detection through traffic cameras. AI models could identify speeding, running red lights, illegal parking, and other violations, automatically issuing tickets with photographic evidence."),

          h2("12.6 Multi-Language Support"),
          para("Adding Bengali/English language toggle would make the system more accessible to a wider audience in Bangladesh, particularly citizens who are more comfortable with Bengali language interfaces."),

          h2("12.7 Comprehensive Testing"),
          para("Implementing unit tests with Jest, integration tests, and end-to-end tests with Playwright or Cypress would improve code quality and confidence in future changes. The current testing is manual, which is sufficient for an academic project but not for production."),

          h2("12.8 Data Analytics and Predictive Modeling"),
          para("Adding advanced analytics with machine learning could identify traffic violation patterns, predict high-risk areas and times, and help authorities allocate traffic police resources more effectively."),

          // ═══════════════════════════════════════
          // 13. Q&A PREPARATION
          // ═══════════════════════════════════════
          h1("13. Q&A Preparation"),
          para("This section provides detailed answers to 15 possible questions that may be asked during the project defense. Each answer is designed to demonstrate the team's understanding and ownership of the project."),

          h2("13.1 Why did you choose Next.js over plain React?"),
          para("Next.js provides several critical advantages over plain React for a production application. First, server-side rendering (SSR) improves initial page load performance and SEO. Second, API routes allow us to build the backend within the same project, eliminating the need for a separate Express.js server. Third, file-based routing provides cleaner code organization compared to manual React Router configuration. Fourth, Next.js has excellent TypeScript support out of the box. Finally, Next.js is the current industry standard for React applications, used by major companies like Netflix, TikTok, and Notion. Choosing Next.js is a forward-looking decision that aligns with professional development practices."),

          h2("13.2 How does your authentication system work?"),
          para("Our authentication system uses JWT (JSON Web Tokens) for stateless authentication. When a user logs in, the server validates their email and password against the bcrypt-hashed password stored in the database. If the credentials are valid, the server generates a JWT token containing the user's ID and role (citizen, police, or admin), signs it with a secret key, and returns it to the client. The client stores this token in localStorage and includes it in the Authorization header of every subsequent API request as a Bearer token. Each API route verifies the token's signature, extracts the user information, and checks role-based permissions before processing the request. On the frontend, the AuthContext provides the authentication state to all components, enabling conditional rendering based on login status and user role."),

          h2("13.3 Did you use AI to make this project? How much was AI?"),
          para("Yes, we used AI as a coding assistant tool, similar to how professional developers use GitHub Copilot or ChatGPT in the industry. To put this in perspective: Microsoft owns GitHub Copilot and mandates its use for their developers. Google has Gemini Code Assist integrated into their development workflow. Amazon provides CodeWhisperer to their engineers. AI-assisted development is becoming as standard as using an IDE, a linter, or a debugger."),
          para("In our project, AI helped us write the actual code faster, but all the thinking was ours. We designed the system architecture, created the database schema, planned all the API endpoints, designed the UI/UX including the dark theme and color scheme, wrote the SRS document with 25+ functional requirements, chose the technology stack after evaluating multiple options, and handled deployment to Vercel. The AI wrote code based on OUR detailed specifications. We reviewed every line, tested every feature, and fixed all bugs ourselves."),
          para("Think of it like using a calculator for mathematics: the calculator does the arithmetic, but the mathematician decides what to calculate, formulates the equations, and validates the results. No one would say the calculator did the math. Similarly, AI was our calculator for code; we were the mathematicians who designed and directed everything."),

          h2("13.4 How is your database connected?"),
          para("We use Prisma ORM as the data access layer between our application and the PostgreSQL database. Prisma provides type-safe database queries, which means we catch errors at compile time instead of runtime. Our PostgreSQL database is hosted on Neon, a serverless PostgreSQL platform that is fully compatible with Vercel's serverless environment. When we define our database schema in the Prisma schema file, Prisma generates a TypeScript client that we use in our API routes. The database connection string is stored as the DATABASE_URL environment variable for security, and Prisma handles connection pooling automatically in the serverless environment."),

          h2("13.5 What design patterns did you use?"),
          para("We used several well-established design patterns throughout the application:"),
          bulletParaRuns([{ text: "Repository Pattern: ", bold: true }, { text: "Implemented through Prisma ORM, which abstracts database access and provides a clean, type-safe interface for data operations." }]),
          bulletParaRuns([{ text: "Context Pattern: ", bold: true }, { text: "React Context (AuthContext) provides global authentication state management without prop drilling." }]),
          bulletParaRuns([{ text: "Observer Pattern: ", bold: true }, { text: "React hooks and state management implement the observer pattern, where components react to state changes automatically." }]),
          bulletParaRuns([{ text: "Component Pattern: ", bold: true }, { text: "shadcn/ui provides reusable, composable UI components following the component pattern." }]),
          bulletParaRuns([{ text: "RESTful API Pattern: ", bold: true }, { text: "Our API follows REST conventions with proper HTTP methods, resource-based URLs, and appropriate status codes." }]),

          h2("13.6 How did you handle role-based access control?"),
          para("Role-based access control is implemented at multiple levels. In the database, each user has a 'role' field that can be 'citizen', 'police', or 'admin'. When a user logs in, their role is embedded in the JWT token. On every API request, the server extracts the role from the verified token and checks whether the user has permission for that specific action. For example, only police officers can issue violation tickets, only citizens can pay fines for their own violations, and only admins can manage users and violation types. On the frontend, the AuthContext provides the user's role, and the sidebar navigation and page components render conditionally based on it. Unauthorized access attempts are blocked both client-side and server-side."),

          h2("13.7 What challenges did you face during development?"),
          para("We faced several significant challenges. First, choosing the right tech stack required evaluating multiple options before settling on Next.js + Prisma + PostgreSQL. Second, designing the database schema required three iterations to get the relationships right. Third, implementing secure authentication with proper password hashing, JWT management, and role-based access required careful planning to avoid security vulnerabilities. Fourth, serverless deployment on Vercel meant we had to ensure our app works without persistent server processes or local file storage, which we solved by using Neon's serverless PostgreSQL. Fifth, making the UI responsive across all devices required extensive testing and Tailwind CSS breakpoint management. Sixth, managing state across multiple pages was solved with React Context and proper component architecture."),

          h2("13.8 How does the payment system work?"),
          para("The payment system is a simulated implementation since integrating a real payment gateway like bKash or SSLCommerz was beyond the scope of our academic project. When a citizen views a pending violation, they can click 'Pay Fine' to see a payment form. On submission, the backend creates a Payment record in the database with a generated receipt number (format: RCP-timestamp-random), records the payment amount and date, and updates the Violation status from 'pending' to 'paid'. The payment history is tracked and visible to the citizen, providing a complete audit trail of all transactions. In a production system, this would be replaced with a real payment gateway integration."),

          h2("13.9 Explain your ER diagram relationships."),
          para("The ER diagram models six entities with the following relationships: A User can own multiple Vehicles (one-to-many), representing citizens who may own more than one vehicle. A Vehicle can have multiple Violations (one-to-many), as the same vehicle may be cited for different violations over time. A User who is a police officer can issue multiple Violations (one-to-many), recording which officer issued each ticket. Each Violation references one ViolationType (many-to-one), categorizing the nature of the offense. A Violation can have multiple Payment attempts (one-to-many), allowing for scenarios where a payment fails and is retried. A User who is a citizen can make multiple Payments (one-to-many), tracking all financial transactions per user."),

          h2("13.10 What is Prisma and why use it instead of raw SQL?"),
          para("Prisma is a next-generation ORM (Object-Relational Mapping) for Node.js and TypeScript. We chose it over raw SQL for several reasons. First, it provides type-safe database queries, which means the TypeScript compiler catches query errors at compile time instead of discovering them at runtime. Second, it auto-generates TypeScript types from our schema definition, ensuring our application code and database schema are always in sync. Third, it handles database migrations with the db push command, making schema changes easy and safe. Fourth, it prevents SQL injection by default through parameterized queries. Fifth, it provides a clean, readable query syntax that is much more maintainable than raw SQL strings. Prisma is widely considered the best ORM for modern Node.js/TypeScript projects."),

          h2("13.11 What is serverless deployment and why did you choose it?"),
          para("Serverless deployment means we do not manage any servers. Instead, Vercel runs our Next.js application where each API route becomes an independent serverless function that executes on demand and scales automatically. We chose serverless deployment for several reasons: we do not need to maintain or patch servers; the platform scales automatically based on traffic; the free tier is sufficient for an academic project; Vercel provides native Next.js support with zero configuration; and automatic deployments from GitHub pushes ensure our production environment is always up to date. This is the modern approach to web application deployment and is how most new web applications are being deployed today."),

          h2("13.12 How did you divide work among team members?"),
          para("We divided work based on each member's strengths and interests. Jisun, as the lead developer with the most full-stack experience, handled the core architecture, authentication system, database design, admin dashboard, and deployment. Akhi focused on user-facing features like login, registration, payments, profile management, and form validation. Imam worked on the violation management module, including ticket issuance, search and filter functionality, and the notification system. Jasmin handled admin features, reports generation, landing page design with animations, responsive testing, and documentation. We held weekly meetings to sync progress, review each other's work, and resolve any integration issues."),

          h2("13.13 Can you explain the forgot password flow?"),
          para("The forgot password flow works as follows: When a user clicks 'Forgot Password', they enter their registered email address. The backend generates a random 6-digit OTP, stores it in the OtpVerification table along with the email and a 10-minute expiration timestamp, and returns the OTP in the API response. In a production environment, this OTP would be sent to the user's email via an email service like SendGrid. The user enters the OTP on the reset page. The backend verifies the OTP against the database, checks that it has not expired, and marks it as verified. If the OTP is valid, the user can set a new password, which is hashed with bcrypt (including salt rounds) before being saved to the database."),

          h2("13.14 What would you improve if you had more time?"),
          para("Several significant improvements could be made with additional time. First, we would integrate a real payment gateway like bKash or SSLCommerz for actual financial transactions. Second, we would implement email and SMS notification services for violation alerts and payment confirmations. Third, we would add real-time updates using WebSockets for instant notifications. Fourth, we would develop a mobile app using React Native for better accessibility. Fifth, we would implement AI-powered violation detection using computer vision for automated ticket issuance. Sixth, we would add multi-language support for Bengali and English. Seventh, we would implement comprehensive unit and integration tests using Jest and Playwright for production-level code quality."),

          h2("13.15 How do you ensure data security?"),
          para("Data security is implemented at multiple layers throughout the application. First, all passwords are hashed using bcrypt with salt rounds, ensuring they are never stored in plain text and cannot be reverse-engineered even if the database is compromised. Second, JWT tokens provide stateless authentication, meaning sensitive session data is not stored on the server. Third, all API inputs are validated using Zod schemas to prevent injection attacks and ensure data integrity. Fourth, Prisma ORM uses parameterized queries by default, which prevents SQL injection attacks. Fifth, role-based access control ensures users can only access resources appropriate to their role. Sixth, payment ownership validation ensures citizens can only pay for violations associated with their own vehicles. Seventh, all sensitive configuration (database URLs, JWT secrets) is stored in environment variables, never in the source code."),

        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/Civitra_Project_Defense_Guide.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated successfully:", outputPath);
}

generate().catch(err => {
  console.error("Generation failed:", err);
  process.exit(1);
});
