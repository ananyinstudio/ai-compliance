"use client";

async function go(mode: "sub" | "one") {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  const data = await res.json();
  window.location.href = data.url;
}

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>AI-Compliance-Paket (EU)</h1>
      <p>Pflichtdokumente (DE + EN) für Unternehmen, die KI einsetzen.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
  {/* Subscription – visible but disabled */}
  <button
    disabled
    title="Coming soon"
    style={{
      padding: "12px 16px",
      background: "#f2f2f2",
      color: "#999",
      border: "1px solid #ddd",
      borderRadius: 10,
      cursor: "not-allowed",
      fontWeight: 600,
    }}
  >
    39 € / Monat (Abo – bald verfügbar)
  </button>

  {/* One-time payment */}
  <button
    onClick={() => go("one")}
    style={{
      padding: "12px 16px",
      borderRadius: 10,
      border: "1px solid #ddd",
      background: "white",
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    249 € einmalig
  </button>
</div>

      <p style={{ marginTop: 24, opacity: 0.8 }}>
        Kein Ersatz für Rechtsberatung. Vorlagen &amp; Guidance.
      </p>

      <p style={{ marginTop: 24, opacity: 0.8 }}>
      <a href="/impressum">Impressum</a> ·{" "}
      <a href="/datenschutz">Datenschutz</a> ·{" "}
      <a href="/terms">Terms</a> ·{" "}
      <a href="/refund">Refund</a>
      </p>
      
    </main>
  );
}


