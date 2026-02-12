import Stripe from "stripe";
import JSZip from "jszip";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

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
  const MAX_CHARS = 95; // грубый перенос по длине (MVP)

  const wrap = (s: string) => {
    const out: string[] = [];
    const text = String(s ?? "");
    if (!text) return [""];
    if (text.length <= MAX_CHARS) return [text];
    for (let i = 0; i < text.length; i += MAX_CHARS) {
      out.push(text.slice(i, i + MAX_CHARS));
    }
    return out;
  };

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  page.drawText(title, { x: MARGIN_X, y: PAGE_H - MARGIN_TOP, size: TITLE_SIZE, font });

  let y = PAGE_H - MARGIN_TOP - 30;

  for (const line of lines) {
    for (const chunk of wrap(line)) {
      if (y < MARGIN_BOTTOM) {
        page = pdf.addPage([PAGE_W, PAGE_H]);
        page.drawText(title, { x: MARGIN_X, y: PAGE_H - MARGIN_TOP, size: TITLE_SIZE, font });
        y = PAGE_H - MARGIN_TOP - 30;
      }
      page.drawText(chunk, { x: MARGIN_X, y, size: TEXT_SIZE, font });
      y -= LINE_GAP;
    }
  }

  return Buffer.from(await pdf.save());
}

function getKiPolicyDeLines(company: string, address: string, dateISO: string, version: string, tools: string[], useCase: string, personalData: "no"|"limited"|"regular", externalUse: "no"|"yes", automatedDecisions: "no"|"yes") {
  const pd = personalData === "no" ? "nein" : personalData === "limited" ? "ja, begrenzt" : "ja, regelmäßig";
  const ex = externalUse === "yes" ? "ja" : "nein";
  const ad = automatedDecisions === "yes" ? "ja" : "nein";
  const toolList = tools?.length ? tools.join(", ") : "—";
  const uc = useCase?.trim() ? useCase.trim() : "—";

  return [
    "KI-Nutzungsrichtlinie",
    "für den Einsatz von Künstlicher Intelligenz im Unternehmen",
    "",
    `Unternehmen: ${company}`,
    `Adresse: ${address}`,
    `Stand: ${dateISO}`,
    `Version: ${version}`,
    "",
    "0. Hinweis (wichtiger Disclaimer)",
    "Diese Vorlage stellt keine Rechtsberatung dar. Sie dient als interne Organisationsrichtlinie und muss ggf. an die konkreten Prozesse und Risiken des Unternehmens angepasst werden.",
    "",
    "1. Zweck der Richtlinie",
    "Diese Richtlinie regelt die Nutzung von Systemen der Künstlichen Intelligenz (KI) im Unternehmen. Ziel ist ein verantwortungsvoller, sicherer und rechtskonformer Einsatz.",
    "Sie soll Risiken reduzieren, Transparenz erhöhen und Mindeststandards für Datenschutz, Informationssicherheit und Qualitätssicherung festlegen.",
    "",
    "2. Geltungsbereich",
    "Diese Richtlinie gilt für alle Mitarbeitenden, Führungskräfte, freien Mitarbeitenden sowie sonstige Personen, die im Namen des Unternehmens KI-Systeme einsetzen.",
    "Sie gilt für öffentlich zugängliche KI-Tools (z. B. generative KI), interne KI-Anwendungen sowie KI-Funktionen in Drittsoftware.",
    "",
    "3. Begriffsbestimmungen",
    "Künstliche Intelligenz (KI): Softwaregestützte Systeme, die Inhalte generieren, Entscheidungen unterstützen oder automatisierte Analysen durchführen.",
    "Generative KI: KI-Systeme, die Texte, Bilder, Code oder sonstige Inhalte erzeugen.",
    "Output: Ergebnis, das durch ein KI-System erzeugt wird (z. B. Text, Code, Zusammenfassung).",
    "",
    "4. Grundprinzipien (verbindlich)",
    "4.1 Human-in-the-Loop (Review-Pflicht)",
    "KI-Outputs dürfen extern (z. B. an Kunden, Behörden, Öffentlichkeit) nur nach menschlicher Prüfung verwendet werden. Die prüfende Person ist für Inhalt und Wirkung verantwortlich.",
    "",
    "4.2 Wahrheit, Transparenz, Nicht-Täuschung",
    "KI darf nicht eingesetzt werden, um Dritte zu täuschen (z. B. Fake-Identitäten, erfundene Zitate, fingierte Quellen). Aussagen mit Faktenbezug sind zu verifizieren.",
    "",
    "4.3 Datensparsamkeit und Zweckbindung",
    "Es dürfen nur die für den Zweck notwendigen Daten genutzt werden. Eingaben sind möglichst zu anonymisieren oder zu pseudonymisieren.",
    "",
    "5. Zulässige Nutzung (Beispiele)",
    "- Entwürfe für Texte (interne Notizen, E-Mails, Zusammenfassungen) mit anschließender Prüfung",
    "- Strukturierung von Informationen und Ideensammlung",
    "- Programmierhilfe/Code-Vorschläge mit Code-Review",
    "- Übersetzungs- und Sprachhilfe ohne vertrauliche Inhalte",
    "",
    "6. Verbotene Nutzung (No-Go)",
    "Untersagt ist insbesondere:",
    "- Eingabe von Betriebs- und Geschäftsgeheimnissen in öffentliche KI-Systeme ohne Freigabe",
    "- Eingabe sensibler personenbezogener Daten (z. B. Gesundheitsdaten) ohne Freigabe und Rechtsgrundlage",
    "- Nutzung von KI zur automatisierten Entscheidungsfindung mit rechtlicher Wirkung ohne gesonderte Freigabe/Prüfung",
    "- Erstellung diskriminierender, rechtswidriger oder rufschädigender Inhalte",
    "- Upload von geschütztem Material (z. B. Kundenverträge) in öffentliche Systeme ohne Prüfung der Rechte",
    "",
    "7. Datenschutz (DSGVO) und Informationssicherheit",
    "7.1 Personenbezogene Daten",
    `Im Fragebogen angegeben: Personenbezogene Daten werden verarbeitet: ${pd}.`,
    "Personenbezogene Daten dürfen nur verarbeitet werden, wenn eine Rechtsgrundlage besteht und interne Datenschutzvorgaben eingehalten werden.",
    "Vor Eingaben sind folgende Mindestregeln einzuhalten:",
    "- Keine besonderen Kategorien personenbezogener Daten (Art. 9 DSGVO) ohne ausdrückliche Freigabe",
    "- Daten minimieren (nur das Nötigste) und wenn möglich anonymisieren",
    "- Keine Passwörter, Zugangsdaten, Tokens oder vertrauliche Schlüssel eingeben",
    "",
    "7.2 Vertraulichkeit / Geschäftsgeheimnisse",
    "Vertrauliche Informationen (z. B. interne Zahlen, Strategien, Kundendaten, Quellcode mit Geheimhaltungsrelevanz) dürfen nicht in öffentliche Tools eingegeben werden, sofern keine Freigabe und keine geeigneten Schutzmaßnahmen vorliegen.",
    "",
    "7.3 Auftragsverarbeitung / Drittanbieter",
    "Vor Nutzung eines KI-Drittanbieters ist zu prüfen, ob ein Auftragsverarbeitungsvertrag (AVV) erforderlich ist und ob Datenflüsse, Speicherorte und Sicherheitsmaßnahmen akzeptabel sind.",
    "",
    "8. Prompt-Regeln (Do / Don’t)",
    "8.1 Do (erlaubt/empfohlen)",
    "- Nutze neutrale Beispiel-Daten statt echter Kundendaten",
    "- Formuliere den Zweck klar (z. B. 'Entwurf', 'Zusammenfassung')",
    "- Fordere eine Struktur (Gliederung, Bullet Points) und prüfe das Ergebnis",
    "- Markiere interne Inhalte als 'intern' und halte sie aus öffentlichen Tools heraus",
    "",
    "8.2 Don’t (verboten/zu vermeiden)",
    "- Keine Passwörter, API-Keys, Zugangsdaten, Tokens",
    "- Keine vollständigen Kundendatensätze oder Vertragsdokumente",
    "- Keine vertraulichen Strategiepapiere oder Preislisten",
    "- Keine ungeprüfte Veröffentlichung von KI-Outputs",
    "",
    "9. Qualitätssicherung (Pflichtprozess bei externer Nutzung)",
    "Vor externer Nutzung von KI-Outputs sind mindestens folgende Schritte durchzuführen:",
    "1) Plausibilitäts- und Faktencheck (Quellen prüfen, Zahlen verifizieren)",
    "2) Prüfung auf sensible Daten/Vertraulichkeit",
    "3) Prüfung auf Rechte (Urheberrecht, Lizenzen, Marken)",
    "4) Freigabe durch zuständige Person (mind. Vier-Augen-Prinzip bei kritischen Inhalten)",
    "",
    "10. Transparenz & Dokumentation",
    "Der Einsatz von KI-Systemen ist intern zu dokumentieren (KI-Verzeichnis). Zu erfassen sind u. a.:",
    "- Tool/Produktname, Version/Anbieter",
    "- Zweck/Use Case",
    "- Datenarten (z. B. keine/gering/regelmäßig personenbezogene Daten)",
    "- Risiko-Einschätzung (niedrig/mittel/hoch) und getroffene Maßnahmen",
    "- Review-Datum und Verantwortliche",
    "",
    "11. Rollen & Verantwortlichkeiten",
    "11.1 Geschäftsleitung",
    "Trägt die Gesamtverantwortung für Einführung, Kontrolle und Durchsetzung dieser Richtlinie.",
    "",
    "11.2 Führungskräfte",
    "Stellen die Einhaltung im jeweiligen Verantwortungsbereich sicher und organisieren Schulungen/Reviews.",
    "",
    "11.3 Mitarbeitende",
    "Halten diese Richtlinie ein, melden Vorfälle/Unsicherheiten und dokumentieren relevante KI-Nutzung.",
    "",
    "12. Incident- und Eskalationsprozess",
    "Bei Verdacht auf Datenabfluss, Fehlentscheidungen, Sicherheitsvorfälle oder rechtswidrige Inhalte gilt:",
    "- Nutzung sofort stoppen (soweit möglich)",
    "- Vorfall intern melden (Security/Datenschutz/Management)",
    "- Betroffene Systeme und Eingaben dokumentieren",
    "- Ggf. externe Meldungen/Benachrichtigungen prüfen (z. B. DSGVO)",
    "",
    "13. Unternehmensspezifische Angaben (aus Fragebogen)",
    `Eingesetzte Tools: ${toolList}`,
    `Use Case: ${uc}`,
    `Externe Nutzung von Outputs: ${ex}`,
    `Automatisierte Entscheidungen mit Wirkung: ${ad}`,
    "",
    "14. Haftungsausschluss",
    "Diese Richtlinie ist eine Vorlage. Sie ersetzt keine individuelle Rechtsberatung. Ohne Gewähr für Vollständigkeit, Aktualität und rechtliche Wirksamkeit im Einzelfall.",
    "",
    "15. Inkrafttreten",
    "Diese Richtlinie tritt mit Veröffentlichung in Kraft."
  ];
}

function getAiUsePolicyEnLines(company: string, address: string, dateISO: string, version: string, tools: string[], useCase: string, personalData: "no"|"limited"|"regular", externalUse: "no"|"yes", automatedDecisions: "no"|"yes") {
  const pd = personalData === "no" ? "No" : "Yes";
  const ex = externalUse === "yes" ? "Yes" : "No";
  const ad = automatedDecisions === "yes" ? "Yes" : "No";
  const toolList = tools?.length ? tools.join(", ") : "—";
  const uc = useCase?.trim() ? useCase.trim() : "—";

  return [
    "AI Use Policy",
    "",
    `Company: ${company}`,
    `Address: ${address}`,
    `Date: ${dateISO}`,
    `Version: ${version}`,
    "",
    "0. Disclaimer",
    "Template only. Not legal advice. You should adapt this policy to your specific processes and risk profile.",
    "",
    "1. Purpose",
    "This policy sets minimum rules for responsible, safe, and compliant use of AI tools in the company.",
    "",
    "2. Scope",
    "Applies to employees, contractors, and anyone using AI tools on behalf of the company.",
    "Covers public AI tools, internal AI systems, and AI features embedded in third-party software.",
    "",
    "3. Principles",
    "- Human review before external use of AI outputs.",
    "- Do not input confidential information into public AI tools unless approved and protected.",
    "- Use data minimization; avoid personal data where possible.",
    "",
    "4. Prohibited use",
    "- Sharing secrets, credentials, tokens, or sensitive information with public tools.",
    "- Generating unlawful, discriminatory, or misleading content.",
    "- Fully automated decisions with legal or similarly significant effects without dedicated approval and safeguards.",
    "",
    "5. Data protection and security",
    `Personal data involved (questionnaire): ${pd}`,
    "Only process personal data with a lawful basis and appropriate safeguards. Avoid special categories of personal data unless explicitly approved.",
    "",
    "6. Quality control (external use)",
    "Before using AI output externally:",
    "1) Verify facts and sources",
    "2) Check for confidential/personal data",
    "3) Check IP/licensing where relevant",
    "4) Obtain approval for high-impact content",
    "",
    "7. Documentation",
    "Maintain an internal AI register documenting tool, purpose, data types, risk level, and review date.",
    "",
    "8. Company specifics (questionnaire)",
    `Tools: ${toolList}`,
    `Use case: ${uc}`,
    `External use of outputs: ${ex}`,
    `Automated decisions with impact: ${ad}`,
    "",
    "9. Effective date",
    "This policy is effective upon publication."
  ];
}

export async function POST(req: Request) {
  const body = await req.json();

  const company = "Ananyin Studio GmbH";
  const address = String(body.address || "").slice(0, 200);

  const dateISO = new Date().toISOString().slice(0, 10);
  const version = process.env.APP_VERSION || "0.2-test";

  const tools = String(body.tools || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const useCase = String(body.useCase || "");
  const personalData = (body.personalData || "no") as "no"|"limited"|"regular";
  const externalUse = (body.externalUse || "no") as "no"|"yes";
  const automatedDecisions = (body.automatedDecisions || "no") as "no"|"yes";
  const sessionId = String(body.session_id || "");

  if (!sessionId) return Response.json({ error: "missing session_id" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const ok =
    (session.mode === "payment" && session.payment_status === "paid") ||
    (session.mode === "subscription" && !!session.subscription);

  if (!ok) return Response.json({ error: "not paid" }, { status: 403 });

  const zip = new JSZip();
  const de = zip.folder("DE")!;
  const en = zip.folder("EN")!;

de.file(
  "KI-Nutzungsrichtlinie.pdf",
  await makeSimplePdf(
    "KI-Nutzungsrichtlinie",
    getKiPolicyDeLines(company, address, dateISO, version, tools, useCase, personalData, externalUse, automatedDecisions)
  )
);

en.file(
  "AI-Use-Policy.pdf",
  await makeSimplePdf(
    "AI Use Policy",
    getAiUsePolicyEnLines(company, address, dateISO, version, tools, useCase, personalData, externalUse, automatedDecisions)
  )
);

  // Excel register (один и тот же, но разложим в обе папки)
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("AI Register");
  ws.addRow(["Tool", "Purpose", "Users", "Data types", "Risk", "Last review"]);
  ws.addRow([
    "ChatGPT",
    "Text drafting",
    "Employees",
    "Possible personal data",
    "Low",
    new Date().toISOString().slice(0, 10)
  ]);
  const xlsx = Buffer.from(await wb.xlsx.writeBuffer());
  de.file("Internes-KI-Verzeichnis.xlsx", xlsx);
  en.file("Internal-AI-Register.xlsx", xlsx);

  // 1-page summaries
  de.file(
    "Compliance-Zusammenfassung.pdf",
    await makeSimplePdf("Compliance-Zusammenfassung (1 Seite)", [
      `Unternehmen: ${company}`,
      "Status: Dokumente erstellt",
      "Hinweis: Vorlage, keine Rechtsberatung."
    ])
  );

  en.file(
    "Compliance-Summary.pdf",
    await makeSimplePdf("Compliance Summary (1 page)", [
      `Company: ${company}`,
      "Status: Documents generated",
      "Note: Template only, not legal advice."
    ])
  );

  const out = await zip.generateAsync({ type: "arraybuffer" });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

return new Response(out, {
  headers: {
    "content-type": "application/zip",
    "content-disposition": `attachment; filename="AI-Compliance-DE-EN_${stamp}.zip"`,
    "cache-control": "no-store, max-age=0",
    "pragma": "no-cache"
  }
});
}
