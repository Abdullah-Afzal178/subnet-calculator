import { ImageResponse } from "next/og";

import { PAGE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#f7f7fb",
          color: "#1e1b31",
          padding: "56px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            border: "3px solid #4f46e5",
            borderRadius: "12px",
            background: "#ffffff",
            padding: "48px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "700px" }}>
            <div
              style={{
                display: "flex",
                color: "#4f46e5",
                fontSize: "28px",
                fontWeight: 700,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                marginTop: "28px",
                fontSize: "62px",
                lineHeight: 1.05,
                fontWeight: 700,
              }}
            >
              IPv4 &amp; IPv6 CIDR calculator.
            </div>
            <div
              style={{
                marginTop: "24px",
                fontSize: "26px",
                lineHeight: 1.4,
                color: "#4b4667",
              }}
            >
              {PAGE_DESCRIPTION}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              background: "#4f46e5",
              borderRadius: "12px",
              padding: "28px",
            }}
          >
            {[
              ["1", "1", "1", "1"],
              ["1", "1", "0", "0"],
              ["0", "0", "0", "0"],
            ].map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: "flex", gap: "10px" }}>
                {row.map((bit, bitIndex) => (
                  <div
                    key={bitIndex}
                    style={{
                      display: "flex",
                      width: "48px",
                      height: "48px",
                      borderRadius: "6px",
                      alignItems: "center",
                      justifyContent: "center",
                      background: bit === "1" ? "#ffffff" : "#fcd34d",
                      color: bit === "1" ? "#4f46e5" : "#78350f",
                      fontSize: "26px",
                      fontWeight: 700,
                    }}
                  >
                    {bit}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
