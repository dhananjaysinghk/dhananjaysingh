import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Dhananjay Singh | Software Engineer & Systems Developer"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#090a0f",
          backgroundImage: "radial-gradient(circle at 25px 25px, #1e1b4b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e1b4b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "#1e1b4b",
            border: "1px solid #4338ca",
            borderRadius: "9999px",
            padding: "8px 20px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              backgroundColor: "#10b981",
            }}
          />
          <span
            style={{
              color: "#a5b4fc",
              fontSize: "18px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            DS.dev • Available for Roles
          </span>
        </div>

        {/* Center Main Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              margin: 0,
              background: "linear-gradient(to right, #ffffff, #94a3b8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Dhananjay Singh
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#818cf8",
              margin: 0,
              fontFamily: "monospace",
            }}
          >
            Systems Engineer & Distributed Backend Architect
          </p>
          <p
            style={{
              fontSize: "20px",
              color: "#94a3b8",
              margin: 0,
              maxWidth: "800px",
              lineHeight: 1.4,
            }}
          >
            Building high-throughput schedulers, microsecond financial ledgers, and consensus protocols in Go & Rust.
          </p>
        </div>

        {/* Bottom Tech Pills */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {["Go", "Rust", "TypeScript", "PostgreSQL", "Docker", "Raft Consensus"].map(
            (tech) => (
              <div
                key={tech}
                style={{
                  backgroundColor: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "16px",
                  color: "#d4d4d8",
                  fontFamily: "monospace",
                }}
              >
                {tech}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
