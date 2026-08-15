import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// File-convention config
export const runtime = "nodejs";
export const alt = "The Pure Pep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette — inlined as sRGB because Satori's oklch support is spotty.
const BG = "#0a0d12"; // --background
const BRAND = "#4dd2e8"; // --brand cyan

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
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          position: "relative",
        }}
      >
        {/* Soft brand glow behind the mark */}
        <div
          style={{
            position: "absolute",
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: `radial-gradient(closest-side, ${BRAND}, transparent 70%)`,
            opacity: 0.16,
            display: "flex",
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="The Pure Pep"
          height={460}
          width={450}
          style={{ display: "flex", zIndex: 1 }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
