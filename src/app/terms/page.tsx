export const metadata = {
  title: "Nutzungsbedingungen",
};

export default function Terms() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Nutzungsbedingungen</h1>

      <p>
        Diese Website wird betrieben von Ananyin Studio GmbH.
      </p>

      <h2>1. Leistungsgegenstand</h2>
      <p>
        Wir stellen digitale Vorlagen und automatisch generierte Dokumente im Zusammenhang mit
        der Nutzung von Künstlicher Intelligenz zur Verfügung.
      </p>

      <h2>2. Kein Rechtsrat</h2>
      <p>
        Alle bereitgestellten Inhalte dienen ausschließlich Informationszwecken und stellen keine
        Rechtsberatung dar.
      </p>

      <h2>3. Digitale Inhalte</h2>
      <p>
        Die bereitgestellten Dokumente sind digitale Inhalte. Nach Beginn der Ausführung besteht
        kein Widerrufsrecht gemäß §356 Abs. 5 BGB (bei B2B entsprechend ausgeschlossen).
      </p>

      <h2>4. Haftung</h2>
      <p>
        Die Nutzung der Vorlagen erfolgt auf eigene Verantwortung. Eine Haftung für Vollständigkeit,
        Aktualität oder rechtliche Wirksamkeit ist ausgeschlossen.
      </p>

      <h2>5. Kündigung von Abonnements</h2>
      <p>
        Abonnements können jederzeit über den Stripe-Kundenbereich oder per E-Mail gekündigt werden.
      </p>

      <p style={{ opacity: 0.8 }}>
        Stand: {new Date().toISOString().slice(0,10)}
      </p>
    </main>
  );
}
