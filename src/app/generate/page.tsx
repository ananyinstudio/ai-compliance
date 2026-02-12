"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function Card(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid #e6e6e6",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{props.title}</div>
        {props.subtitle && <div style={{ opacity: 0.7, marginTop: 4 }}>{props.subtitle}</div>}
      </div>
      {props.children}
    </section>
  );
}

function LabelRow(props: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 600 }}>{props.label}</div>
      {props.hint && <div style={{ opacity: 0.7, fontSize: 13 }}>{props.hint}</div>}
      {props.children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #d9d9d9",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: "white",
};

export default function GeneratePage() {
  const sp = useSearchParams();

  // Payment
  const [sessionId, setSessionId] = useState("");

  // Client company details (go into PDFs)
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");

  // Questionnaire
  const [industry, setIndustry] = useState<Industry>("it");
  const [employees, setEmployees] = useState<Employees>("1-5");

  const [toolChatGPT, setToolChatGPT] = useState(true);
  const [toolCopilot, setToolCopilot] = useState(false);
  const [toolClaude, setToolClaude] = useState(false);
  const [toolGemini, setToolGemini] = useState(false);
  const [toolOther, setToolOther] = useState("");
  const [useCase, setUseCase] = useState("Textentwürfe und Zusammenfassungen");

  const [personalData, setPersonalData] = useState<PersonalData>("no");
  const [externalUse, setExternalUse] = useState<YesNo>("no");
  const [automatedDecisions, setAutomatedDecisions] = useState<YesNo>("no");

  // UX
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Auto-fill session_id from URL (?session_id=cs_...)
  useEffect(() => {
    const sid = sp.get("session_id");
    if (sid && sid.startsWith("cs_")) setSessionId(sid);
  }, [sp]);

  const toolsCsv = useMemo(() => {
    const t: string[] = [];
    if (toolChatGPT) t.push("ChatGPT");
    if (toolCopilot) t.push("Copilot");
    if (toolClaude) t.push("Claude");
    if (toolGemini) t.push("Gemini");
    if (toolOther.trim()) t.push(toolOther.trim());
    return t.join(", ");
  }, [toolChatGPT, toolCopilot, toolClaude, toolGemini, toolOther]);

  const canSubmit = useMemo(() => {
    return (
      !!sessionId.trim() &&
      sessionId.trim().startsWith("cs_") &&
      !!company.trim() &&
      !!address.trim() &&
      toolsCsv.length > 0 &&
      !!useCase.trim()
    );
  }, [sessionId, company, address, toolsCsv, useCase]);

  async function onGenerate() {
    setMsg(null);
    if (!canSubmit) {
      setMsg("Bitte fülle session_id (cs_...), Firmenname, Adresse, Tools und Use Case aus.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json", "cache-control": "no-store" },
        cache: "no-store",
        body: JSON.stringify({
          session_id: sessionId.trim(),
          company: company.trim(),
          address: address.trim(),
          tools: toolsCsv,
          useCase: useCase.trim(),
          personalData,
          externalUse,
          automatedDecisions,
          industry,
          employees,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${t}`);
      }

      const blob = await res.blob();
      const cd = res.headers.get("content-disposition");
      const match = cd?.match(/filename="([^"]+)"/);
      const filename = match?.[1] || "AI-Compliance-DE-EN.zip";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMsg("ZIP wurde erstellt und heruntergeladen.");
    } catch (e: any) {
      setMsg(e?.message || "Fehler beim Generieren.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "32px auto",
        padding: 16,
        fontFamily: "system-ui",
        background: "#fafafa",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Dokumente generieren</h1>
        <div style={{ opacity: 0.75, marginTop: 8 }}>
          Tipp: Nach der Zahlung kommen Sie über <code>/success</code> automatisch hierher – ohne Kopieren.
        </div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        <Card title="1) Zahlung" subtitle="Nur bezahlte Checkout-Sessions können Dokumente generieren.">
          <LabelRow label="session_id" hint="Muss mit cs_ beginnen (z. B. cs_test_... / cs_live_...)">
            <input
              style={inputStyle}
              placeholder="cs_..."
              value={sessionId}
              readOnly={sessionId.startsWith("cs_") && !!sp.get("session_id")}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </LabelRow>
        </Card>

        <Card title="2) Unternehmensdaten des Kunden" subtitle="Diese Angaben stehen in den PDFs.">
          <div style={{ display: "grid", gap: 12 }}>
            <LabelRow label="Firmenname" hint="z. B. Muster GmbH">
              <input
                style={inputStyle}
                placeholder="Muster GmbH"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </LabelRow>

            <LabelRow label="Adresse" hint="Straße, PLZ Ort">
              <input
                style={inputStyle}
                placeholder="Beispielstraße 1, 10115 Berlin"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </LabelRow>
          </div>
        </Card>

        <Card title="3) Fragebogen" subtitle="Damit die Dokumente nicht generisch wirken.">
          <div style={{ display: "grid", gap: 12 }}>
            <LabelRow label="Branche">
              <select style={selectStyle} value={industry} onChange={(e) => setIndustry(e.target.value as Industry)}>
                <option value="it">IT / Software</option>
                <option value="consulting">Consulting</option>
                <option value="marketing">Marketing / Media</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </LabelRow>

            <LabelRow label="Mitarbeiterzahl">
              <select style={selectStyle} value={employees} onChange={(e) => setEmployees(e.target.value as Employees)}>
                <option value="1-5">1–5</option>
                <option value="6-20">6–20</option>
                <option value="21-50">21–50</option>
                <option value="51-200">51–200</option>
                <option value="200+">200+</option>
              </select>
            </LabelRow>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>KI-Tools</div>
              <div style={{ display: "grid", gap: 6 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={toolChatGPT} onChange={(e) => setToolChatGPT(e.target.checked)} />
                  ChatGPT
                </label>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={toolCopilot} onChange={(e) => setToolCopilot(e.target.checked)} />
                  Copilot
                </label>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={toolClaude} onChange={(e) => setToolClaude(e.target.checked)} />
                  Claude
                </label>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="checkbox" checked={toolGemini} onChange={(e) => setToolGemini(e.target.checked)} />
                  Gemini
                </label>

                <LabelRow label="Andere (optional)" hint="z. B. Midjourney, Perplexity">
                  <input style={inputStyle} value={toolOther} onChange={(e) => setToolOther(e.target.value)} />
                </LabelRow>
              </div>

              <div style={{ opacity: 0.75, fontSize: 13 }}>
                Wird gesendet als: <code>{toolsCsv || "—"}</code>
              </div>
            </div>

            <LabelRow label="Use Case (kurz)" hint="Was macht der Kunde konkret mit KI?">
              <input style={inputStyle} value={useCase} onChange={(e) => setUseCase(e.target.value)} />
            </LabelRow>

            <LabelRow label="Personenbezogene Daten">
              <select
                style={selectStyle}
                value={personalData}
                onChange={(e) => setPersonalData(e.target.value as PersonalData)}
              >
                <option value="no">Keine</option>
                <option value="limited">Begrenzt</option>
                <option value="regular">Regelmäßig</option>
              </select>
            </LabelRow>

            <LabelRow label="Externe Nutzung von Outputs">
              <select style={selectStyle} value={externalUse} onChange={(e) => setExternalUse(e.target.value as YesNo)}>
                <option value="no">Nein</option>
                <option value="yes">Ja</option>
              </select>
            </LabelRow>

            <LabelRow label="Automatisierte Entscheidungen mit Wirkung">
              <select
                style={selectStyle}
                value={automatedDecisions}
                onChange={(e) => setAutomatedDecisions(e.target.value as YesNo)}
              >
                <option value="no">Nein</option>
                <option value="yes">Ja</option>
              </select>
            </LabelRow>
          </div>
        </Card>

        <Card title="4) ZIP erstellen" subtitle="Erstellt DE+EN PDFs + Excel-Register.">
          <button
            onClick={onGenerate}
            disabled={!canSubmit || busy}
            style={{
              padding: 12,
              fontWeight: 700,
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              background: !canSubmit || busy ? "#f0f0f0" : "white",
              cursor: !canSubmit || busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Erstelle ZIP..." : "ZIP erstellen"}
          </button>

          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
            {canSubmit ? "Bereit." : "Fehlt noch: cs_ session_id + Firmenname + Adresse + Tools + Use Case"}
          </div>

          {msg && <div style={{ marginTop: 10, padding: 10, background: "#f5f5f5", borderRadius: 10 }}>{msg}</div>}
        </Card>
      </div>
    </main>
  );
}
