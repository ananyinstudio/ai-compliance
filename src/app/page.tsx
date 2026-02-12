"use client";

async function go(mode: "sub" | "one") {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode }),
  });

  const data = await res.json();
  if (!data?.url) {
    alert("Checkout konnte nicht gestartet werden.");
    return;
  }
  window.location.href = data.url;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ marginBottom: 8, lineHeight: 1.5 }}>
      {children}
    </li>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
      {subtitle && <div style={{ marginTop: 8, opacity: 0.75 }}>{subtitle}</div>}
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 860,
        margin: "40px auto",
        fontFamily: "system-ui",
        padding: 16,
        lineHeight: 1.45,
      }}
    >
      {/* HERO */}
      <div
        style={{
          padding: 18,
          borderRadius: 16,
          border: "1px solid #e6e6e6",
          background: "#fafafa",
        }}
      >
        <div style={{ display: "inline-block", padding: "6px 10px", border: "1px solid #e6e6e6", borderRadius: 999, background: "white", fontSize: 13, opacity: 0.85 }}>
          EU • DSGVO • KI im Unternehmen
        </div>

        <h1 style={{ margin: "12px 0 6px 0", fontSize: 34, letterSpacing: -0.4 }}>
          AI Compliance Starter Pack (EU)
        </h1>

        <p style={{ margin: 0, fontSize: 18, opacity: 0.85 }}>
          Pflichtdokumente (DE + EN) für Unternehmen, die ChatGPT, Copilot oder ähnliche KI-Tools nutzen.
          <br />
          <strong>In 5 Minuten erstellt.</strong> Einmal zahlen. Sofort herunterladen.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          {/* Abo – visible but disabled */}
          <button
            disabled
            title="Bald verfügbar"
            style={{
              padding: "12px 16px",
              background: "#f2f2f2",
              color: "#999",
              border: "1px solid #ddd",
              borderRadius: 12,
              cursor: "not-allowed",
              fontWeight: 700,
            }}
          >
            39 € / Monat (Abo – bald verfügbar)
          </button>

          {/* One-time */}
          <button
            onClick={() => go("one")}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            249 € einmalig – Jetzt starten
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
          Kein Ersatz für Rechtsberatung. Vorlagen &amp; Guidance. Für KMU, Agenturen, SaaS, Dienstleister.
        </div>
      </div>

      {/* TRUST / VALUE */}
      <Section
        title="Warum das relevant ist"
        subtitle="Compliance wird meistens erst dann wichtig, wenn ein Kunde, ein Datenschutzbeauftragter oder ein Auditor fragt."
      >
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <Bullet>Viele Teams nutzen KI – aber ohne schriftliche Regeln und Dokumentation.</Bullet>
          <Bullet>DSGVO-Risiken: personenbezogene Daten, Vertraulichkeit, Zugänge/Secrets.</Bullet>
          <Bullet>EU AI Act (Governance / Dokumentationspflichten) – vorbereitet statt überrascht.</Bullet>
          <Bullet>Kunden/Partner fragen immer häufiger nach internen Policies und einem „AI Register“.</Bullet>
        </ul>
      </Section>

      {/* WHAT YOU GET */}
      <Section title="Was Sie erhalten (Download als ZIP)">
        <div
          style={{
            display: "grid",
            gap: 10,
            gridTemplateColumns: "1fr",
          }}
        >
          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800 }}>DE</div>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 18 }}>
              <Bullet><strong>KI-Nutzungsrichtlinie</strong> (intern)</Bullet>
              <Bullet><strong>Transparenzhinweis</strong> (DE)</Bullet>
              <Bullet><strong>Risiko-Selbsteinschätzung</strong> (DE)</Bullet>
              <Bullet><strong>Compliance-Zusammenfassung</strong> (DE)</Bullet>
              <Bullet><strong>Internes KI-Verzeichnis</strong> (Excel)</Bullet>
            </ul>
          </div>

          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800 }}>EN</div>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: 18 }}>
              <Bullet><strong>AI Use Policy</strong> (internal)</Bullet>
              <Bullet><strong>AI Transparency Notice</strong> (EN)</Bullet>
              <Bullet><strong>AI Risk Self-Assessment</strong> (EN)</Bullet>
              <Bullet><strong>Compliance Summary</strong> (EN)</Bullet>
              <Bullet><strong>Internal AI Register</strong> (Excel)</Bullet>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
          Die Dokumente werden anhand Ihrer Angaben (Tools, Use Case, Daten, Automatisierung) erstellt.
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section title="So funktioniert’s" subtitle="Keine Accounts. Keine Beratungstermine. Einfach generieren.">
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          <li style={{ marginBottom: 8 }}>Einmalige Zahlung (249 €).</li>
          <li style={{ marginBottom: 8 }}>Firmenname, Adresse und kurze Angaben zu Ihrem KI-Einsatz ausfüllen.</li>
          <li style={{ marginBottom: 8 }}>ZIP herunterladen und intern verwenden / anpassen.</li>
        </ol>
      </Section>

      {/* FOR WHO */}
      <Section title="Für wen ist das geeignet">
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Geeignet</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <Bullet>KMU (ca. 5–200 Mitarbeitende)</Bullet>
              <Bullet>Agenturen, SaaS, IT-Dienstleister</Bullet>
              <Bullet>Teams, die ChatGPT/Copilot/Claude nutzen</Bullet>
              <Bullet>Unternehmen mit Kunden-/Partner-Anforderungen</Bullet>
            </ul>
          </div>

          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Nicht geeignet</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <Bullet>„High-risk“ KI-Systeme (z. B. Medizin/HR-Scoring) ohne individuelle Prüfung</Bullet>
              <Bullet>Konzerne mit eigener Compliance-Abteilung (custom policies nötig)</Bullet>
              <Bullet>Als Ersatz für individuelle Rechtsberatung</Bullet>
            </ul>
          </div>
        </div>
      </Section>

      {/* PRICE */}
      <Section title="Preis">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>249 € einmalig</div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>Sofortiger Download. Kein Abo.</div>
          </div>
          <button
            onClick={() => go("one")}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Jetzt starten
          </button>
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
          Abo (39 € / Monat) kommt später: Updates &amp; Re-Generierung.
        </div>
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800 }}>Ist das Rechtsberatung?</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Nein. Es sind Vorlagen &amp; Guidance. Sie sollten die Dokumente an Ihre Prozesse anpassen und bei Bedarf juristisch prüfen lassen.
            </div>
          </div>

          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800 }}>Ist das „EU AI Act compliant“?</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Die Inhalte sind an gängigen Governance-/Dokumentationsanforderungen orientiert. Keine Garantie – Compliance hängt vom tatsächlichen Einsatz und den Prozessen ab.
            </div>
          </div>

          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800 }}>Kann ich die Dokumente bearbeiten?</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Ja. Sie erhalten PDF + Excel. (Wenn du willst, können wir später zusätzlich DOCX anbieten.)
            </div>
          </div>

          <div style={{ padding: 14, border: "1px solid #e6e6e6", borderRadius: 14 }}>
            <div style={{ fontWeight: 800 }}>Wie lange dauert es?</div>
            <div style={{ marginTop: 6, opacity: 0.85 }}>
              Typischerweise 2–5 Minuten: Zahlung → Angaben → Download.
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div style={{ marginTop: 34, paddingTop: 18, borderTop: "1px solid #eee", fontSize: 14, opacity: 0.85 }}>
        <div>Kein Ersatz für Rechtsberatung. Vorlagen &amp; Guidance.</div>

        <div style={{ marginTop: 10 }}>
          <a href="/impressum">Impressum</a> ·{" "}
          <a href="/datenschutz">Datenschutz</a> ·{" "}
          <a href="/terms">Terms</a> ·{" "}
          <a href="/refund">Refund</a>
        </div>
      </div>
    </main>
  );
}
