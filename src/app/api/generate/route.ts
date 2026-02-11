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
    "Compliance-Zusammenfassung.pdf",
    await makeSimplePdf("Compliance-Zusammenfassung (1 Seite)", [
      `Unternehmen: ${company}`,
      "Status: Dokumente erstellt",
      "Hinweis: Vorlage, keine Rechtsberatung.",
    ])
  );

  en.file(
    "Compliance-Summary.pdf",
    await makeSimplePdf("Compliance Summary (1 page)", [
      `Company: ${company}`,
      "Status: Documents generated",
      "Note: Template only, not legal advice.",
    ])
  );

  const out = await zip.generateAsync({ type: "uint8array" });

// гарантированно получаем ArrayBuffer
const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);

return new Response(ab, {
  headers: {
    "content-type": "application/zip",
    "content-disposition": 'attachment; filename="AI-Compliance-DE-EN.zip"',
  },
});
}
