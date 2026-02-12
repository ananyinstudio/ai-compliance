export const metadata = {
  title: "Impressum | Ananyin Studio GmbH",
};

export default function Impressum() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Impressum</h1>

      <h2>Ananyin Studio GmbH</h2>
      <p>
        Berliner Str. 6<br />
        15345 Altlandsberg<br />
        Deutschland
      </p>

      <p>
        <strong>USt-IdNr.:</strong> DE288103653
      </p>

      <p>
        <strong>E-Mail:</strong> contact@ananyin.studio
      </p>

      <hr />

      <p style={{ opacity: 0.8 }}>
        Hinweis: Inhalte dieser Website stellen keine Rechtsberatung dar.
      </p>

      {/* ВАЖНО: добавь сюда обязательно Geschäftsführer + HRB + Registergericht.
          Я не могу их придумать. Оставил блок, который ты просто дополнишь. */}
      <h2>Vertretungsberechtigte</h2>
      <p>
        Geschäftsführer: <strong>A.Ananyin</strong>
      </p>

      <h2>Handelsregister</h2>
      <p>
        Registergericht: <strong>Amtsgericht Frankfurt (Oder)</strong><br />
        HRB: <strong>HRB 15019 FF</strong>
      </p>
    </main>
  );
}
