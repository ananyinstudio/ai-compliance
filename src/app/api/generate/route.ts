import Stripe from "stripe";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

type PersonalData = "no" | "limited" | "regular";
type YesNo = "no" | "yes";
type Employees = "1-5" | "6-20" | "21-50" | "51-200" | "200+";
type Industry =
  | "it"
  | "consulting"
  | "marketing"
  | "ecommerce"
  | "health"
  | "finance"
  | "education"
  | "other";

function safeStr(x: unknown, max = 400) {
  return String(x ?? "").slice(0, max);
}

function toEnum<T extends string>(x: unknown, allowed: readonly T[], fallback: T): T {
  const v = String(x ?? "") as T;
  return (allowed as readonly string[]).includes(v) ? v : fallback;
}

function computeRisk(personalData: PersonalData, externalUse: YesNo, automatedDecisions: YesNo) {
  let score = 0;

  if (personalData === "limited") score += 1;
  if (personalData === "regular") score += 2;

  if (externalUse === "yes") score += 2;
  if (automatedDecisions === "yes") score += 2;

  const level = score >= 4 ? "High" : score >= 2 ? "Medium" : "Low";

  const actions =
    level === "High"
      ? [
          "Four-eyes review for external outputs",
          "Mandatory documentation (tool, purpose, data, owner, review)",
          "Data protection review + DPA/AVV where relevant",
          "No high-impact automated decisions without dedicated approval",
        ]
      : level === "Medium"
      ? [
          "Human review before external use",
          "Data minimization / anonymization",
          "Document in AI register",
          "Regular review of usage",
        ]
      : ["Human review for external use", "Data minimization", "Short documentation in AI register"];

  return { score, level, actions };
}

function industryLabelDe(v: Industry) {
  switch (v) {
    case "it":
      return "IT / Software";
    case "consulting":
      return "Consulting";
    case "marketing":
      return "Marketing / Media";
    case "ecommerce":
      return "E-Commerce";
    case "health":
      return "Health";
    case "finance":
      return "Finance";
    case "education":
      return "Education";
    default:
      return "Other";
  }
}

function industryLabelEn(v: Industry) {
  return industryLabelDe(v);
}

function personalDataLabelDe(v: PersonalData) {
  return v === "no" ? "nein" : v === "limited" ? "ja, begrenzt" : "ja, regelmäßig";
}
function personalDataLabelEn(v: PersonalData) {
  return v === "no" ? "No" : v === "limited" ? "Yes (limited)" : "Yes (regular)";
}

async function makeSimplePdf(title: string, lines: string[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN_X = 50;
  const MARGIN_TOP = 60;
  const MARGIN_BOTTOM = 50;
  const TITLE_SIZE = 18;
  const TEXT_SIZE = 11;
  const LINE_GAP = 16;
  const MAX_CHARS = 95;

  const wrap = (s: string) => {
    const out: string[] = [];
    const text = String(s ?? "");
    if (!text) return [""];
    if (text.length <= MAX_CHARS) return [text];
    for (let i = 0; i < text.length; i += MAX_CHARS) out.push(text.slice(i, i + MAX_CHARS));
    return out;
  };

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  const drawHeader = () =>
    page.drawText(title, { x: MARGIN_X, y: PAGE_H - MARGIN_TOP, size: TITLE_SIZE, font });

  drawHeader();
  let y = PAGE_H - MARGIN_TOP - 30;

  for (const line of lines) {
    for (const chunk of wrap(line)) {
      if (y < MARGIN_BOTTOM) {
        page = pdf.addPage([PAGE_W, PAGE_H]);
        drawHeader();
        y = PAGE_H - MARGIN_TOP - 30;
      }
      page.drawText(chunk, { x: MARGIN_X, y, size: TEXT_SIZE, font });
      y -= LINE_GAP;
    }
  }

  return Buffer.from(await pdf.save());
}

function getKiPolicyDeLines(p: {
  company: string;
  address: string;
  dateISO: string;
  version: string;
  industry: Industry;
  employees: Employees;
  tools: string[];
  useCase: string;
  personalData: PersonalData;
  externalUse: YesNo;
  automatedDecisions: YesNo;
  risk: { score: number; level: string; actions: string[] };
}) {
  const toolList = p.tools.length ? p.tools.join(", ") : "—";
  const uc = p.useCase.trim() || "—";

  return [
    "KI-Nutzungsrichtlinie",
    "für den Einsatz von Künstlicher Intelligenz im Unternehmen",
    "",
    `Unternehmen: ${p.company}`,
    `Adresse: ${p.address}`,
    `Branche: ${industryLabelDe(p.industry)} | Mitarbeiter: ${p.employees}`,
    `Stand: ${p.dateISO} | Version: ${p.version}`,
    "",
    "0. Hinweis (Disclaimer)",
    "Vorlagecharakter. Keine Rechtsberatung. Ohne Gewähr. Diese Richtlinie muss an die konkreten Prozesse und Risiken angepasst werden.",
    "",
    "1. Zweck",
    "Diese Richtlinie regelt die Nutzung von KI-Systemen im Unternehmen. Ziel ist ein verantwortungsvoller, sicherer und rechtskonformer Einsatz.",
    "",
    "2. Grundprinzipien",
    "- Human Review vor externer Nutzung",
    "- Datensparsamkeit und Zweckbindung",
    "- Keine Geheimnisse/Credentials in öffentliche Tools",
    "- Fakten/Quellen prüfen",
    "",
    "3. Unternehmensspezifische Angaben (aus Fragebogen)",
    `Eingesetzte Tools: ${toolList}`,
    `Use Case: ${uc}`,
    `Personenbezogene Daten: ${personalDataLabelDe(p.personalData)}`,
    `Externe Nutzung: ${p.externalUse === "yes" ? "ja" : "nein"}`,
    `Automatisierte Entscheidungen: ${p.automatedDecisions === "yes" ? "ja" : "nein"}`,
    "",
    "4. Risiko-Einschätzung (Matrix)",
    `Risikostufe: ${p.risk.level} (Score: ${p.risk.score}/6)`,
    "Empfohlene Maßnahmen:",
    ...p.risk.actions.map((a) => `- ${a}`),
    "",
    "5. Inkrafttreten",
    "Diese Richtlinie tritt mit Veröffentlichung in Kraft.",
  ];
}

function getTransparencyDeLines(p: { company: string; dateISO: string; version: string; tools: string[]; useCase: string; externalUse: YesNo }) {
  const toolList = p.tools.length ? p.tools.join(", ") : "—";
  const uc = p.useCase.trim() || "—";

  return [
    "Transparenzhinweis zur Nutzung von KI",
    "",
    `Unternehmen: ${p.company}`,
    `Stand: ${p.dateISO} | Version: ${p.version}`,
    "",
    "Wir setzen KI-Systeme zur Unterstützung interner Prozesse ein.",
    "KI-Outputs werden vor externer Nutzung durch eine Person geprüft (Human Review).",
    "",
    `Tools: ${toolList}`,
    `Use Case: ${uc}`,
    `Externe Nutzung von Outputs: ${p.externalUse === "yes" ? "ja" : "nein"}`,
    "",
    "Hinweis: Vorlage. Keine Rechtsberatung.",
  ];
}

function getRiskDeLines(p: { company: string; dateISO: string; version: string; personalData: PersonalData; externalUse: YesNo; automatedDecisions: YesNo; risk: { score: number; level: string; actions: string[] } }) {
  return [
    "KI-Risiko-Selbsteinschätzung",
    "",
    `Unternehmen: ${p.company}`,
    `Stand: ${p.dateISO} | Version: ${p.version}`,
    "",
    `Personenbezogene Daten: ${personalDataLabelDe(p.personalData)}`,
    `Externe Nutzung: ${p.externalUse === "yes" ? "ja" : "nein"}`,
    `Automatisierte Entscheidungen: ${p.automatedDecisions === "yes" ? "ja" : "nein"}`,
    "",
    `Ergebnis (Matrix): ${p.risk.level} (Score: ${p.risk.score}/6)`,
    "",
    "Empfohlene Maßnahmen:",
    ...p.risk.actions.map((a) => `- ${a}`),
    "",
    "Hinweis: Vorlage. Keine Rechtsberatung.",
  ];
}

function getSummaryDeLines(p: { company: string; dateISO: string; version: string; industry: Industry; employees: Employees; risk: { score: number; level: string } }) {
  return [
    "Compliance-Zusammenfassung",
    "",
    `Unternehmen: ${p.company}`,
    `Stand: ${p.dateISO} | Version: ${p.version}`,
    `Branche: ${industryLabelDe(p.industry)} | Mitarbeiter: ${p.employees}`,
    "",
    "Paket enthält:",
    "- KI-Nutzungsrichtlinie (DE) / AI Use Policy (EN)",
    "- Transparenzhinweis (DE/EN)",
    "- Risiko-Selbsteinschätzung (DE/EN)",
    "- KI-Register (Excel, DE/EN)",
    "",
    `Risikostufe (Matrix): ${p.risk.level} (Score: ${p.risk.score}/6)`,
    "",
    "Hinweis: Vorlage. Keine Rechtsberatung.",
  ];
}

function getAiUsePolicyEnLines(p: { company: string; address: string; dateISO: string; version: string; industry: Industry; employees: Employees; tools: string[]; useCase: string; personalData: PersonalData; externalUse: YesNo; automatedDecisions: YesNo; risk: { score: number; level: string; actions: string[] } }) {
  const toolList = p.tools.length ? p.tools.join(", ") : "—";
  const uc = p.useCase.trim() || "—";

  return [
    "AI Use Policy",
    "",
    `Company: ${p.company}`,
    `Address: ${p.address}`,
    `Industry: ${industryLabelEn(p.industry)} | Employees: ${p.employees}`,
    `Date: ${p.dateISO} | Version: ${p.version}`,
    "",
    "Disclaimer: Template only. Not legal advice.",
    "",
    "Company specifics:",
    `Tools: ${toolList}`,
    `Use case: ${uc}`,
    `Personal data: ${personalDataLabelEn(p.personalData)}`,
    `External use of outputs: ${p.externalUse === "yes" ? "Yes" : "No"}`,
    `Automated decisions with impact: ${p.automatedDecisions === "yes" ? "Yes" : "No"}`,
    "",
    "Risk result (matrix):",
    `Risk level: ${p.risk.level} (Score: ${p.risk.score}/6)`,
    "Recommended controls:",
    ...p.risk.actions.map((a) => `- ${a}`),
  ];
}

function getTransparencyEnLines(p: { company: string; dateISO: string; version: string; tools: string[]; useCase: string; externalUse: YesNo }) {
  const toolList = p.tools.length ? p.tools.join(", ") : "—";
  const uc = p.useCase.trim() || "—";

  return [
    "AI Transparency Notice",
    "",
    `Company: ${p.company}`,
    `Date: ${p.dateISO} | Version: ${p.version}`,
    "",
    "We use AI tools to support internal work. Outputs are reviewed by a human before external use.",
    "",
    `Tools: ${toolList}`,
    `Use case: ${uc}`,
    `External use of outputs: ${p.externalUse === "yes" ? "Yes" : "No"}`,
    "",
    "Template only. Not legal advice.",
  ];
}

function getRiskEnLines(p: { company: string; dateISO: string; version: string; personalData: PersonalData; externalUse: YesNo; automatedDecisions: YesNo; risk: { score: number; level: string; actions: string[] } }) {
  return [
    "AI Risk Self-Assessment",
    "",
    `Company: ${p.company}`,
    `Date: ${p.dateISO} | Version: ${p.version}`,
    "",
    `Personal data: ${personalDataLabelEn(p.personalData)}`,
    `External use: ${p.externalUse === "yes" ? "Yes" : "No"}`,
    `Automated decisions with impact: ${p.automatedDecisions === "yes" ? "Yes" : "No"}`,
    "",
    `Result (matrix): ${p.risk.level} (Score: ${p.risk.score}/6)`,
    "",
    "Recommended controls:",
    ...p.risk.actions.map((a) => `- ${a}`),
    "",
    "Template only. Not legal advice.",
  ];
}

function getSummaryEnLines(p: { company: string; dateISO: string; version: string; industry: Industry; employees: Employees; risk: { score: number; level: string } }) {
  return [
    "Compliance Summary",
    "",
    `Company: ${p.company}`,
    `Date: ${p.dateISO} | Version: ${p.version}`,
    `Industry: ${industryLabelEn(p.industry)} | Employees: ${p.employees}`,
    "",
    "Package includes:",
    "- AI Use Policy (EN) / KI Policy (DE)",
    "- Transparency Notice (DE/EN)",
    "- Risk Self-Assessment (DE/EN)",
    "- AI Register (Excel, DE/EN)",
    "",
    `Risk level (matrix): ${p.risk.level} (Score: ${p.risk.score}/6)`,
    "",
    "Template only. Not legal advice.",
  ];
}

export async function POST(req: Request) {
  const body = await req.json();

  const sessionId = safeStr(body.session_id, 300);
  const company = safeStr(body.company, 200);
  const address = safeStr(body.address, 200);

  if (!sessionId) return Response.json({ error: "missing_session_id" }, { status: 400 });
  if (!sessionId.startsWith("cs_")) return Response.json({ error: "invalid_session_id", hint: "must start with cs_" }, { status: 400 });
  if (!company.trim()) return Response.json({ error: "missing_company" }, { status: 400 });
  if (!address.trim()) return Response.json({ error: "missing_address" }, { status: 400 });

  const tools = safeStr(body.tools, 500)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const useCase = safeStr(body.useCase, 300);

  if (!tools.length) return Response.json({ error: "missing_tools" }, { status: 400 });
  if (!useCase.trim()) return Response.json({ error: "missing_useCase" }, { status: 400 });

  const personalData = toEnum<PersonalData>(body.personalData, ["no", "limited", "regular"] as const, "no");
  const externalUse = toEnum<YesNo>(body.externalUse, ["no", "yes"] as const, "no");
  const automatedDecisions = toEnum<YesNo>(body.automatedDecisions, ["no", "yes"] as const, "no");

  const industry = toEnum<Industry>(
    body.industry,
    ["it", "consulting", "marketing", "ecommerce", "health", "finance", "education", "other"] as const,
    "other"
  );
  const employees = toEnum<Employees>(body.employees, ["1-5", "6-20", "21-50", "51-200", "200+"] as const, "1-5");

  const dateISO = new Date().toISOString().slice(0, 10);
  const version = process.env.APP_VERSION || "1.0-test";

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e: any) {
    return Response.json({ error: "stripe_error", message: e?.message || String(e) }, { status: 500 });
  }

  const ok =
    (session.mode === "payment" && session.payment_status === "paid") ||
    (session.mode === "subscription" && !!session.subscription);

  if (!ok) return Response.json({ error: "not_paid" }, { status: 403 });

  const risk = computeRisk(personalData, externalUse, automatedDecisions);

  const zip = new JSZip();
  const de = zip.folder("DE")!;
  const en = zip.folder("EN")!;

  // PDFs (DE)
  de.file(
    "KI-Nutzungsrichtlinie.pdf",
    await makeSimplePdf(
      "KI-Nutzungsrichtlinie",
      getKiPolicyDeLines({ company, address, dateISO, version, industry, employees, tools, useCase, personalData, externalUse, automatedDecisions, risk })
    )
  );

  de.file(
    "Transparenzhinweis-KI.pdf",
    await makeSimplePdf("Transparenzhinweis", getTransparencyDeLines({ company, dateISO, version, tools, useCase, externalUse }))
  );

  de.file(
    "Risiko-Selbsteinschaetzung.pdf",
    await makeSimplePdf("Risiko-Selbsteinschaetzung", getRiskDeLines({ company, dateISO, version, personalData, externalUse, automatedDecisions, risk }))
  );

  de.file(
    "Compliance-Zusammenfassung.pdf",
    await makeSimplePdf("Compliance-Zusammenfassung", getSummaryDeLines({ company, dateISO, version, industry, employees, risk }))
  );

  // PDFs (EN)
  en.file(
    "AI-Use-Policy.pdf",
    await makeSimplePdf("AI Use Policy", getAiUsePolicyEnLines({ company, address, dateISO, version, industry, employees, tools, useCase, personalData, externalUse, automatedDecisions, risk }))
  );

  en.file(
    "AI-Transparency-Notice.pdf",
    await makeSimplePdf("AI Transparency Notice", getTransparencyEnLines({ company, dateISO, version, tools, useCase, externalUse }))
  );

  en.file(
    "AI-Risk-Self-Assessment.pdf",
    await makeSimplePdf("AI Risk Self-Assessment", getRiskEnLines({ company, dateISO, version, personalData, externalUse, automatedDecisions, risk }))
  );

  en.file(
    "Compliance-Summary.pdf",
    await makeSimplePdf("Compliance Summary", getSummaryEnLines({ company, dateISO, version, industry, employees, risk }))
  );

  // Excel AI Register
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("AI Register");

  ws.addRow(["Company", company]);
  ws.addRow(["Address", address]);
  ws.addRow(["Industry", industryLabelEn(industry)]);
  ws.addRow(["Employees", employees]);
  ws.addRow(["Date", dateISO]);
  ws.addRow(["Version", version]);
  ws.addRow([]);
  ws.addRow(["Risk level", `${risk.level} (${risk.score}/6)`]);
  ws.addRow([]);

  ws.addRow(["Tool", "Use case", "Industry", "Employees", "Personal data", "External use", "Automation", "Risk", "Last review"]);

  const pdLabel = personalDataLabelEn(personalData);
  const extLabel = externalUse === "yes" ? "Yes" : "No";
  const autLabel = automatedDecisions === "yes" ? "Yes" : "No";
  const riskLabel = `${risk.level} (${risk.score}/6)`;

  for (const tool of tools) {
    ws.addRow([tool, useCase, industryLabelEn(industry), employees, pdLabel, extLabel, autLabel, riskLabel, dateISO]);
  }

  ws.columns = [
    { width: 18 },
    { width: 36 },
    { width: 18 },
    { width: 14 },
    { width: 18 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
  ];

  const xlsx = Buffer.from(await wb.xlsx.writeBuffer());
  de.file("Internes-KI-Verzeichnis.xlsx", xlsx);
  en.file("Internal-AI-Register.xlsx", xlsx);

  const out = await zip.generateAsync({ type: "arraybuffer" });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  return new Response(out, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="AI-Compliance-DE-EN_${stamp}.zip"`,
      "cache-control": "no-store, max-age=0",
      "pragma": "no-cache",
    },
  });
}
