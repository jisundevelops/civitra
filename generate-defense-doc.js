const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents, LevelFormat, SectionType,
} = require("docx");
const fs = require("fs");

// ============================================================
// PALETTE — DM-1 Deep Cyan (Tech / AI / Digital)
// ============================================================
const P = {
  primary: "0A1628",
  body: "1A2B40",
  secondary: "6878A0",
  accent: "5B8DB8",
  surface: "F4F8FC",
};

const coverPalette = {
  bg: "0B1C2C",
  titleColor: "FFFFFF",
  subtitleColor: "B0B8C0",
  metaColor: "90989F",
  accent: "529286",
  footerColor: "687078",
};

// ============================================================
// HELPERS
// ============================================================
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100, line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: P.primary, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } })],
  });
}

function boldBody(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [
      new TextRun({ text: label, bold: true, size: 24, color: P.primary, font: { ascii: "Times New Roman", eastAsia: "SimHei" } }),
      new TextRun({ text, size: 24, color: P.body, font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}

function spacer(pts) {
  return new Paragraph({ spacing: { before: pts } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Table helpers
const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: P.accent },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: P.accent },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D8E0" },
  insideVertical: { style: BorderStyle.NONE },
};

const headerShading = { type: ShadingType.CLEAR, fill: "1B6B7A" };
const altShading = { type: ShadingType.CLEAR, fill: P.surface };
const whiteShading = { type: ShadingType.CLEAR, fill: "FFFFFF" };

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: headerShading,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 22, color: "FFFFFF", font: { ascii: "Times New Roman" } })] })],
  });
}

function dataCell(text, width, isAlt) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: isAlt ? altShading : whiteShading,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 22, color: P.body, font: { ascii: "Times New Roman" } })] })],
  });
}

function makeTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h, i) => headerCell(h, colWidths[i] * 100 / totalWidth)),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          cantSplit: true,
          children: row.map((c, ci) => dataCell(c, colWidths[ci] * 100 / totalWidth, ri % 2 === 0)),
        })
      ),
    ],
  });
}

// ============================================================
// COVER PAGE — R1 (Pure Paragraph Left) with DM-1 palette
// ============================================================
function buildCover() {
  const padL = 1200, padR = 800;
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: coverPalette.accent, space: 12 };

  const children = [];

  // Top spacing
  children.push(new Paragraph({ spacing: { before: 3600 } }));

  // English label
  children.push(new Paragraph({
    indent: { left: padL, right: padR }, spacing: { after: 600 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: coverPalette.accent, space: 8 } },
    children: [new TextRun({ text: "C I V I T R A", size: 20, color: coverPalette.accent, font: { ascii: "Calibri" }, characterSpacing: 60 })],
  }));

  // Title line 1
  children.push(new Paragraph({
    indent: { left: padL },
    spacing: { after: 100, line: 880, lineRule: "atLeast" },
    children: [new TextRun({ text: "Citizen-Police Integrated", size: 72, bold: true, color: coverPalette.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
  }));

  // Title line 2
  children.push(new Paragraph({
    indent: { left: padL },
    spacing: { after: 400, line: 880, lineRule: "atLeast" },
    children: [new TextRun({ text: "Traffic Management System", size: 72, bold: true, color: coverPalette.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
  }));

  // Subtitle
  children.push(new Paragraph({
    indent: { left: padL }, spacing: { after: 1200 },
    children: [new TextRun({ text: "Project Defense Guide", size: 28, color: coverPalette.subtitleColor, font: { ascii: "Arial" } })],
  }));

  // Meta info with accent border
  const metaLines = [
    "University of Information Technology and Sciences (UITS)",
    "Department of Computer Science & Engineering",
    "Team: Maruf Ahmed Jisun | Jannatul Ferdousi Akhi | Imam Hossain | Jasmin Akter",
    "Academic Year 2024-2025",
  ];

  for (const line of metaLines) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 100 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 22, color: coverPalette.metaColor, font: { ascii: "Arial" } })],
    }));
  }

  // Bottom spacing
  children.push(new Paragraph({ spacing: { before: 800 } }));

  // Footer line
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: coverPalette.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: "Software Engineering Project", size: 18, color: coverPalette.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                                                " }),
      new TextRun({ text: "2025", size: 18, color: coverPalette.footerColor, font: { ascii: "Arial" } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg },
        borders: noBorders,
        children,
      })],
    })],
  })];
}

// ============================================================
// TOC PAGE
// ============================================================
function buildTocPage() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, font: { ascii: "Times New Roman", eastAsia: "SimHei" } })],
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
  ];
}

// ============================================================
// BODY CONTENT — 13 Sections
// ============================================================
function buildBody() {
  const content = [];

  // ============================================================
  // 1. PROJECT OVERVIEW
  // ============================================================
  content.push(h1("1. Project Overview"));

  content.push(body("Civitra (Citizen-Police Integrated Traffic Management System) is a full-stack web application designed to modernize and digitize the traffic violation management process in Bangladesh. The traditional traffic management system in Bangladesh relies heavily on paper-based violation tickets, manual fine collection, and fragmented communication between citizens, traffic police, and administrative authorities. This leads to inefficiency, corruption, lost records, and a lack of transparency."));

  content.push(body("Civitra addresses these problems by providing a unified digital platform where traffic police officers can issue digital violation tickets, citizens can view and pay their fines online, and administrators can manage users, monitor violations, and generate reports. The system implements role-based access control with three distinct user roles: Citizen, Traffic Police Officer, and Admin, each with tailored functionality and dashboards."));

  content.push(body("The project was developed as a Software Engineering course project at the University of Information Technology and Sciences (UITS) by a team of four CSE students. The development followed an Agile-inspired methodology across five phases spanning approximately 10 weeks, from requirements gathering through deployment."));

  content.push(h2("1.1 Problem Statement"));

  content.push(body("Bangladesh faces significant challenges in traffic management. The existing system suffers from: (a) Paper-based violation tickets that are easily lost, damaged, or forged; (b) No centralized database for tracking violations and payments; (c) Citizens have no convenient way to check their violation history or pay fines; (d) Traffic police officers lack digital tools for efficient ticket issuance; (e) Administrative oversight is minimal, with no real-time statistics or reporting capabilities; (f) The payment collection process is opaque and prone to corruption."));

  content.push(h2("1.2 Project Objectives"));

  content.push(body("The primary objectives of the Civitra project are: (1) To develop a web-based platform for digital violation ticket issuance and management; (2) To enable citizens to view their violations and pay fines online through a simulated payment gateway; (3) To provide traffic police with a digital tool for issuing and tracking violation tickets; (4) To implement an admin dashboard with real-time statistics, user management, and reporting features; (5) To ensure secure authentication and role-based access control; (6) To design a responsive and user-friendly interface accessible on both desktop and mobile devices."));

  content.push(h2("1.3 Scope"));

  content.push(body("Civitra is a web application targeting three stakeholder groups: citizens who own vehicles and may receive traffic violations, traffic police officers who issue violations, and system administrators who manage the platform. The system covers the complete lifecycle of a traffic violation: from issuance by an officer, through notification to the citizen, to payment and record-keeping. The payment system is simulated (no real payment gateway integration) as this is an academic project. The system does not handle real-time GPS tracking, automated violation detection via cameras, or integration with government databases."));

  // ============================================================
  // 2. TECHNOLOGY STACK & JUSTIFICATION
  // ============================================================
  content.push(pageBreak());
  content.push(h1("2. Technology Stack and Justification"));

  content.push(body("The technology stack for Civitra was carefully selected to balance modern development practices, team expertise, project requirements, and deployment considerations. Each technology choice was evaluated against alternatives and justified based on specific criteria."));

  content.push(makeTable(
    ["Technology", "Version / Tool", "Purpose"],
    [
      ["Next.js", "16 (App Router)", "Full-stack React framework with SSR and API routes"],
      ["React", "19", "Component-based UI library"],
      ["TypeScript", "5.x", "Type-safe JavaScript for fewer runtime errors"],
      ["Tailwind CSS", "4", "Utility-first CSS framework for rapid styling"],
      ["shadcn/ui", "Latest", "Accessible, customizable component library"],
      ["Framer Motion", "11.x", "Animation library for UI transitions"],
      ["Prisma ORM", "6.x", "Type-safe database ORM for PostgreSQL"],
      ["PostgreSQL", "Neon Hosted", "Relational database for structured data"],
      ["JWT + bcryptjs", "Latest", "Stateless authentication and password hashing"],
      ["Vercel", "Cloud", "Deployment platform with native Next.js support"],
      ["Git + GitHub", "Latest", "Version control and code collaboration"],
    ],
    [25, 25, 50]
  ));

  content.push(spacer(200));

  content.push(h2("2.1 Why Next.js over Plain React?"));

  content.push(body("Next.js was chosen over plain React for several compelling reasons. First, Next.js provides server-side rendering (SSR), which improves initial page load performance and SEO. Second, Next.js includes API routes, allowing us to build the backend within the same project, eliminating the need for a separate Express.js server. Third, the App Router in Next.js 16 provides file-based routing with layouts, loading states, and error boundaries built in. Fourth, Next.js has first-class TypeScript support and excellent developer experience with features like fast refresh. Finally, deployment to Vercel is seamless with zero configuration, which significantly reduced our DevOps overhead."));

  content.push(h2("2.2 Why Prisma ORM?"));

  content.push(body("Prisma was selected as our ORM for its type-safe database access. With Prisma, we define our database schema in a single schema.prisma file, and Prisma generates a fully typed client that provides auto-completion and compile-time error checking for all database queries. This eliminates entire categories of bugs, including SQL injection and typo-based errors. Prisma also provides easy schema migration with the db push command, intuitive relation handling, and excellent documentation. Compared to alternatives like TypeORM or raw SQL, Prisma offers a superior developer experience with less boilerplate code."));

  content.push(h2("2.3 Why PostgreSQL on Neon?"));

  content.push(body("PostgreSQL was chosen because our data is inherently relational: users have vehicles, vehicles have violations, violations have payments. A relational database naturally models these relationships with foreign keys, joins, and constraints, ensuring data integrity. We chose Neon as the hosting platform because it provides serverless PostgreSQL with auto-scaling, branching for development, and a generous free tier. The serverless nature of Neon complements our serverless deployment on Vercel, making the entire stack serverless and cost-effective."));

  content.push(h2("2.4 Why JWT for Authentication?"));

  content.push(body("JSON Web Tokens (JWT) were chosen for authentication because they are stateless. The server does not need to store session data; instead, the token itself contains the user's identity and role. This works perfectly with serverless architecture where each API route invocation is independent. When a user logs in, the server validates credentials against bcrypt-hashed passwords, generates a JWT containing the user ID and role, and sends it to the client. The client stores the token in localStorage and includes it in the Authorization header of every subsequent API request. The server verifies the token on each request using a secret key."));

  content.push(h2("2.5 Why shadcn/ui and Tailwind CSS?"));

  content.push(body("shadcn/ui was chosen because it provides accessible, well-designed components that can be fully customized. Unlike traditional component libraries that enforce a specific look, shadcn/ui copies component source code directly into the project, giving developers complete control. It is built on Radix UI primitives, ensuring WCAG accessibility compliance. Tailwind CSS complements shadcn/ui by providing utility-first classes for rapid, consistent styling. The combination enables rapid prototyping with a polished, professional appearance. The dark theme with indigo as the primary color was chosen to give the application a modern, authoritative feel appropriate for a government-adjacent system."));

  content.push(h2("2.6 Why Vercel for Deployment?"));

  content.push(body("Vercel is the company behind Next.js, and their platform provides native, zero-configuration deployment for Next.js applications. Each API route becomes a serverless function that executes on demand, scaling automatically with traffic. Vercel provides free SSL certificates, global CDN for static assets, preview deployments for every pull request, and environment variable management. The free tier is sufficient for an academic project, and the deployment process is as simple as connecting a GitHub repository."));

  // ============================================================
  // 3. SYSTEM ARCHITECTURE
  // ============================================================
  content.push(pageBreak());
  content.push(h1("3. System Architecture"));

  content.push(body("Civitra follows a modern full-stack architecture where the frontend and backend are unified within a single Next.js application. The architecture can be described as a three-tier model: the Presentation Layer (React components with shadcn/ui), the Business Logic Layer (Next.js API Routes), and the Data Layer (PostgreSQL via Prisma ORM)."));

  content.push(h2("3.1 Architecture Overview"));

  content.push(body("The application uses the Next.js App Router pattern. Pages are organized in the src/app directory following the file-based routing convention. Each page imports React components from src/components/civitra/. API routes are defined in src/app/api/ following RESTful conventions. The Prisma client is initialized in src/lib/db.ts as a singleton to prevent connection pool exhaustion in serverless environments."));

  content.push(h2("3.2 Frontend Architecture"));

  content.push(body("The frontend is built with React 19 components organized by feature. The main layout component (AppLayout) includes a responsive Sidebar and top navigation bar. Each feature has its own page component (e.g., DashboardPage, IssueTicketPage, PayFinePage). Authentication state is managed globally using React Context (AuthContext), which provides the current user, their role, and authentication methods to all components. Conditional rendering based on user role ensures that citizens, police officers, and admins see only their authorized features."));

  content.push(body("The UI uses shadcn/ui components (Button, Card, Dialog, Table, Input, Select, Badge, etc.) styled with Tailwind CSS. Framer Motion provides subtle animations for page transitions and interactive elements. The color scheme uses a dark background (#0f172a) with indigo (#6366f1) as the primary accent color, creating a professional and modern appearance."));

  content.push(h2("3.3 Backend Architecture"));

  content.push(body("The backend consists of Next.js API Routes organized in the src/app/api/ directory. Each route file exports standard HTTP method handlers (GET, POST, PATCH, DELETE). Authentication is enforced via a shared utility function (src/lib/auth.ts) that extracts and verifies the JWT token from the Authorization header. Role-based access control is implemented by checking the user's role from the decoded token before allowing access to specific endpoints."));

  content.push(body("Input validation is performed using Zod schemas (src/lib/validation.ts) that validate request bodies before processing. The Prisma client provides type-safe database access, and all queries use parameterized inputs to prevent SQL injection. Error handling follows a consistent pattern: errors are caught, logged, and returned with appropriate HTTP status codes and error messages."));

  content.push(h2("3.4 Authentication Flow"));

  content.push(body("The authentication flow works as follows: (1) User submits login credentials (email and password) to POST /api/auth/login; (2) The server looks up the user by email using Prisma; (3) The server compares the submitted password with the stored bcrypt hash using bcryptjs.compare(); (4) If valid, the server generates a JWT containing the user ID, email, and role, signed with a secret key; (5) The JWT is returned to the client, which stores it in localStorage; (6) For subsequent requests, the client includes the token in the Authorization: Bearer <token> header; (7) Protected API routes verify the token using the shared auth utility before processing the request."));

  content.push(h2("3.5 Design Patterns Used"));

  content.push(body("Several design patterns are employed throughout the codebase. The Repository Pattern is implemented via Prisma, which abstracts all database queries behind a type-safe API. The Context Pattern (React Context) manages global authentication state across the component tree. The Component Pattern is used extensively with shadcn/ui providing reusable, composable UI components. Our API follows RESTful conventions with resource-based URLs and standard HTTP methods. The Singleton Pattern is used for the Prisma client instance to prevent multiple connections in serverless environments."));

  // ============================================================
  // 4. DATABASE DESIGN
  // ============================================================
  content.push(pageBreak());
  content.push(h1("4. Database Design"));

  content.push(body("The database was designed using Prisma's schema definition language. The schema defines six main models with their fields, types, and relationships. PostgreSQL was chosen as the database because the data is inherently relational, and PostgreSQL provides robust support for foreign keys, constraints, and complex queries."));

  content.push(h2("4.1 Entity-Relationship Overview"));

  content.push(body("The core entities and their relationships are as follows: A User can own multiple Vehicles (one-to-many). A Vehicle can have multiple Violations (one-to-many). A User (in the police officer role) can issue multiple Violations (one-to-many). Each Violation references a ViolationType (many-to-one). A Violation can have multiple Payments (one-to-many, though typically one). A User (in the citizen role) can make multiple Payments (one-to-many). OTP verifications are stored separately for the forgot-password feature."));

  content.push(h2("4.2 Database Schema"));

  content.push(h3("4.2.1 User Table"));
  content.push(makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "String (UUID)", "Primary key, auto-generated"],
      ["name", "String", "Full name of the user"],
      ["email", "String (Unique)", "Email address, used for login"],
      ["password", "String", "Bcrypt-hashed password"],
      ["role", "Enum (citizen, police, admin)", "User role for access control"],
      ["phone", "String (Optional)", "Phone number"],
      ["nid", "String (Optional)", "National ID number"],
      ["avatar", "String (Optional)", "Profile avatar URL"],
      ["createdAt", "DateTime", "Account creation timestamp"],
      ["updatedAt", "DateTime", "Last update timestamp"],
    ],
    [25, 30, 45]
  ));

  content.push(spacer(150));
  content.push(h3("4.2.2 Vehicle Table"));
  content.push(makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "String (UUID)", "Primary key"],
      ["registrationNumber", "String (Unique)", "Vehicle registration plate number"],
      ["type", "String", "Vehicle type (car, bike, truck, etc.)"],
      ["ownerId", "String (FK)", "References User.id"],
      ["createdAt", "DateTime", "Registration timestamp"],
    ],
    [30, 30, 40]
  ));

  content.push(spacer(150));
  content.push(h3("4.2.3 ViolationType Table"));
  content.push(makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "String (UUID)", "Primary key"],
      ["name", "String", "Violation type name (e.g., Speeding, Red Light)"],
      ["description", "String", "Detailed description of the violation"],
      ["fineAmount", "Float", "Fine amount in BDT"],
      ["isActive", "Boolean", "Whether this type is currently active"],
      ["createdAt", "DateTime", "Creation timestamp"],
      ["updatedAt", "DateTime", "Last update timestamp"],
    ],
    [25, 25, 50]
  ));

  content.push(spacer(150));
  content.push(h3("4.2.4 Violation Table"));
  content.push(makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "String (UUID)", "Primary key"],
      ["vehicleId", "String (FK)", "References Vehicle.id"],
      ["violationTypeId", "String (FK)", "References ViolationType.id"],
      ["officerId", "String (FK)", "References User.id (police officer)"],
      ["location", "String", "Location where violation occurred"],
      ["description", "String (Optional)", "Additional details"],
      ["status", "Enum (pending, paid, disputed)", "Current violation status"],
      ["issuedAt", "DateTime", "When the ticket was issued"],
      ["updatedAt", "DateTime", "Last status update"],
    ],
    [25, 30, 45]
  ));

  content.push(spacer(150));
  content.push(h3("4.2.5 Payment Table"));
  content.push(makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "String (UUID)", "Primary key"],
      ["violationId", "String (FK)", "References Violation.id"],
      ["userId", "String (FK)", "References User.id (citizen who paid)"],
      ["amount", "Float", "Payment amount in BDT"],
      ["receiptNumber", "String (Unique)", "Auto-generated receipt number"],
      ["paymentMethod", "String", "Simulated method (bKash, Nagad, Card)"],
      ["paidAt", "DateTime", "Payment timestamp"],
    ],
    [25, 30, 45]
  ));

  content.push(spacer(150));
  content.push(h3("4.2.6 OtpVerification Table"));
  content.push(makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "String (UUID)", "Primary key"],
      ["email", "String", "Email address for OTP delivery"],
      ["otp", "String", "6-digit OTP code"],
      ["expiresAt", "DateTime", "OTP expiration timestamp"],
      ["isUsed", "Boolean", "Whether OTP has been used"],
      ["createdAt", "DateTime", "OTP generation timestamp"],
    ],
    [25, 30, 45]
  ));

  content.push(spacer(150));
  content.push(h2("4.3 ER Diagram Relationships"));
  content.push(body("The Entity-Relationship diagram illustrates the following key relationships: User to Vehicle is a one-to-many relationship (a user can own multiple vehicles, but each vehicle has one owner). Vehicle to Violation is one-to-many (a vehicle can have multiple violations). User (officer) to Violation is one-to-many (an officer can issue multiple violations). ViolationType to Violation is one-to-many (each violation belongs to one type, but a type can have many violations). Violation to Payment is one-to-many (a violation can have multiple payment attempts, though typically one successful payment). User (citizen) to Payment is one-to-many (a citizen can make multiple payments)."));

  // ============================================================
  // 5. DEVELOPMENT METHODOLOGY
  // ============================================================
  content.push(pageBreak());
  content.push(h1("5. Development Methodology"));

  content.push(body("The team adopted an Agile-inspired development methodology with iterative phases. The project was divided into five distinct phases, each with clear deliverables and review checkpoints. Regular team meetings were held (typically twice a week) to discuss progress, resolve blockers, and plan the next iteration."));

  content.push(h2("5.1 Phase 1: Planning and Requirements (2 Weeks)"));

  content.push(body("During this phase, the team analyzed the traffic management problems in Bangladesh through online research and informal discussions. We identified the key stakeholders (citizens, police officers, administrators) and their needs. The Software Requirements Specification (SRS) document was created with 25+ functional requirements covering all three user roles. Use case diagrams were designed to visualize actor-system interactions. The initial ER diagram was sketched to define the database structure. Each team member was assigned a primary module based on their strengths and interests."));

  content.push(h2("5.2 Phase 2: System Design (1 Week)"));

  content.push(body("In the design phase, the database schema was formalized using Prisma's schema definition language. API endpoints were planned following RESTful conventions, with clear request/response formats for each route. UI/UX wireframes were conceptualized using Figma-inspired layouts, establishing the dark theme with indigo as the primary color. The component architecture was planned, identifying reusable components (Sidebar, AppLayout, DashboardPage) and feature-specific pages. The design system was established with shadcn/ui as the component library and Tailwind CSS for utility styling."));

  content.push(h2("5.3 Phase 3: Frontend Development (3 Weeks)"));

  content.push(body("Frontend development was divided among team members based on their assigned modules. Jisun set up the Next.js project structure, implemented the routing system with App Router, built the AuthContext for global state management, created the API integration layer, and developed the dashboard and admin pages. Akhi implemented the Login and Register pages with form validation, the Profile page, the Payment pages (PayFine and PaymentHistory), and contributed to form validation logic using Zod. Imam developed the Violation pages including the ticket issuance form, the violation search and filter functionality, the notification UI components, and the UpdateViolationDialog. Jasmin designed the Landing page, conducted responsive testing across devices, polished the UI for consistency, and handled documentation."));

  content.push(h2("5.4 Phase 4: Backend Development (3 Weeks)"));

  content.push(body("Backend development ran partially in parallel with frontend development. Jisun implemented the core API routes, designed the Prisma schema, built the JWT authentication system, and handled deployment configuration. Akhi developed the Payment API (pay and history endpoints), the Profile API (view and update), and the Forgot Password flow with OTP generation and verification. Imam implemented the Violation CRUD API, search and filter logic, and the Violation Type configuration API for admins. Jasmin built the Admin statistics API, the Reports generation API, and the User management API with officer creation."));

  content.push(h2("5.5 Phase 5: Testing and Deployment (1 Week)"));

  content.push(body("The final phase focused on manual testing of all features across all three user roles. Each team member tested their assigned modules and documented bugs. Common issues included API error handling edge cases, responsive layout adjustments, and state management bugs. After bug fixing, the application was deployed to Vercel by connecting the GitHub repository. Environment variables (DATABASE_URL, JWT_SECRET) were configured in the Vercel dashboard. The GitHub repository was organized with a proper README, .env.example, and DEPLOY documentation."));

  // ============================================================
  // 6. TEAM CONTRIBUTIONS
  // ============================================================
  content.push(pageBreak());
  content.push(h1("6. Team Contributions"));

  content.push(body("Each team member had clearly defined responsibilities that covered both frontend and backend aspects of their assigned modules. This division ensured that every feature was owned end-to-end by a specific team member, promoting accountability and reducing merge conflicts."));

  content.push(h2("6.1 Maruf Ahmed Jisun - Lead Developer (Full Stack)"));

  content.push(boldBody("GitHub: ", "https://github.com/jisundevelops"));
  content.push(body("As the lead developer, Jisun was responsible for the overall project architecture and integration. His contributions include: (a) Setting up the Next.js 16 project with TypeScript, Tailwind CSS, and shadcn/ui; (b) Designing and implementing the file-based routing structure with App Router; (c) Building the AuthContext for global authentication state management; (d) Creating the API integration layer (src/lib/api.ts) with consistent error handling; (e) Implementing the dashboard pages for all three user roles with charts and statistics; (f) Developing the admin pages including user management and violation type configuration; (g) Designing the Prisma schema with all models and relationships; (h) Implementing the JWT authentication system (login, register, token verification); (i) Setting up the Prisma database client singleton (src/lib/db.ts); (j) Configuring and deploying the application to Vercel; (k) Conducting code reviews and resolving merge conflicts."));

  content.push(h2("6.2 Jannatul Ferdousi Akhi - Software Developer"));

  content.push(body("Akhi focused on user-facing features and authentication flows. Her contributions include: (a) Implementing the Login page with email/password validation and error handling; (b) Building the Register page with role selection (citizen vs. police) and form validation using Zod schemas; (c) Developing the Forgot Password page with OTP input component; (d) Creating the Profile page with view and edit functionality; (e) Implementing the PayFine page with payment method selection and confirmation; (f) Building the Payment History page with search and filter; (g) Developing the Payment API (POST /api/payments/pay and GET /api/payments/history); (h) Implementing the Profile API (GET and PATCH /api/profile); (i) Building the Forgot Password API with OTP generation and email verification; (j) Contributing to form validation schemas in src/lib/validation.ts."));

  content.push(h2("6.3 Imam Hossain - Software Developer"));

  content.push(body("Imam was responsible for the core violation management features. His contributions include: (a) Implementing the Issue Ticket page with vehicle lookup and violation type selection; (b) Building the All Violations page with search, filter, and status badges; (c) Creating the My Violations page for citizens to view their violation history; (d) Developing the Update Violation Dialog for officers to update violation status; (e) Implementing notification UI components; (f) Developing the Violation CRUD API (GET/POST /api/violations, GET /api/violations/my, GET/PATCH /api/violations/[id]); (g) Implementing search and filter logic with Prisma queries (by status, type, date range); (h) Building the Violation Type configuration API (GET/POST /api/admin/violation-types, PATCH/DELETE /api/admin/violation-types/[id]); (i) Creating input validation for violation-related endpoints using Zod."));

  content.push(h2("6.4 Jasmin Akter - Software Developer"));

  content.push(body("Jasmin handled the landing page, admin analytics, and testing. Her contributions include: (a) Designing and implementing the Landing page with hero section, feature cards, and call-to-action buttons; (b) Conducting responsive testing across desktop, tablet, and mobile viewports; (c) Polishing the UI for visual consistency (spacing, colors, typography); (d) Writing and organizing project documentation (README, DEPLOY guide); (e) Developing the Admin Statistics API (GET /api/admin/stats) with aggregate queries; (f) Building the Reports generation API (GET /api/admin/reports) with date-range filtering; (g) Implementing the User Management API (GET /api/admin/users, POST /api/admin/create-officer); (h) Building the Admin Users page with role-based filtering and officer creation form; (i) Creating the Reports page with date-range selection and data export."));

  content.push(h2("6.5 Contribution Summary"));

  content.push(makeTable(
    ["Team Member", "Primary Modules", "Frontend", "Backend"],
    [
      ["Maruf Ahmed Jisun", "Architecture, Auth, Dashboard, Admin, Deploy", "AuthContext, Dashboard, Admin Pages, AppLayout", "API Routes, Prisma Schema, JWT Auth, Deploy Config"],
      ["Jannatul Ferdousi Akhi", "User Auth, Profile, Payments", "Login, Register, Profile, PayFine, PaymentHistory", "Payment API, Profile API, Forgot Password API"],
      ["Imam Hossain", "Violations, Ticket Issuance, Search", "IssueTicket, AllViolations, MyViolations, UpdateDialog", "Violation CRUD API, Search/Filter API, ViolationType API"],
      ["Jasmin Akter", "Landing Page, Reports, Admin Stats", "Landing Page, Reports Page, Admin Users Page", "Admin Stats API, Reports API, User Management API"],
    ],
    [20, 25, 27, 28]
  ));

  // ============================================================
  // 7. FEATURE WALKTHROUGH
  // ============================================================
  content.push(pageBreak());
  content.push(h1("7. Feature Walkthrough"));

  content.push(body("Civitra implements 25+ functional requirements across three user roles. This section provides a detailed walkthrough of the key features from each user's perspective."));

  content.push(h2("7.1 Common Features (All Roles)"));

  content.push(h3("7.1.1 User Registration and Login"));
  content.push(body("Users can register by providing their name, email, password, and selecting a role (citizen or police). Form validation ensures all fields are filled correctly before submission. The password is hashed using bcryptjs with 10 salt rounds before storage. Upon successful registration, users are redirected to the login page. Login requires email and password. The server validates credentials, generates a JWT token, and returns it along with user data. The client stores the token and redirects to the role-appropriate dashboard."));

  content.push(h3("7.1.2 Profile Management"));
  content.push(body("All users can view and edit their profile information, including name, phone number, and NID. The profile page displays the user's current information with edit capability. Changes are saved via the PATCH /api/profile endpoint, which validates the JWT token and updates only the provided fields."));

  content.push(h3("7.1.3 Forgot Password with OTP"));
  content.push(body("Users who forget their password can request an OTP by entering their registered email. The server generates a 6-digit OTP, stores it in the OtpVerification table with a 5-minute expiration, and displays it (in this simulated environment, the OTP is shown in the API response). The user enters the OTP on the verification page. Upon successful verification, they can set a new password, which is hashed and stored."));

  content.push(h2("7.2 Citizen Features"));

  content.push(h3("7.2.1 Dashboard"));
  content.push(body("The citizen dashboard displays an overview of the user's violation history, including total violations, pending violations, total fines, and paid fines. The dashboard uses card components with icons and color-coded metrics for quick visual scanning. A recent violations table shows the latest violations with status badges (pending/paid/disputed)."));

  content.push(h3("7.2.2 My Violations"));
  content.push(body("Citizens can view all violations associated with their vehicles. The page displays a table with violation details: vehicle registration number, violation type, fine amount, location, date issued, and status. Users can filter violations by status (all, pending, paid, disputed) and search by vehicle registration number. Clicking on a violation shows more details in an expanded view."));

  content.push(h3("7.2.3 Pay Fine"));
  content.push(body("Citizens can pay pending violations by navigating to the Pay Fine page. The page displays the violation details (type, amount, location, date) and a payment form. The user selects a simulated payment method (bKash, Nagad, or Card) and confirms the payment. The backend creates a Payment record with a generated receipt number (format: RCP-XXXXXXXX), updates the Violation status from pending to paid, and returns the payment confirmation. No real financial transaction occurs."));

  content.push(h3("7.2.4 Payment History"));
  content.push(body("Citizens can view their complete payment history, including the receipt number, violation details, amount, payment method, and date of payment. The page supports search by receipt number and filtering by payment method."));

  content.push(h2("7.3 Traffic Police Features"));

  content.push(h3("7.3.1 Dashboard"));
  content.push(body("The police dashboard shows statistics relevant to the officer: total violations issued, violations issued today, pending violations, and total fines collected from their issued tickets. Recent violations issued by the officer are displayed in a table with quick status overview."));

  content.push(h3("7.3.2 Issue Digital Violation Ticket"));
  content.push(body("This is the core feature for police officers. The Issue Ticket page provides a form with the following fields: vehicle registration number (with auto-lookup), violation type (dropdown populated from ViolationType table), location (text input with common locations suggested), and additional description (optional). Upon submission, the backend creates a Violation record linking the vehicle, violation type, issuing officer, and location. The violation status is set to pending."));

  content.push(h3("7.3.3 Violation Management"));
  content.push(body("Officers can view all violations they have issued, with search and filter capabilities. They can also update the status or details of a violation using the UpdateViolationDialog component. This allows officers to add notes or correct information if needed."));

  content.push(h2("7.4 Admin Features"));

  content.push(h3("7.4.1 Admin Dashboard"));
  content.push(body("The admin dashboard provides a system-wide overview with the following statistics: total users, total violations, total revenue (from paid fines), and pending violations. The dashboard includes interactive charts showing violation trends over time, violations by type distribution, and payment trends. These charts use the shadcn/ui chart components built on Recharts."));

  content.push(h3("7.4.2 User Management"));
  content.push(body("Administrators can view all registered users with filtering by role (citizen, police, admin). The page displays user details including name, email, role, and registration date. Admins can create new police officer accounts directly from this page, bypassing the standard registration flow, to ensure that only authorized individuals receive police role access."));

  content.push(h3("7.4.3 Violation Type Configuration"));
  content.push(body("Administrators can manage violation types through full CRUD operations: create new violation types (name, description, fine amount), view all violation types, update existing types (change name, description, or fine amount), and deactivate or delete types. This allows the system to adapt to changes in traffic regulations without code modifications."));

  content.push(h3("7.4.4 Reports Generation"));
  content.push(body("The reports page allows administrators to generate reports by selecting a date range. Reports include: total violations issued, total payments collected, violations by type breakdown, and top violating vehicles. The data is presented in tables and can be filtered by the selected date range."));

  content.push(h3("7.4.5 All Violations Overview"));
  content.push(body("Admins have access to all violations in the system, not just those issued by a specific officer or owned by a specific citizen. This page provides the most comprehensive view with advanced filtering by status, type, officer, date range, and vehicle registration number."));

  // ============================================================
  // 8. API DOCUMENTATION
  // ============================================================
  content.push(pageBreak());
  content.push(h1("8. API Documentation"));

  content.push(body("The Civitra API follows RESTful conventions with JSON request and response bodies. All protected endpoints require a valid JWT token in the Authorization header. The API is organized into five groups: Authentication, Violations, Payments, Admin, and Profile."));

  content.push(h2("8.1 Authentication Endpoints"));

  content.push(makeTable(
    ["Method", "Endpoint", "Access", "Description"],
    [
      ["POST", "/api/auth/login", "Public", "Authenticate user, return JWT token"],
      ["POST", "/api/auth/register", "Public", "Create new user account"],
      ["POST", "/api/auth/forgot-password", "Public", "Generate OTP for password reset"],
      ["POST", "/api/auth/reset-password", "Public", "Verify OTP and set new password"],
    ],
    [10, 35, 15, 40]
  ));

  content.push(spacer(150));
  content.push(h2("8.2 Violation Endpoints"));

  content.push(makeTable(
    ["Method", "Endpoint", "Access", "Description"],
    [
      ["GET", "/api/violations", "Police, Admin", "List all violations with filters"],
      ["POST", "/api/violations", "Police", "Issue a new violation ticket"],
      ["GET", "/api/violations/my", "Citizen", "Get violations for current user's vehicles"],
      ["GET", "/api/violations/[id]", "All Roles", "Get violation details by ID"],
      ["PATCH", "/api/violations/[id]", "Police, Admin", "Update violation status or details"],
    ],
    [10, 35, 20, 35]
  ));

  content.push(spacer(150));
  content.push(h2("8.3 Payment Endpoints"));

  content.push(makeTable(
    ["Method", "Endpoint", "Access", "Description"],
    [
      ["POST", "/api/payments/pay", "Citizen", "Pay a pending violation fine"],
      ["GET", "/api/payments/history", "Citizen", "Get payment history for current user"],
    ],
    [10, 35, 15, 40]
  ));

  content.push(spacer(150));
  content.push(h2("8.4 Admin Endpoints"));

  content.push(makeTable(
    ["Method", "Endpoint", "Access", "Description"],
    [
      ["GET", "/api/admin/stats", "Admin", "Get system-wide statistics"],
      ["GET", "/api/admin/reports", "Admin", "Generate reports with date range filter"],
      ["GET", "/api/admin/users", "Admin", "List all users with role filter"],
      ["POST", "/api/admin/create-officer", "Admin", "Create a new police officer account"],
      ["GET", "/api/admin/violation-types", "Admin", "List all violation types"],
      ["POST", "/api/admin/violation-types", "Admin", "Create a new violation type"],
      ["PATCH", "/api/admin/violation-types/[id]", "Admin", "Update a violation type"],
      ["DELETE", "/api/admin/violation-types/[id]", "Admin", "Delete a violation type"],
    ],
    [10, 38, 12, 40]
  ));

  content.push(spacer(150));
  content.push(h2("8.5 Profile Endpoints"));

  content.push(makeTable(
    ["Method", "Endpoint", "Access", "Description"],
    [
      ["GET", "/api/profile", "Authenticated", "Get current user profile"],
      ["PATCH", "/api/profile", "Authenticated", "Update current user profile"],
    ],
    [10, 30, 20, 40]
  ));

  content.push(spacer(200));
  content.push(h2("8.6 API Request/Response Examples"));

  content.push(h3("8.6.1 Login Request"));
  content.push(bodyNoIndent("POST /api/auth/login"));
  content.push(bodyNoIndent("Request Body: { \"email\": \"user@example.com\", \"password\": \"secret123\" }"));
  content.push(bodyNoIndent("Response (200): { \"token\": \"eyJhbGc...\", \"user\": { \"id\": \"...\", \"name\": \"...\", \"email\": \"...\", \"role\": \"citizen\" } }"));
  content.push(bodyNoIndent("Response (401): { \"error\": \"Invalid email or password\" }"));

  content.push(h3("8.6.2 Issue Violation Request"));
  content.push(bodyNoIndent("POST /api/violations"));
  content.push(bodyNoIndent("Headers: Authorization: Bearer <token>"));
  content.push(bodyNoIndent("Request Body: { \"vehicleId\": \"...\", \"violationTypeId\": \"...\", \"location\": \"Mirpur Road, Dhaka\", \"description\": \"Overspeeding in school zone\" }"));
  content.push(bodyNoIndent("Response (201): { \"id\": \"...\", \"status\": \"pending\", \"issuedAt\": \"2025-01-15T10:30:00Z\", ... }"));

  content.push(h3("8.6.3 Pay Fine Request"));
  content.push(bodyNoIndent("POST /api/payments/pay"));
  content.push(bodyNoIndent("Headers: Authorization: Bearer <token>"));
  content.push(bodyNoIndent("Request Body: { \"violationId\": \"...\", \"paymentMethod\": \"bKash\" }"));
  content.push(bodyNoIndent("Response (200): { \"receiptNumber\": \"RCP-1A2B3C4D\", \"amount\": 500, \"paidAt\": \"2025-01-20T14:15:00Z\", \"violation\": { \"status\": \"paid\" } }"));

  // ============================================================
  // 9. DEPLOYMENT PROCESS
  // ============================================================
  content.push(pageBreak());
  content.push(h1("9. Deployment Process"));

  content.push(body("Civitra is deployed on Vercel, a cloud platform that provides native support for Next.js applications. The deployment process is streamlined through Vercel's GitHub integration, enabling continuous deployment from the main branch."));

  content.push(h2("9.1 Deployment Architecture"));

  content.push(body("The deployment architecture is entirely serverless. Next.js pages are served through Vercel's edge network as static or server-rendered pages. API routes become serverless functions that execute on demand. The PostgreSQL database is hosted on Neon, which is also serverless with auto-scaling connections. This means the entire stack operates without any traditional server management."));

  content.push(h2("9.2 Deployment Steps"));

  content.push(body("The deployment was carried out in the following steps: (1) Code was pushed to the GitHub repository; (2) The Vercel project was created by importing the GitHub repository; (3) Framework was auto-detected as Next.js; (4) Environment variables were configured in the Vercel dashboard: DATABASE_URL (Neon PostgreSQL connection string), JWT_SECRET (secret key for token signing); (5) The initial deployment was triggered automatically; (6) Subsequent pushes to the main branch trigger automatic redeployment; (7) Preview deployments are created for pull requests for testing before merge."));

  content.push(h2("9.3 Environment Configuration"));

  content.push(makeTable(
    ["Variable", "Purpose", "Example"],
    [
      ["DATABASE_URL", "Neon PostgreSQL connection string", "postgresql://user:pass@ep-xxx.neon.tech/civitra?sslmode=require"],
      ["JWT_SECRET", "Secret key for JWT token signing", "a-random-64-character-string"],
      ["NEXT_PUBLIC_APP_URL", "Application public URL", "https://civitra.vercel.app"],
    ],
    [30, 35, 35]
  ));

  content.push(spacer(200));
  content.push(h2("9.4 Serverless Architecture Benefits"));

  content.push(body("The serverless architecture provides several advantages: (a) Zero server management - no need to provision, maintain, or patch servers; (b) Automatic scaling - the application handles traffic spikes without manual intervention; (c) Cost efficiency - we pay only for actual compute time, and both Vercel and Neon offer generous free tiers; (d) Global distribution - Vercel's CDN serves static assets from edge locations worldwide; (e) Developer productivity - deployments are fast (typically under 60 seconds) and preview deployments enable rapid iteration."));

  // ============================================================
  // 10. CHALLENGES & SOLUTIONS
  // ============================================================
  content.push(pageBreak());
  content.push(h1("10. Challenges and Solutions"));

  content.push(body("Throughout the development process, the team encountered several technical and organizational challenges. This section documents each challenge and the solution that was implemented."));

  content.push(h2("10.1 Managing State Across Many Pages"));

  content.push(boldBody("Challenge: ", "With multiple pages requiring access to the current user's information and authentication state, passing props through every component would be impractical and lead to prop drilling."));
  content.push(boldBody("Solution: ", "We implemented the React Context API with a custom AuthContext. This context provides the current user object, authentication status, login/logout methods, and role information to all components in the tree. Components use the useAuth() hook to access this context, eliminating prop drilling and ensuring consistent state across the application."));

  content.push(h2("10.2 Real-Time Dashboard Updates"));

  content.push(boldBody("Challenge: ", "The dashboard pages need to display up-to-date statistics that reflect the latest data. Manually refreshing the page after every data change would provide a poor user experience."));
  content.push(boldBody("Solution: ", "We used TanStack Query (React Query) for data fetching. TanStack Query provides automatic background refetching, cache invalidation, and stale-while-revalidate behavior. When a user pays a fine or issues a ticket, the relevant queries are invalidated, causing the dashboard to automatically refetch and display updated statistics."));

  content.push(h2("10.3 Responsive Design for Mobile Devices"));

  content.push(boldBody("Challenge: ", "Traffic police officers frequently use mobile devices in the field. The application needed to be fully functional on smartphones and tablets, not just desktop computers."));
  content.push(boldBody("Solution: ", "We used Tailwind CSS responsive breakpoints (sm, md, lg, xl) throughout the application. The sidebar collapses into a sheet (drawer) on mobile devices. Tables switch to card-based layouts on small screens. Touch-friendly form elements with appropriate sizing ensure usability on mobile devices. Extensive testing was conducted on various screen sizes using browser developer tools and physical devices."));

  content.push(h2("10.4 Secure Password Handling"));

  content.push(boldBody("Challenge: ", "Storing passwords in plain text is a critical security vulnerability. We needed a robust approach to password hashing and verification."));
  content.push(boldBody("Solution: ", "We used bcryptjs with 10 salt rounds for password hashing. When a user registers, their password is hashed before storage. During login, the submitted password is compared against the stored hash using bcryptjs.compare(), which is timing-attack resistant. The JWT token does not contain the password; it only carries the user ID, email, and role."));

  content.push(h2("10.5 Preventing SQL Injection"));

  content.push(boldBody("Challenge: ", "User-supplied data in API requests could potentially contain malicious SQL if queries were constructed using string concatenation."));
  content.push(boldBody("Solution: ", "By using Prisma ORM, all database queries are automatically parameterized. Prisma generates SQL with placeholders and passes user input as parameters, making SQL injection impossible. Additionally, we validate all input using Zod schemas before processing, rejecting any data that does not match expected formats."));

  content.push(h2("10.6 Prisma Connection Pool in Serverless"));

  content.push(boldBody("Challenge: ", "In serverless environments, each API route invocation may create a new Prisma client instance, leading to connection pool exhaustion with the database."));
  content.push(boldBody("Solution: ", "We implemented the Prisma client singleton pattern in src/lib/db.ts. The client is stored as a global variable that persists across serverless function invocations within the same cold start. This prevents the creation of excessive database connections and ensures efficient connection reuse."));

  content.push(h2("10.7 Role-Based UI Rendering"));

  content.push(boldBody("Challenge: ", "The sidebar navigation and page access need to change based on the user's role. Citizens should not see police features, and police should not see admin features."));
  content.push(boldBody("Solution: ", "The Sidebar component reads the user's role from AuthContext and conditionally renders navigation items based on role-specific access lists. Additionally, each page component checks the user's role on mount and redirects unauthorized users to their appropriate dashboard. API routes also enforce role-based access on the backend, providing defense in depth."));

  // ============================================================
  // 11. Q&A PREPARATION
  // ============================================================
  content.push(pageBreak());
  content.push(h1("11. Q&A Preparation"));

  content.push(body("This section provides detailed answers to the most likely questions that may be asked during the project defense. Each answer is structured to demonstrate deep understanding of the technology and design decisions."));

  const qaItems = [
    {
      q: "Q1: Why did you choose Next.js over plain React?",
      a: "Next.js provides server-side rendering (SSR), which improves initial page load performance and SEO. It includes API routes, allowing us to build the backend within the same project, eliminating the need for a separate Express.js server. The App Router provides file-based routing with layouts, loading states, and error boundaries built in. Next.js has first-class TypeScript support and excellent developer experience with fast refresh. Deployment to Vercel is seamless with zero configuration. Plain React would have required us to set up a separate backend server, configure routing manually, and handle server-side rendering ourselves."
    },
    {
      q: "Q2: How does your authentication system work?",
      a: "We use JWT (JSON Web Tokens) for authentication. When a user logs in, the server validates the email and password against the database (password is verified using bcryptjs.compare()). If valid, the server generates a JWT containing the user ID, email, and role, signed with a secret key using the HS256 algorithm. The token is sent to the client, which stores it in localStorage. For every subsequent API request, the client includes the token in the Authorization: Bearer header. Protected API routes use a shared auth utility function that extracts the token from the header, verifies it using jsonwebtoken.verify(), and attaches the decoded user information to the request context. If the token is missing, expired, or invalid, the API returns a 401 Unauthorized response."
    },
    {
      q: "Q3: How is the database connected?",
      a: "We use Prisma ORM, which provides type-safe database access. The PostgreSQL database is hosted on Neon, a serverless PostgreSQL platform. The connection string is stored as the DATABASE_URL environment variable. In our code, we initialize the Prisma client in src/lib/db.ts using a singleton pattern to prevent connection pool exhaustion in serverless environments. Prisma generates a client based on our schema.prisma file, and we use this client throughout our API routes to perform type-safe queries. All queries are automatically parameterized, preventing SQL injection."
    },
    {
      q: "Q4: What design patterns did you use?",
      a: "We used several design patterns: (1) The Repository Pattern is implemented via Prisma, which abstracts all database queries behind a type-safe API, isolating data access logic from business logic. (2) The Context Pattern (React Context) manages global authentication state across the component tree, providing user info and auth methods to all components. (3) The Component Pattern is used with shadcn/ui providing reusable, composable UI components. (4) Our API follows RESTful conventions with resource-based URLs and standard HTTP methods. (5) The Singleton Pattern is used for the Prisma client instance to prevent multiple database connections in serverless environments. (6) The Middleware Pattern is used for authentication verification on protected API routes."
    },
    {
      q: "Q5: How did you handle role-based access control?",
      a: "Role-based access is enforced at three levels. First, at the database level: each user has a role field (citizen, police, or admin) stored in the User table. Second, at the API level: protected routes extract the JWT token, decode it to get the user's role, and check if the role is authorized for that endpoint. For example, only police and admin roles can access POST /api/violations, and only admin can access /api/admin/* endpoints. Unauthorized roles receive a 403 Forbidden response. Third, at the frontend level: the AuthContext provides the user's role to all components. The Sidebar conditionally renders navigation items based on role. Page components check the role on mount and redirect unauthorized users. This three-layer approach provides defense in depth."
    },
    {
      q: "Q6: What challenges did you face during development?",
      a: "We faced several challenges: (1) Managing state across many pages was solved with React Context (AuthContext). (2) Keeping dashboard data fresh was solved with TanStack Query for automatic background refetching. (3) Making the application responsive on mobile devices was addressed with Tailwind CSS responsive breakpoints and component-level adaptations. (4) Secure password handling was implemented using bcryptjs with 10 salt rounds. (5) Deploying a full-stack application was simplified by choosing Vercel for its native Next.js support. (6) Preventing database connection pool exhaustion in serverless was addressed with the Prisma client singleton pattern. (7) Input validation and security were ensured with Zod schemas and Prisma parameterized queries."
    },
    {
      q: "Q7: How does the payment system work?",
      a: "The payment system is simulated since this is an academic project. When a citizen clicks 'Pay Fine' on a pending violation, they see the violation details and a payment form. They select a simulated payment method (bKash, Nagad, or Card) and confirm. The backend creates a Payment record with a generated receipt number (format: RCP- followed by 8 random hexadecimal characters), records the amount, payment method, and timestamp. The associated Violation record's status is updated from 'pending' to 'paid'. No real financial transaction occurs. In a production system, we would integrate with a payment gateway like SSLCommerz or Stripe, but for this academic project, the simulation demonstrates the complete flow from violation to payment to receipt generation."
    },
    {
      q: "Q8: Explain your ER diagram relationships.",
      a: "The ER diagram has six main entities. User to Vehicle is a one-to-many relationship: each user can own multiple vehicles, but each vehicle belongs to one owner (via the ownerId foreign key). Vehicle to Violation is one-to-many: a vehicle can have multiple violations recorded against it. User (officer) to Violation is one-to-many: a police officer can issue multiple violations (via the officerId foreign key). ViolationType to Violation is one-to-many: each violation belongs to one type, but a type can be referenced by many violations. Violation to Payment is one-to-many: a violation can have multiple payment attempts (though typically only one successful payment). User (citizen) to Payment is one-to-many: a citizen can make multiple payments across different violations."
    },
    {
      q: "Q9: What is Prisma and why did you use it?",
      a: "Prisma is a next-generation Object-Relational Mapping (ORM) tool for Node.js and TypeScript. Unlike traditional ORMs that use active record or data mapper patterns, Prisma takes a declarative approach: you define your database schema in schema.prisma, and Prisma generates a fully type-safe client. We chose Prisma because: (1) It provides compile-time type checking for all database queries, catching errors before runtime. (2) The schema.prisma file serves as a single source of truth for our database structure. (3) Migrations are easy with the db push command for development. (4) All queries are automatically parameterized, preventing SQL injection. (5) The auto-generated client provides excellent IDE auto-completion. (6) Relation queries are intuitive with include and select syntax. (7) It eliminates the boilerplate code associated with traditional ORMs."
    },
    {
      q: "Q10: How did you ensure security?",
      a: "Security was a primary concern throughout development. We implemented multiple layers of protection: (1) Password hashing with bcryptjs using 10 salt rounds, making rainbow table attacks infeasible. (2) JWT token-based authentication with a strong secret key, ensuring that only authenticated users can access protected endpoints. (3) Input validation with Zod schemas on all API endpoints, rejecting malformed or malicious input before processing. (4) SQL injection prevention via Prisma's parameterized queries, which separate query structure from user input. (5) Role-based access control at both API and frontend levels, preventing unauthorized access. (6) Payment ownership validation: before processing a payment, the API verifies that the violation belongs to the requesting citizen's vehicles. (7) Environment variables for sensitive data (JWT_SECRET, DATABASE_URL) that are never exposed in client-side code."
    },
    {
      q: "Q11: What is serverless deployment?",
      a: "Serverless deployment means that we do not manage any servers. Instead, the cloud provider (Vercel) runs our code on demand. Each API route becomes a serverless function that executes when a request comes in and shuts down when idle. This provides several benefits: (1) Automatic scaling: the platform handles traffic spikes without manual intervention. (2) Cost efficiency: we only pay for actual compute time, and the free tier covers our usage. (3) Zero maintenance: no server patching, updates, or configuration. (4) Fast deployment: pushing to GitHub triggers automatic deployment in under 60 seconds. Our database (Neon PostgreSQL) is also serverless, scaling connections based on demand. The entire Civitra stack is serverless."
    },
    {
      q: "Q12: How did you divide work among team members?",
      a: "Work was divided based on each member's strengths and interests, with each person owning their modules end-to-end (both frontend and backend). Jisun, as the lead developer, handled the core architecture: project setup, routing, authentication system, database schema, dashboard, admin pages, and deployment. Akhi focused on user-facing features: login, registration, profile management, payment pages, and the forgot-password flow. Imam worked on the violation management system: ticket issuance, violation listing, search and filter, and violation type configuration. Jasmin handled the landing page, admin analytics (statistics and reports API), user management, and quality assurance (responsive testing, UI polish, documentation). This ownership model ensured accountability and reduced merge conflicts since each member worked primarily in their own set of files."
    },
  ];

  for (const item of qaItems) {
    content.push(h2(item.q));
    content.push(body(item.a));
  }

  // ============================================================
  // 12. APPENDIX - KEY FILE STRUCTURE
  // ============================================================
  content.push(pageBreak());
  content.push(h1("12. Appendix: Key File Structure"));

  content.push(body("The following table maps the key source files in the project to their responsible team members and purposes. This information may be useful for answering questions about specific implementation details."));

  content.push(makeTable(
    ["File Path", "Purpose", "Owner"],
    [
      ["src/app/page.tsx", "Root page (Landing Page)", "Jasmin"],
      ["src/app/layout.tsx", "Root layout with providers", "Jisun"],
      ["src/contexts/AuthContext.tsx", "Global authentication state", "Jisun"],
      ["src/lib/db.ts", "Prisma client singleton", "Jisun"],
      ["src/lib/auth.ts", "JWT verification utility", "Jisun"],
      ["src/lib/api.ts", "API integration layer", "Jisun"],
      ["src/lib/validation.ts", "Zod validation schemas", "Akhi / Imam"],
      ["src/lib/otp-store.ts", "OTP generation and verification", "Akhi"],
      ["src/components/civitra/LandingPage.tsx", "Public landing page", "Jasmin"],
      ["src/components/civitra/LoginPage.tsx", "Login form and logic", "Akhi"],
      ["src/components/civitra/RegisterPage.tsx", "Registration form", "Akhi"],
      ["src/components/civitra/ForgotPasswordPage.tsx", "OTP-based password reset", "Akhi"],
      ["src/components/civitra/DashboardPage.tsx", "Role-based dashboard", "Jisun"],
      ["src/components/civitra/IssueTicketPage.tsx", "Police ticket issuance", "Imam"],
      ["src/components/civitra/AllViolationsPage.tsx", "All violations view", "Imam"],
      ["src/components/civitra/MyViolationsPage.tsx", "Citizen violations view", "Imam"],
      ["src/components/civitra/PayFinePage.tsx", "Fine payment form", "Akhi"],
      ["src/components/civitra/PaymentHistoryPage.tsx", "Payment history view", "Akhi"],
      ["src/components/civitra/ProfilePage.tsx", "User profile management", "Akhi"],
      ["src/components/civitra/AdminUsersPage.tsx", "Admin user management", "Jasmin"],
      ["src/components/civitra/ViolationTypesPage.tsx", "Admin violation type CRUD", "Imam"],
      ["src/components/civitra/ReportsPage.tsx", "Admin reports generation", "Jasmin"],
      ["src/components/civitra/Sidebar.tsx", "Role-based sidebar navigation", "Jisun"],
      ["src/components/civitra/AppLayout.tsx", "Authenticated layout wrapper", "Jisun"],
      ["src/app/api/auth/login/route.ts", "Login API endpoint", "Jisun"],
      ["src/app/api/auth/register/route.ts", "Registration API endpoint", "Jisun"],
      ["src/app/api/auth/forgot-password/route.ts", "Forgot password API", "Akhi"],
      ["src/app/api/auth/reset-password/route.ts", "Reset password API", "Akhi"],
      ["src/app/api/violations/route.ts", "Violation CRUD API", "Imam"],
      ["src/app/api/violations/my/route.ts", "Citizen violations API", "Imam"],
      ["src/app/api/violations/[id]/route.ts", "Single violation API", "Imam"],
      ["src/app/api/payments/pay/route.ts", "Payment processing API", "Akhi"],
      ["src/app/api/payments/history/route.ts", "Payment history API", "Akhi"],
      ["src/app/api/profile/route.ts", "Profile management API", "Akhi"],
      ["src/app/api/admin/stats/route.ts", "Admin statistics API", "Jasmin"],
      ["src/app/api/admin/reports/route.ts", "Admin reports API", "Jasmin"],
      ["src/app/api/admin/users/route.ts", "Admin user management API", "Jasmin"],
      ["src/app/api/admin/create-officer/route.ts", "Officer creation API", "Jasmin"],
      ["src/app/api/admin/violation-types/route.ts", "Violation type CRUD API", "Imam"],
      ["prisma/schema.prisma", "Database schema definition", "Jisun"],
    ],
    [45, 35, 20]
  ));

  content.push(spacer(200));
  content.push(h2("12.1 Key Commands Reference"));

  content.push(makeTable(
    ["Command", "Purpose"],
    [
      ["npx prisma db push", "Push schema changes to the database"],
      ["npx prisma generate", "Generate Prisma client from schema"],
      ["npx prisma studio", "Open visual database browser"],
      ["npm run dev", "Start local development server"],
      ["npm run build", "Build the application for production"],
      ["vercel deploy", "Deploy to Vercel (or push to GitHub for auto-deploy)"],
    ],
    [50, 50]
  ));

  return content;
}

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================
async function main() {
  const pgSize = { width: 11906, height: 16838 };
  const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: "Times New Roman", eastAsia: "Microsoft YaHei" },
            size: 24,
            color: P.body,
          },
          paragraph: {
            spacing: { line: 312 },
          },
        },
        heading1: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary },
          paragraph: { spacing: { before: 400, after: 200, line: 312 } },
        },
        heading2: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: P.primary },
          paragraph: { spacing: { before: 300, after: 150, line: 312 } },
        },
        heading3: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, bold: true, color: P.primary },
          paragraph: { spacing: { before: 200, after: 100, line: 312 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "num-list-1",
          levels: [{
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [
      // Section 1: Cover (no page number, no footer)
      {
        properties: {
          page: {
            size: pgSize,
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCover(),
      },
      // Section 2: Front matter (TOC) — Roman numerals
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Civitra Project Defense Guide", size: 18, color: "888888", font: { ascii: "Times New Roman" } })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" })],
            })],
          }),
        },
        children: buildTocPage(),
      },
      // Section 3: Body — Arabic numerals starting from 1
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: pgSize,
            margin: pgMargin,
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Civitra Project Defense Guide", size: 18, color: "888888", font: { ascii: "Times New Roman" } })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" })],
            })],
          }),
        },
        children: buildBody(),
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("/home/z/my-project/Civitra_Project_Defense_Guide.docx", buffer);
  console.log("Document generated successfully!");
}

main().catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
