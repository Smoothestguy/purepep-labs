#!/usr/bin/env node
// Push the four Supabase Auth email templates from
// supabase-email-templates.html into a Supabase project via the
// Management API.
//
// Required env:
//   SUPABASE_ACCESS_TOKEN     - Personal Access Token (sbp_...), gitignored
//   NEXT_PUBLIC_SUPABASE_URL  - already in .env.local
//
// Run:
//   node --env-file=.env.local scripts/push-supabase-templates.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!TOKEN) {
  console.error(
    "✗ SUPABASE_ACCESS_TOKEN is not set. Add it to .env.local and re-run.",
  );
  process.exit(1);
}
if (!SUPABASE_URL) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local.");
  process.exit(1);
}

// https://vwmcdwqtqzobbctphhwq.supabase.co → vwmcdwqtqzobbctphhwq
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
if (!projectRef) {
  console.error(`✗ Couldn't derive project ref from ${SUPABASE_URL}`);
  process.exit(1);
}

// Map template-file names → Supabase Management API config field names.
const FIELD_MAP = {
  "confirm-signup": {
    subject: "mailer_subjects_confirmation",
    content: "mailer_templates_confirmation_content",
  },
  "magic-link": {
    subject: "mailer_subjects_magic_link",
    content: "mailer_templates_magic_link_content",
  },
  "reset-password": {
    subject: "mailer_subjects_recovery",
    content: "mailer_templates_recovery_content",
  },
  "change-email": {
    subject: "mailer_subjects_email_change",
    content: "mailer_templates_email_change_content",
  },
};

const file = readFileSync(
  join(repoRoot, "supabase-email-templates.html"),
  "utf8",
);

// Parse each <template name="X" subject="Y"> ... </template> block.
const templateRegex =
  /<template\s+name="([^"]+)"\s+subject="([^"]+)">([\s\S]*?)<\/template>/g;

const payload = {};
let count = 0;

let match;
while ((match = templateRegex.exec(file)) !== null) {
  const [, name, subject, body] = match;
  const fields = FIELD_MAP[name];
  if (!fields) {
    console.warn(`! Unknown template name "${name}" — skipping`);
    continue;
  }
  payload[fields.subject] = subject;
  payload[fields.content] = body.trim();
  count++;
  console.log(`✓ Prepared template: ${name} (${body.trim().length} chars)`);
}

if (count === 0) {
  console.error("✗ No templates parsed. Check supabase-email-templates.html.");
  process.exit(1);
}

console.log(
  `\n→ PATCH https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  },
);

if (!res.ok) {
  const text = await res.text();
  console.error(`✗ Failed (${res.status}): ${text}`);
  process.exit(1);
}

console.log(`\n✓ All ${count} templates pushed to project ${projectRef}.`);
console.log(
  "  Revoke the token at https://supabase.com/dashboard/account/tokens",
);
