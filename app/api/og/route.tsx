import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Generic branded OG image for homepage, battle entry, etc.
export function GET() {
  // Heatmap grid: 24 cols × 7 rows of colored dots
  const COLS = 24;
  const ROWS = 7;
  const DOT = 16;
  const GAP = 4;
  const colors = ["#0e4429", "#006d32", "#26a641", "#39d353", "#6366f1", "#0f0f23"];

  const dots: { x: number; y: number; color: string }[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      // Weighted random: mostly dark, some green, occasional indigo
      const r = Math.abs(Math.sin(col * 7 + row * 13 + 11) * 1000) % 1;
      const color =
        r < 0.35 ? colors[0]
        : r < 0.58 ? colors[1]
        : r < 0.74 ? colors[2]
        : r < 0.85 ? colors[3]
        : r < 0.94 ? colors[4]
        : colors[5];
      dots.push({ x: col * (DOT + GAP), y: row * (DOT + GAP), color });
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #0f1629 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background heatmap pattern — top area */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexWrap: "wrap",
            width: COLS * (DOT + GAP),
            opacity: 0.35,
          }}
        >
          {dots.map((d, i) => (
            <div
              key={i}
              style={{
                width: DOT,
                height: DOT,
                borderRadius: 4,
                background: d.color,
                margin: GAP / 2,
              }}
            />
          ))}
        </div>

        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#f1f5f9",
              letterSpacing: "-2px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ color: "#6366f1" }}>&lt;/&gt;</span>
            <span>DevWrapped</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 30,
              color: "#94a3b8",
              marginTop: 16,
              letterSpacing: "-0.5px",
            }}
          >
            Your GitHub year, beautifully unwrapped.
          </div>

          {/* Divider */}
          <div
            style={{
              width: 64,
              height: 3,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: 2,
              marginTop: 32,
              marginBottom: 32,
            }}
          />

          {/* Pills */}
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            {["9 Heatmap Themes", "Streak Stats", "Dev Battle", "Export PNG", "Free · No Sign-in"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 999,
                    padding: "8px 20px",
                    fontSize: 18,
                    color: "#cbd5e1",
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#475569",
            letterSpacing: "0.5px",
          }}
        >
          devwrapped.kminnovations.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
