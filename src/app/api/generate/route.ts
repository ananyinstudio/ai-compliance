import Stripe from "stripe";
import JSZip from "jszip";
import { PDFDocument, StandardFonts } from "pdf-lib";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

async function makeSimplePdf(title: string, lines: string[]) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(title, { x: 50, y: 800, size: 18, font });

  let y = 770;
  for (const l of lines) {
    page.drawText(l, { x: 50, y, size: 11, font });
    y -= 16;
  }
  return Buffer.from(await pdf.save());
}

export async function POST(req: Request) {
  const body = await req.json();
  const sessionId = body.session_id as string;

  if (!sessionId) return Response.json({ error: "missing session_id" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const ok =
    (session.mode === "payment" && session.payment_status === "paid") ||
    (session.mode === "subscription" && !!session.subscription);

  if (!ok) return Response.json({ error: "not paid" }, { status: 403 });

  const company = String(body.company || "").slice(0, 200);
  const address = String(body.address || "").slice(0, 200);

  const zip = new JSZip();

  const de = zip.folder("DE")!;
  const en = zip.folder("EN")!;

  de.file(
    "KI-Nutzungsrichtlinie.pdf",
    await makeSimplePdf("KI-Nutzungsrichtlinie", [
      `Unternehmen: ${company}`,
      `Adresse: ${address}`,
      "",
      "Dieses Dokument ist eine Vorlage und stellt keine Rechtsberatung dar.",
      "Zweck: interne Regeln zur Nutzung von KI-Tools (z.B. ChatGPT, Copilot).",
    ])
  );

  en.file(
    "AI-Use-Policy.pdf",
    await makeSimplePdf("AI Use Policy", [
      `Company: ${company}`,
      `Address: ${address}`,
      "",
      "Template only. Not legal advice.",
      "Purpose: internal rules for using AI tools (e.g., ChatGPT, Copilot).",
    ])
  );

  // Excel register (DE/EN одинаковый файл можно, но сделаем два для симметрии)
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("AI Register");
  ws.addRow(["Tool", "Purpose", "Users", "Data types", "Risk", "Last review"]);
  ws.addRow(["ChatGPT", "Text drafting", "Employees", "Possible personal data", "Low", new Date().toISOString().slice(0, 10)]);
  const xlsx = Buffer.from(await wb.xlsx.writeBuffer());

  de.file("Internes-KI-Verzeichnis.xlsx", xlsx);
  en.file("Internal-AI-Register.xlsx", xlsx);

 de.file(
  "KI-Nutzungsrichtlinie.pdf",
  await makeSimplePdf("KI-Nutzungsrichtlinie", getKiPolicyDeLines(company, address))
);

  en.file(
    "Compliance-Summary.pdf",
    await makeSimplePdf("Compliance Summary (1 page)", [
      `Company: ${company}`,
      "Status: Documents generated",
      "Note: Template only, not legal advice.",
    ])
  );

const out = await zip.generateAsync({ type: "arraybuffer" });

return new Response(out, {
  headers: {
    "content-type": "application/zip",
    "content-disposition": 'attachment; filename="AI-Compliance-DE-EN.zip"',
  },
});

function getKiPolicyDeLines(company: string, address: string) {
  return [
    "KI-Nutzungsrichtlinie",
    "für den Einsatz von Künstlicher Intelligenz im Unternehmen",
    "",
    `Unternehmen: ${company}`,
    `Adresse: ${address}`,
    "",
    "1. Zweck der Richtlinie",
    "Diese Richtlinie regelt die Nutzung von Systemen der Künstlichen Intelligenz (KI) innerhalb des Unternehmens. Ziel ist es, einen verantwortungsvollen, sicheren und rechtskonformen Einsatz von KI-Anwendungen sicherzustellen.",
    "",
    "Die Richtlinie dient insbesondere:",
    "- der Risikominimierung",
    "- der Einhaltung regulatorischer Anforderungen (u. a. EU AI Act)",
    "- dem Schutz personenbezogener Daten",
    "- der Wahrung von Geschäfts- und Betriebsgeheimnissen",
    "- der Vermeidung haftungsrechtlicher Risiken",
    "",
    "2. Geltungsbereich",
    "Diese Richtlinie gilt für alle Mitarbeitenden, Führungskräfte, freie Mitarbeitende sowie sonstige Personen, die im Namen des Unternehmens KI-Systeme einsetzen.",
    "",
    "Sie umfasst sowohl:",
    "- öffentlich zugängliche KI-Tools (z. B. generative KI-Systeme)",
    "- unternehmensinterne KI-Lösungen",
    "- KI-Funktionen in Drittsoftware",
    "",
    "3. Begriffsbestimmungen",
    "Künstliche Intelligenz (KI): Softwaregestützte Systeme, die Inhalte generieren, Entscheidungen unterstützen oder automatisierte Analysen durchführen.",
    "Generative KI: KI-Systeme, die Texte, Bilder, Code oder sonstige Inhalte erzeugen.",
    "",
    "4. Zulässige Nutzung",
    "Die Nutzung von KI-Systemen ist grundsätzlich zulässig, sofern:",
    "1. keine vertraulichen oder geheimhaltungsbedürftigen Informationen ungeschützt eingegeben werden",
    "2. keine personenbezogenen Daten ohne Rechtsgrundlage verarbeitet werden",
    "3. Ergebnisse vor externer Verwendung geprüft werden",
    "4. keine diskriminierenden oder rechtswidrigen Inhalte erzeugt oder verbreitet werden",
    "",
    "Die finale Verantwortung für erzeugte Inhalte verbleibt stets beim verantwortlichen Mitarbeitenden.",
    "",
    "5. Verbotene Nutzung",
    "Untersagt ist insbesondere:",
    "- die Eingabe von Betriebs- und Geschäftsgeheimnissen in öffentliche KI-Systeme",
    "- die Verarbeitung sensibler personenbezogener Daten ohne ausdrückliche Freigabe",
    "- der Einsatz von KI zur automatisierten Entscheidungsfindung mit rechtlicher Wirkung ohne gesonderte Prüfung",
    "- die Nutzung von KI zur Erstellung rechtswidriger Inhalte",
    "",
    "6. Datenschutz und Informationssicherheit",
    "Bei der Nutzung von KI-Systemen sind die Vorgaben der DSGVO sowie interne Datenschutzrichtlinien einzuhalten.",
    "",
    "Insbesondere ist sicherzustellen, dass:",
    "- keine besonderen Kategorien personenbezogener Daten verarbeitet werden",
    "- Auftragsverarbeitungsverträge geprüft sind",
    "- Speicherorte und Datenflüsse transparent dokumentiert sind",
    "",
    "7. Transparenz und Dokumentation",
    "Der Einsatz von KI-Systemen ist intern zu dokumentieren. Hierzu gehört insbesondere:",
    "- Bezeichnung des eingesetzten Tools",
    "- Zweck der Nutzung",
    "- Art der verarbeiteten Daten",
    "- Risikobewertung",
    "",
    "8. Schulung und Sensibilisierung",
    "Mitarbeitende sind regelmäßig über Risiken generativer KI, Datenschutzanforderungen und sichere Nutzung zu informieren.",
    "",
    "9. Verantwortlichkeiten",
    "Die Geschäftsleitung trägt die Gesamtverantwortung für die Einführung und Überwachung dieser Richtlinie. Führungskräfte stellen die Einhaltung im jeweiligen Verantwortungsbereich sicher.",
    "",
    "10. Haftungsausschluss",
    "Diese Richtlinie stellt eine interne Organisationsmaßnahme dar. Sie ersetzt keine individuelle Rechtsberatung.",
    "",
    "11. Inkrafttreten",
    "Diese Richtlinie tritt mit Veröffentlichung in Kraft."
  ];
}
