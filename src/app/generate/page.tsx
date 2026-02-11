"use client";

export default function Generate({ searchParams }: any) {
  const session_id = searchParams?.session_id || "";

  async function submit(e: any) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: any = { session_id };
    fd.forEach((v, k) => (payload[k] = v));

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Generation failed");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AI-Compliance-DE-EN.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Dokumente generieren</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <input name="company" placeholder="Unternehmensname" required />
        <input name="address" placeholder="Adresse" required />
        <select name="employees" required>
          <option value="">Mitarbeiterzahl</option>
          <option>1-10</option><option>11-50</option><option>51-200</option><option>200+</option>
        </select>
        <select name="uses_personal_data" required>
          <option value="">Personenbezogene Daten?</option>
          <option value="no">Nein</option>
          <option value="limited">Ja, begrenzt</option>
          <option value="regular">Ja, regelmäßig</option>
        </select>
        <select name="external_use" required>
          <option value="">KI-Ergebnisse extern genutzt?</option>
          <option value="no">Nein</option>
          <option value="yes">Ja</option>
        </select>

        <button style={{ padding: "12px 16px" }}>ZIP herunterladen (DE + EN)</button>
      </form>
    </main>
  );
}
