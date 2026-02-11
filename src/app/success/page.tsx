import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function SuccessPage({ searchParams }: any) {
  const sessionId = searchParams?.session_id as string | undefined;
  if (!sessionId) return <div style={{ padding: 16 }}>Missing session_id</div>;

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const ok =
    (session.mode === "payment" && session.payment_status === "paid") ||
    (session.mode === "subscription" && !!session.subscription);

  if (!ok) return <div style={{ padding: 16 }}>Payment not confirmed yet.</div>;

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui", padding: 16 }}>
      <h1>Danke! ✅</h1>
      <p>Jetzt können Sie Ihre Dokumente (DE + EN) generieren.</p>

      <form action="/generate" method="GET" style={{ marginTop: 16 }}>
        <input type="hidden" name="session_id" value={sessionId} />
        <button style={{ padding: "12px 16px" }}>Dokumente generieren</button>
      </form>
    </main>
  );
}
