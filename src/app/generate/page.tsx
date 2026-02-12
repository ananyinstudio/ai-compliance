"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #d9d9d9",
};

function GenerateInner() {
  const sp = useSearchParams();

  const [sessionId, setSessionId] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");

  const [toolChatGPT, setToolChatGPT] = useState(true);
  const [toolOther, setToolOther] = useState("");

  const [useCase, setUseCase] = useState("");
  const [personalData, setPersonalData] = useState<PersonalData>("no");
  const [externalUse, setExternalUse] = useState<YesNo>("no");
  const [automatedDecisions, setAutomatedDecisions] = useState<YesNo>("no");

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const sid = sp.get("session_id");
    if (sid?.startsWith("cs_")) setSessionId(sid);
  }, [sp]);

  const toolsCsv = useMemo(() => {
    const t: string[] = [];
    if (toolChatGPT) t.push("ChatGPT");
    if (toolOther.trim()) t.push(toolOther.trim());
    return t.join(", ");
  }, [toolChatGPT, toolOther]);

  const canSubmit =
    sessionId.startsWith("cs_") &&
    company.trim() &&
    address.trim() &&
    toolsCsv &&
    useCase.trim();

  async function onGenerate() {
    setBusy(true);
    setMsg(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          company,
          address,
          tools: toolsCsv,
          useCase,
          personalData,
          externalUse,
          automatedDecisions,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "AI-Compliance.zip";
      a.click();
      URL.revokeObjectURL(url);

      setMsg("ZIP heruntergeladen.");
    } catch (e: any) {
      setMsg(e.message || "Fehler");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Generate Compliance Documents</h1>

      <input style={inputStyle} value={sessionId} readOnly placeholder="session_id" />

      <input
        style={inputStyle}
        placeholder="Company name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Use case"
        value={useCase}
        onChange={(e) => setUseCase(e.target.value)}
      />

      <button disabled={!canSubmit || busy} onClick={onGenerate}>
        {busy ? "Generating…" : "Generate ZIP"}
      </button>

      {msg && <p>{msg}</p>}
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <GenerateInner />
    </Suspense>
  );
}
