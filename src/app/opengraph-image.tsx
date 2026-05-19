import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// File-convention config
export const runtime = "nodejs";
export const alt =
  "PurePep Labs — Research-grade peptides, documented to the milligram.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette — inlined as sRGB because Satori's oklch support is spotty.
// Converted from app/globals.css tokens at build time.
const BG = "#0a0d12"; // --background
const INK = "#f4f6f9"; // --foreground
const MUTED = "#98a0ad"; // --muted-foreground
const BRAND = "#4dd2e8"; // --brand cyan
const BRAND_DEEP = "#4763d9"; // --brand-deep royal
const HAIRLINE = "rgba(255,255,255,0.12)";

async function loadLogo(): Promise<string> {
  const path = join(process.cwd(), "public", "images", "PurePep_Label.png");
  const buf = await readFile(path);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

export default async function OpengraphImage() {
  const logoSrc = await loadLogo();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: INK,
          fontFamily:
            "Georgia, 'Times New Roman', Times, serif",
          position: "relative",
          padding: "72px 88px",
        }}
      >
        {/* Soft brand glow — upper-right */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -180,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background: `radial-gradient(closest-side, ${BRAND}, transparent 70%)`,
            opacity: 0.22,
            display: "flex",
          }}
        />
        {/* Deeper brand glow — lower-left */}
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: -200,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: `radial-gradient(closest-side, ${BRAND_DEEP}, transparent 70%)`,
            opacity: 0.18,
            display: "flex",
          }}
        />

        {/* Hairline frame */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: `1px solid ${HAIRLINE}`,
            display: "flex",
          }}
        />

        {/* Top row — PurePep label mark + eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            color: MUTED,
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: 18,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="PurePep Labs"
            width={120}
            height={123}
            style={{ display: "flex" }}
          />
          <div style={{ display: "flex" }}>§ 01 · Index Vol. XII</div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 700,
              color: INK,
            }}
          >
            PUREPEP
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 300,
              fontStyle: "italic",
              color: BRAND,
              opacity: 0.9,
            }}
          >
            ·
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 168,
              fontWeight: 700,
              color: INK,
            }}
          >
            LABS
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            fontSize: 36,
            color: MUTED,
            fontStyle: "italic",
            letterSpacing: "-0.01em",
            maxWidth: 900,
            zIndex: 1,
          }}
        >
          Research-grade peptides, documented to the milligram.
        </div>

        {/* Bottom meta row */}
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: MUTED,
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: 18,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex" }}>Houston, TX</div>
          <div style={{ display: "flex", color: INK }}>
            For research use only
          </div>
          <div style={{ display: "flex" }}>SHA-256 signed</div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
