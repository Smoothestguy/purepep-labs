import { ImageResponse } from "next/og";

// File-convention config
export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Palette aligned with app/globals.css brand tokens (sRGB fallbacks).
const BG = "#0a0d12";
const BRAND = "#4dd2e8";
const BRAND_DEEP = "#4763d9";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer brand ring */}
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${BRAND_DEEP}, ${BRAND})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner dark cavity */}
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Core atom */}
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: 9999,
                background: BRAND,
                display: "flex",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
