import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: Request) {
  const { mode } = await req.json(); // "sub" | "one"
  const baseUrl = process.env.BASE_URL!;
  const price =
    mode === "sub" ? process.env.STRIPE_PRICE_SUB! : process.env.STRIPE_PRICE_ONE_TIME!;

  const session = await stripe.checkout.sessions.create({
    mode: mode === "sub" ? "subscription" : "payment",
    line_items: [{ price, quantity: 1 }],
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/`,
    billing_address_collection: "auto",
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
