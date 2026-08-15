import { Resend } from "resend";
import { resolveSiteOrigin } from "@/lib/site-url";

// Single-instance client — Resend SDK is lightweight and safe to reuse across
// invocations. Env vars are read lazily so `next build` doesn't fail when
// Resend isn't yet provisioned.
let cached: Resend | null = null;
function client(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

const FROM = process.env.EMAIL_FROM ?? "The Pure Pep <support@thepurepep.com>";

// Logo hosted at /images/PurePep_Label_email.png with email-friendly cache
// headers configured in next.config.ts. Vercel's default `must-revalidate`
// header confuses some mail proxies; we override it for /images/* to use
// immutable long-cache headers that Gmail / Apple Mail handle reliably.
// Shared resolver so mail and Stripe's return URLs can't disagree about
// which origin this deployment is. The literal is a last resort: an email
// with a broken logo is better than one that fails to render at all.
const SITE_URL = resolveSiteOrigin() ?? "https://thepurepep.com";
const LOGO_URL = `${SITE_URL}/images/PurePep_Label_email.png`;

export async function sendWaitlistConfirmation(to: string): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping confirmation send");
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "You're on the The Pure Pep list",
    html: waitlistConfirmationHtml(),
    text: waitlistConfirmationText(),
  });

  if (error) {
    console.warn("[email] resend error:", error.message);
  }
}

function waitlistConfirmationHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>You're on the The Pure Pep list</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0d12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f6f9;">
    <!-- Preheader (hidden in body, shows as snippet in inbox preview) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;">
      You're on the The Pure Pep waitlist. We'll notify you the moment the catalog opens.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0d12;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#0a0d12;">

            <!-- Brand logo -->
            <tr>
              <td align="center" style="padding:0 0 32px 0;">
                <img
                  src="${LOGO_URL}"
                  alt="The Pure Pep"
                  width="80"
                  height="82"
                  style="display:block;width:80px;height:auto;border:0;outline:none;text-decoration:none;"
                >
              </td>
            </tr>

            <!-- Card frame -->
            <tr>
              <td style="padding:0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0e131a;border:1px solid rgba(255,255,255,0.08);border-radius:6px;">
                  <tr>
                    <td style="padding:36px 32px 32px 32px;">

                      <!-- Brand accent bar -->
                      <div style="height:2px;width:48px;background:linear-gradient(90deg,#4763d9,#4dd2e8);margin:0 0 24px 0;line-height:2px;font-size:0;">&nbsp;</div>

                      <!-- Eyebrow -->
                      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#98a0ad;margin:0 0 12px 0;">
                        § 00 · Confirmation
                      </div>

                      <!-- Headline -->
                      <h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.1;letter-spacing:-0.01em;color:#f4f6f9;font-weight:600;">
                        You&rsquo;re on the list.
                      </h1>

                      <!-- Body -->
                      <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#c4cad3;">
                        Thanks for signing up. The Pure Pep is briefly offline
                        while we finish the catalog and documentation system.
                        We&rsquo;ll email you the moment it&rsquo;s live so you
                        can review compounds, Certificates of Analysis, and
                        stability data.
                      </p>
                      <p style="margin:0;font-size:15px;line-height:1.6;color:#c4cad3;">
                        No further action is required from you.
                      </p>

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 8px 0 8px;">
                <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#7d8593;line-height:1.7;text-align:center;">
                  The Pure Pep &middot; Houston, TX<br>
                  <span style="color:#5e6571;">For laboratory research use only &middot; Not for human consumption</span>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ── Order confirmation ───────────────────────────────────────────────

type OrderEmailLine = {
  name: string;
  dose: string;
  quantity: number;
  line_total_cents: number;
};

export type OrderConfirmationInput = {
  to: string;
  orderRef: string;
  items: OrderEmailLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Sent after a successful charge. Deliberately best-effort: the caller
 * swallows failures so a mail outage can't turn a paid order into an
 * error page for the customer.
 */
export async function sendOrderConfirmation(
  input: OrderConfirmationInput,
): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skipping order confirmation");
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `Order ${input.orderRef} confirmed — The Pure Pep`,
    html: orderConfirmationHtml(input),
    text: orderConfirmationText(input),
  });

  if (error) {
    console.warn("[email] resend error:", error.message);
  }
}

function orderConfirmationHtml(o: OrderConfirmationInput): string {
  const rows = o.items
    .map(
      (i) => `
              <tr>
                <td style="padding:8px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;color:#f4f6f9;border-bottom:1px solid rgba(255,255,255,0.08);">
                  ${i.name} &middot; ${i.dose}${i.quantity > 1 ? ` &times; ${i.quantity}` : ""}
                </td>
                <td align="right" style="padding:8px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;color:#f4f6f9;border-bottom:1px solid rgba(255,255,255,0.08);">
                  ${money(i.line_total_cents)}
                </td>
              </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
  </head>
  <body style="margin:0;padding:0;background:#0a0d12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0d12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${LOGO_URL}" alt="The Pure Pep" width="90" style="display:block;border:0;">
              </td>
            </tr>

            <tr>
              <td style="padding:0 8px 8px 8px;">
                <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#4dd2e8;">
                  Order ${o.orderRef}
                </p>
                <h1 style="margin:12px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#f4f6f9;font-weight:normal;">
                  Order confirmed
                </h1>
                <p style="margin:12px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#98a0ad;">
                  Thanks — your payment went through. We dispatch cold-chain within one business day and email a signed Certificate of Analysis with every lot.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                  <tr>
                    <td style="padding:12px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">Subtotal</td>
                    <td align="right" style="padding:12px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">${money(o.subtotalCents)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">Shipping</td>
                    <td align="right" style="padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">${money(o.shippingCents)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#f4f6f9;letter-spacing:0.1em;">TOTAL</td>
                    <td align="right" style="padding:8px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#4dd2e8;">${money(o.totalCents)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0 8px;">
                <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#7d8593;line-height:1.7;text-align:center;">
                  The Pure Pep &middot; Houston, TX<br>
                  <span style="color:#5e6571;">For laboratory research use only &middot; Not for human consumption</span>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function orderConfirmationText(o: OrderConfirmationInput): string {
  const lines = o.items
    .map(
      (i) =>
        `- ${i.name} · ${i.dose}${i.quantity > 1 ? ` x${i.quantity}` : ""}  ${money(i.line_total_cents)}`,
    )
    .join("\n");

  return `Order confirmed — ${o.orderRef}

Thanks — your payment went through. We dispatch cold-chain within one business day and email a signed Certificate of Analysis with every lot.

${lines}

Subtotal: ${money(o.subtotalCents)}
Shipping: ${money(o.shippingCents)}
Total:    ${money(o.totalCents)}

—
The Pure Pep · Houston, TX
For laboratory research use only · Not for human consumption`;
}

// ── Manual payment instructions ──────────────────────────────────────

export type PaymentInstructionsInput = {
  to: string;
  orderRef: string;
  method: "bank_transfer" | "crypto";
  /** Bank details or wallet address, from env — never hardcoded. */
  instructions: string;
  items: OrderEmailLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Sent when a customer chooses bank transfer or crypto. The order is
 * recorded but unpaid, so this email is what actually gets us the money —
 * it leads with the amount, the reference, and the instructions.
 */
export async function sendPaymentInstructions(
  input: PaymentInstructionsInput,
): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY missing — skipping payment instructions",
    );
    return;
  }

  const label =
    input.method === "bank_transfer" ? "Bank transfer" : "Cryptocurrency";

  const { error } = await resend.emails.send({
    from: FROM,
    to: input.to,
    subject: `Payment instructions for order ${input.orderRef} — The Pure Pep`,
    html: paymentInstructionsHtml(input, label),
    text: paymentInstructionsText(input, label),
  });

  if (error) {
    console.warn("[email] resend error:", error.message);
  }
}

function paymentInstructionsHtml(
  o: PaymentInstructionsInput,
  label: string,
): string {
  const rows = o.items
    .map(
      (i) => `
              <tr>
                <td style="padding:8px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;color:#f4f6f9;border-bottom:1px solid rgba(255,255,255,0.08);">
                  ${escapeHtml(i.name)} &middot; ${escapeHtml(i.dose)}${i.quantity > 1 ? ` &times; ${i.quantity}` : ""}
                </td>
                <td align="right" style="padding:8px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;color:#f4f6f9;border-bottom:1px solid rgba(255,255,255,0.08);">
                  ${money(i.line_total_cents)}
                </td>
              </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark">
  </head>
  <body style="margin:0;padding:0;background:#0a0d12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0d12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

            <tr>
              <td align="center" style="padding-bottom:24px;">
                <img src="${LOGO_URL}" alt="The Pure Pep" width="90" style="display:block;border:0;">
              </td>
            </tr>

            <tr>
              <td style="padding:0 8px 8px 8px;">
                <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#4dd2e8;">
                  Order ${o.orderRef} &middot; awaiting payment
                </p>
                <h1 style="margin:12px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#f4f6f9;font-weight:normal;">
                  Complete your payment
                </h1>
                <p style="margin:12px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#98a0ad;">
                  Your order is reserved. Send <strong style="color:#f4f6f9;">${money(o.totalCents)}</strong> by ${escapeHtml(label.toLowerCase())} using the details below, and quote <strong style="color:#f4f6f9;">${o.orderRef}</strong> as the reference. We dispatch as soon as funds clear.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0 8px;">
                <div style="border:1px solid rgba(255,255,255,0.14);padding:18px;">
                  <p style="margin:0 0 10px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#98a0ad;">
                    ${escapeHtml(label)} details
                  </p>
                  <pre style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;line-height:1.7;color:#f4f6f9;white-space:pre-wrap;word-break:break-word;">${escapeHtml(o.instructions)}</pre>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${rows}
                  <tr>
                    <td style="padding:12px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">Subtotal</td>
                    <td align="right" style="padding:12px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">${money(o.subtotalCents)}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">Shipping</td>
                    <td align="right" style="padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:#98a0ad;">${money(o.shippingCents)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#f4f6f9;letter-spacing:0.1em;">AMOUNT DUE</td>
                    <td align="right" style="padding:8px 0 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#4dd2e8;">${money(o.totalCents)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 8px 0 8px;">
                <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#7d8593;line-height:1.7;text-align:center;">
                  The Pure Pep &middot; Houston, TX<br>
                  <span style="color:#5e6571;">For laboratory research use only &middot; Not for human consumption</span>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paymentInstructionsText(
  o: PaymentInstructionsInput,
  label: string,
): string {
  const lines = o.items
    .map(
      (i) =>
        `- ${i.name} · ${i.dose}${i.quantity > 1 ? ` x${i.quantity}` : ""}  ${money(i.line_total_cents)}`,
    )
    .join("\n");

  return `Complete your payment — order ${o.orderRef}

Your order is reserved. Send ${money(o.totalCents)} by ${label.toLowerCase()} using the details below, quoting ${o.orderRef} as the reference. We dispatch as soon as funds clear.

${label.toUpperCase()} DETAILS
${o.instructions}

${lines}

Subtotal:   ${money(o.subtotalCents)}
Shipping:   ${money(o.shippingCents)}
Amount due: ${money(o.totalCents)}

—
The Pure Pep · Houston, TX
For laboratory research use only · Not for human consumption`;
}

function waitlistConfirmationText(): string {
  return `You're on the list.

Thanks for signing up. The Pure Pep is briefly offline while we finish the catalog and documentation system. We'll email you the moment it's live so you can review compounds, Certificates of Analysis, and stability data.

No further action is required from you.

—
The Pure Pep · Houston, TX
For laboratory research use only · Not for human consumption`;
}
