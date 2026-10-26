import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function createPendingOrder({
  email,
  discordUsername,
  cart,
  requestDetails = "",
  paymentReference,
}) {
  if (!supabase) {
    throw new Error("Order storage is not configured yet. Please try again later.");
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error("Your bag is empty.");
  }

  const allowedPrices = {
    1: { name: "Private Vault", price: 1000 },
    2: { name: "Inner Circle", price: 500 },
    3: { name: "Priority Pass", price: 1500 },
    4: { name: "Custom Access", price: 2500 },
  };

  // Build totals from the known catalogue rather than trusting browser-supplied prices.
  const items = cart.map((item) => {
    const product = allowedPrices[item.id];
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("One of the items in your bag is invalid.");
    }
    return {
      id: item.id,
      name: product.name,
      unit_price_cents: product.price,
      quantity,
    };
  });

  const totalCents = items.reduce(
    (sum, item) => sum + item.unit_price_cents * item.quantity,
    0
  );

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_email: email.trim(),
      discord_username: discordUsername.trim(),
      items,
      total_cents: totalCents,
      payment_method: "cashapp",
      payment_reference: paymentReference.trim(),
      request_details: requestDetails.trim(),
      status: "pending",
    })
    .select("id, created_at, status")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
