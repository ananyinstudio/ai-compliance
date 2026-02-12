"use client";

import { useMemo, useState } from "react";

type PersonalData = "no" | "limited" | "regular";
type YesNo = "no" | "yes";

export default function GeneratePage() {
  const [sessionId, setSessionId] = useState("");
  const [address, setAddress] = useState("");

  const [tools, setTools] = useState("ChatGPT");
  const [useCase, setUseCase] = useState("Textentwürfe und Zusammenfassungen");
  const [personalData, setPersonalData] = useState<PersonalData>("no");
  const [externalUse, setExternalUse] = useState<YesNo>("no");
  const [automatedDecisions, setAutomatedDecisions] = useState<YesNo>("no");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!sessionId.trim() && !!address.trim(), [sessionId, address]);

  async function onGenerate() {
    setMsg(null);
    if (!canSubmit) {
      setMsg("Bitte session_id und Adresse angeben.");
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
          address: address.trim(),
          tools: tools.trim(), // CSV: "ChatGPT, Copilot"
          useCase: useCase.trim(),
          personalData,
          externalUse,
          automatedDecisions,
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
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Dokumente generieren</h1>

      <p style={{ opacity: 0.8 }}>
        Test Mode: Verwende die session_id aus der /success URL (session_id=...).
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        <label>
          <div>session_id</div>
          <input
            style={{ width: "100%", padding: 10 }}
            placeholder="cs_test_..."
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
          />
        </label>

        <label>
          <div>Adresse (für Dokumente)</div>
          <input
            style={{ width: "100%", padding: 10 }}
            placeholder="Berliner Str. 6, 15345 Altlandsberg"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <label>
          <div>KI-Tools (kommagetrennt)</div>
          <input
            style={{ width: "100%", padding: 10 }}
            placeholder="ChatGPT, Copilot, Claude"
            value={tools}
            onChange={(e) => setTools(e.target.value)}
          />
        </label>

        <label>
          <div>Use Case (kurz)</div>
          <input
            style={{ width: "100%", padding: 10 }}
            placeholder="z.B. Textentwürfe, Zusammenfassungen, Ideen"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
          />
        </label>

        <label>
          <div>Personenbezogene Daten</div>
          <select
            style={{ width: "100%", padding: 10 }}
            value={personalData}
            onChange={(e) => setPersonalData(e.target.value as PersonalData)}
          >
            <option value="no">Keine</option>
            <option value="limited">Begrenzt</option>
            <option value="regular">Regelmäßig</option>
          </select>
        </label>

        <label>
          <div>Externe Nutzung von Outputs</div>
          <select
            style={{ width: "100%", padding: 10 }}
            value={externalUse}
            onChange={(e) => setExternalUse(e.target.value as YesNo)}
          >
            <option value="no">Nein</option>
            <option value="yes">Ja</option>
          </select>
        </label>

        <label>
          <div>Automatisierte Entscheidungen mit Wirkung</div>
          <select
            style={{ width: "100%", padding: 10 }}
            value={automatedDecisions}
            onChange={(e) => setAutomatedDecisions(e.target.value as YesNo)}
          >
            <option value="no">Nein</option>
            <option value="yes">Ja</option>
          </select>
        </label>

        <button
          onClick={onGenerate}
          disabled={!canSubmit || busy}
          style={{ padding: 12, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}
        >
          {busy ? "Erstelle ZIP..." : "ZIP erstellen"}
        </button>

        {msg && <div style={{ padding: 10, background: "#f5f5f5" }}>{msg}</div>}
      </div>
    </main>
  );
}
