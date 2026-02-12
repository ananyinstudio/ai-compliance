export const metadata = {
  title: "Datenschutzerklärung | Ananyin Studio GmbH",
};

export default function Datenschutz() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Datenschutzerklärung</h1>

      <h2>1. Verantwortlicher</h2>
      <p>
        Ananyin Studio GmbH<br />
        Berliner Str. 6, 15345 Altlandsberg, Deutschland<br />
        E-Mail: contact@ananyin.studio
      </p>

      <h2>2. Verarbeitete Daten</h2>
      <ul>
        <li>
          <strong>Checkout/Bezahlung:</strong> Bei Zahlungen werden Zahlungsdaten über Stripe verarbeitet
          (z. B. Name, E-Mail, Zahlungsstatus, Rechnungs-/Adressdaten, ggf. Steuer-ID). Wir erhalten dabei
          keine vollständigen Kartendaten.
        </li>
        <li>
          <strong>Nutzungsdaten:</strong> Technische Daten wie IP-Adresse, Zeitstempel, Browser-/Geräteinformationen
          können zur Bereitstellung und Sicherheit der Website verarbeitet werden.
        </li>
        <li>
          <strong>Formulardaten:</strong> Angaben, die Sie zur Dokumentenerstellung eingeben (z. B. Adresse, Use Case),
          werden zur Generierung der Dokumente verarbeitet.
        </li>
      </ul>

      <h2>3. Zwecke und Rechtsgrundlagen</h2>
      <ul>
        <li>
          <strong>Vertragserfüllung</strong> (Art. 6 Abs. 1 lit. b DSGVO): Bereitstellung des digitalen Produkts,
          Abwicklung von Zahlungen, Erstellung und Bereitstellung der Dokumente.
        </li>
        <li>
          <strong>Berechtigtes Interesse</strong> (Art. 6 Abs. 1 lit. f DSGVO): Betrieb, Sicherheit und Missbrauchsvermeidung,
          technische Protokollierung.
        </li>
        <li>
          <strong>Rechtliche Verpflichtung</strong> (Art. 6 Abs. 1 lit. c DSGVO): Aufbewahrungspflichten, steuer- und handelsrechtliche Vorgaben.
        </li>
      </ul>

      <h2>4. Empfänger</h2>
      <p>
        <strong>Stripe</strong> (Zahlungsdienstleister). Je nach Konfiguration kann Stripe Daten in Drittländern verarbeiten.
        Weitere Informationen finden Sie in den Datenschutzhinweisen von Stripe.
      </p>

      <h2>5. Speicherdauer</h2>
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist bzw. gesetzliche
        Aufbewahrungspflichten bestehen.
      </p>

      <h2>6. Ihre Rechte</h2>
      <ul>
        <li>Auskunft (Art. 15 DSGVO)</li>
        <li>Berichtigung (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch (Art. 21 DSGVO)</li>
        <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
      </ul>

      <h2>7. Kontakt</h2>
      <p>
        Für Datenschutzanfragen: contact@ananyin.studio
      </p>

      <hr />
      <p style={{ opacity: 0.8 }}>
        Hinweis: Diese Datenschutzerklärung ist ein allgemeiner Text für ein digitales Produkt und ersetzt keine
        individuelle Rechtsberatung.
      </p>
    </main>
  );
}
