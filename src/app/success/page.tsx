import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function SuccessPage({ searchParams }: any) {
  const sessionId = (searchParams?.session_id as string | undefined) || "";

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return <div style={{ padding: 16 }}>Missing or invalid session_id.</div>;
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e: any) {
    return <div style={{ padding: 16 }}>Could not verify payment. ({e?.message || "stripe_error"})</div>;
  }

  const ok =
    (session.mode === "payment" && session.payment_status === "paid") ||
    (session.mode === "subscription" && !!session.subscription);

  if (!ok) {
    return <div style={{ padding: 16 }}>Payment not confirmed yet.</div>;
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Danke! ✅</h1>
      <p>Jetzt können Sie Ihre Dokumente (DE + EN) generieren.</p>

      <form action="/generate" method="GET" style={{ marginTop: 16 }}>
        <input type="hidden" name="session_id" value={sessionId} />
        <button style={{ padding: "12px 16px", fontWeight: 700 }}>Dokumente generieren</button>
      </form>

      <p style={{ marginTop: 16, opacity: 0.6, fontSize: 12 }}>
        Session: <code>{sessionId}</code>
      </p>
    </main>
  );
}
