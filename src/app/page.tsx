import Link from "next/link";
import { loadCommandCentreForCurrentUser } from "@/app/actions/command-centre";
import CommandCentrePage from "@/modules/command-centre/presentation/components/command-centre-page/command-centre-page";

export default async function HomePage() {
  const commandCentre = await loadCommandCentreForCurrentUser();

  // No session — show login prompt instead of dev fixture
  if (!commandCentre) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a1a 100%)",
        }}
      >
        <div
          style={{
            background: "rgba(20, 20, 50, 0.9)",
            border: "1px solid rgba(120, 120, 255, 0.15)",
            borderRadius: "1rem",
            padding: "2.5rem",
            width: "100%",
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          <h1
            style={{ fontSize: "1.75rem", fontWeight: 700, color: "#e8e8ff", margin: "0 0 0.5rem" }}
          >
            Frontend Realms
          </h1>
          <p style={{ color: "#8888b8", margin: "0 0 1.5rem", fontSize: "0.95rem" }}>
            Sign in to continue your journey
          </p>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #6c5ce7, #a855f7)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              marginBottom: "0.75rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            Sign In
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(100, 100, 200, 0.15)" }} />
            <span style={{ color: "#555580", fontSize: "0.85rem", whiteSpace: "nowrap" }}>or</span>
            <span style={{ flex: 1, height: 1, background: "rgba(100, 100, 200, 0.15)" }} />
          </div>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "0.5rem",
              padding: "0.75rem 2rem",
              color: "#d0d0f0",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            Create an Account
          </Link>
        </div>
      </div>
    );
  }

  return <CommandCentrePage vm={commandCentre} />;
}
