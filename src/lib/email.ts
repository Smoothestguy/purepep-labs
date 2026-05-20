import { Resend } from "resend";

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

const FROM = process.env.EMAIL_FROM ?? "PurePep Labs <support@purepep-labs.com>";

// Logo hosted at /images/PurePep_Label_email.png with email-friendly cache
// headers configured in next.config.ts. Vercel's default `must-revalidate`
// header confuses some mail proxies; we override it for /images/* to use
// immutable long-cache headers that Gmail / Apple Mail handle reliably.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thepurepep.com";
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
    subject: "You're on the PurePep Labs list",
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
    <title>You're on the PurePep Labs list</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0d12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f6f9;">
    <!-- Preheader (hidden in body, shows as snippet in inbox preview) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;">
      You're on the PurePep Labs waitlist. We'll notify you the moment the catalog opens.
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
                  alt="PurePep Labs"
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
                        Thanks for signing up. PurePep Labs is briefly offline
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
                  PurePep Labs &middot; Houston, TX<br>
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

function waitlistConfirmationText(): string {
  return `You're on the list.

Thanks for signing up. PurePep Labs is briefly offline while we finish the catalog and documentation system. We'll email you the moment it's live so you can review compounds, Certificates of Analysis, and stability data.

No further action is required from you.

—
PurePep Labs · Houston, TX
For laboratory research use only · Not for human consumption`;
}
