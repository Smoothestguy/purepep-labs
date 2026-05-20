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
  <body style="margin:0;padding:0;background:#0a0d12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f4f6f9;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0d12;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 8px 24px 8px;">
                <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#98a0ad;">
                  § 00 · Confirmation
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px;">
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.1;letter-spacing:-0.01em;color:#f4f6f9;font-weight:600;">
                  You're on the list.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 8px 0 8px;">
                <p style="margin:0;font-size:16px;line-height:1.55;color:#c4cad3;">
                  Thanks for signing up. PurePep Labs is briefly offline while
                  we finish the catalog and documentation system. We'll email
                  you the moment it's live so you can review compounds,
                  Certificates of Analysis, and stability data.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 0 8px;">
                <p style="margin:0;font-size:16px;line-height:1.55;color:#c4cad3;">
                  In the meantime, no further action is required from you.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 8px 0 8px;">
                <div style="border-top:1px solid rgba(255,255,255,0.10);padding-top:24px;">
                  <p style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#98a0ad;line-height:1.6;">
                    PurePep Labs · Houston, TX<br>
                    For laboratory research use only · Not for human consumption
                  </p>
                </div>
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

In the meantime, no further action is required from you.

—
PurePep Labs · Houston, TX
For laboratory research use only · Not for human consumption`;
}
