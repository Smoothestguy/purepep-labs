import "server-only";

/**
 * Google Places (New) — address autocomplete.
 *
 * Proxied server-side rather than calling Google from the browser. The
 * documented browser approach needs a key in the client bundle, protected
 * only by HTTP referrer rules; keeping it here means the key is never
 * shipped, matching how every other secret in this codebase is handled.
 * It also lets the endpoints be gated behind a session, so a stranger
 * can't run up the bill on an API that charges per request.
 *
 * Billing is per *session*, not per keystroke: the client mints a token,
 * sends it with every suggest call and with the final resolve call, then
 * mints a new one. Google then bills the whole sequence as one session.
 * Dropping the token would bill every keystroke separately.
 *
 * Endpoints verified against the current Places API (New) docs — the
 * legacy `/maps/api/place/autocomplete/json` service has a different
 * shape and is not what this uses.
 */

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_BASE = "https://places.googleapis.com/v1/places";

/** Abort rather than hold a checkout keystroke open indefinitely. */
const TIMEOUT_MS = 6_000;

function apiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_API_KEY?.trim() || undefined;
}

export function isPlacesConfigured(): boolean {
  return Boolean(apiKey());
}

export type AddressSuggestion = {
  placeId: string;
  /** Street line, e.g. "15631 Four Season Dr". */
  main: string;
  /** Locality line, e.g. "Houston, TX, USA". */
  secondary: string;
};

export type ResolvedAddress = {
  address1: string;
  city: string;
  state: string;
  zip: string;
};

async function postJson(
  url: string,
  key: string,
  body: unknown,
  fieldMask: string,
): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn(`[places] ${url} returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(
      "[places] request failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Address predictions for a partial input.
 *
 * Restricted to US region codes, matching where this store ships.
 * `includeQueryPredictions` is left off (its default), so only real
 * places come back and never free-text search suggestions.
 *
 * Returns [] on any failure — a dead autocomplete must degrade to an
 * ordinary text field, never block someone from typing their address.
 */
export async function suggestAddresses(
  input: string,
  sessionToken: string,
): Promise<AddressSuggestion[]> {
  const key = apiKey();
  if (!key || input.trim().length < 3) return [];

  const json = await postJson(
    AUTOCOMPLETE_URL,
    key,
    {
      input: input.trim(),
      sessionToken,
      includedRegionCodes: ["us"],
      languageCode: "en",
    },
    "suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat",
  );

  const suggestions = (json as { suggestions?: unknown })?.suggestions;
  if (!Array.isArray(suggestions)) return [];

  const out: AddressSuggestion[] = [];
  for (const s of suggestions) {
    const p = (s as { placePrediction?: Record<string, unknown> })
      ?.placePrediction;
    if (!p) continue;

    const placeId = typeof p.placeId === "string" ? p.placeId : "";
    const fmt = p.structuredFormat as
      | { mainText?: { text?: string }; secondaryText?: { text?: string } }
      | undefined;
    const main = fmt?.mainText?.text ?? "";
    if (!placeId || !main) continue;

    out.push({ placeId, main, secondary: fmt?.secondaryText?.text ?? "" });
  }
  return out;
}

/**
 * Turn a chosen prediction into the fields the checkout form needs.
 *
 * Google returns components as a flat list tagged by type, so street
 * number and route arrive separately and have to be recombined into a
 * single street line.
 */
export async function resolveAddress(
  placeId: string,
  sessionToken: string,
): Promise<ResolvedAddress | null> {
  const key = apiKey();
  if (!key || !placeId) return null;

  const url = `${DETAILS_BASE}/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`;

  let json: unknown;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "addressComponents",
      },
    });
    if (!res.ok) {
      console.warn(`[places] details returned ${res.status}`);
      return null;
    }
    json = await res.json();
  } catch (err) {
    console.warn(
      "[places] details failed:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }

  const components = (json as { addressComponents?: unknown })
    ?.addressComponents;
  if (!Array.isArray(components)) return null;

  const pick = (type: string, short = false): string => {
    const hit = components.find(
      (c) =>
        Array.isArray((c as { types?: unknown }).types) &&
        ((c as { types: string[] }).types).includes(type),
    ) as { longText?: string; shortText?: string } | undefined;
    return (short ? hit?.shortText : hit?.longText) ?? "";
  };

  const streetNumber = pick("street_number");
  const route = pick("route");

  return {
    address1: [streetNumber, route].filter(Boolean).join(" "),
    city: pick("locality"),
    // Two-letter form: the checkout form caps the state field at 2 chars.
    state: pick("administrative_area_level_1", true),
    zip: pick("postal_code"),
  };
}
