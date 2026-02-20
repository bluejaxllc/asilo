import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = ".blue_jax | Estancia para el Adulto Mayor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#09090b",
                    backgroundImage:
                        "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.15) 0%, transparent 60%)",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Subtle grid */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(59,130,246,0.12) 1px, transparent 0)",
                        backgroundSize: "48px 48px",
                        opacity: 0.5,
                        display: "flex",
                    }}
                />

                {/* Shield icon */}
                <div
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 20,
                        backgroundColor: "rgba(37,99,235,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 32,
                        boxShadow:
                            "0 0 60px rgba(59,130,246,0.4), 0 0 120px rgba(59,130,246,0.15)",
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 800,
                        color: "white",
                        letterSpacing: "-1px",
                        marginBottom: 16,
                        display: "flex",
                    }}
                >
                    .blue_jax
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: 80,
                        height: 3,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                        marginBottom: 24,
                        display: "flex",
                    }}
                />

                {/* Tagline */}
                <div
                    style={{
                        fontSize: 24,
                        color: "rgba(255,255,255,0.7)",
                        textAlign: "center",
                        maxWidth: 700,
                        lineHeight: 1.4,
                        display: "flex",
                    }}
                >
                    El Sistema Operativo para Residencias de Retiro
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: 16,
                        color: "rgba(59,130,246,0.7)",
                        marginTop: 20,
                        textTransform: "uppercase",
                        letterSpacing: "4px",
                        fontWeight: 600,
                        display: "flex",
                    }}
                >
                    Gestión Integral del Adulto Mayor
                </div>

                {/* Bottom border accent */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: "linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)",
                        display: "flex",
                    }}
                />
            </div>
        ),
        { ...size }
    );
}
