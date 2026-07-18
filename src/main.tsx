import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { findMissingEnvVars } from "./config/env";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

function StartupError({ title, details }: { title: string; details: string[] }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#141414",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: "40rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
          {title}
        </h1>
        <ul style={{ fontFamily: "monospace", lineHeight: 1.8 }}>
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <p style={{ marginTop: "1rem", opacity: 0.7 }}>
          See example.env for the full list of required environment variables.
        </p>
      </div>
    </div>
  );
}

const missing = findMissingEnvVars(import.meta.env);

if (missing.length > 0) {
  root.render(
    <StartupError title="Missing required environment variables" details={[...missing]} />
  );
} else {
  // Providers and App are imported dynamically so that a module-level throw
  // (e.g. from wallet config) renders a visible error instead of a blank page.
  try {
    const [{ default: Providers }, { default: App }, { default: Ensv2WarningBanner }, { Toaster }] =
      await Promise.all([
        import("./providers"),
        import("./App"),
        import("./components/ensv2-warning-banner"),
        import("react-hot-toast"),
      ]);

    root.render(
      <React.StrictMode>
        <Providers>
          <Ensv2WarningBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              success: {
                icon: null,
                style: {
                  fontFamily: "Arial",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#fff",
                  background: "rgb(34 197 94)",
                },
              },
              error: {
                icon: null,
                style: {
                  fontFamily: "Arial",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#fff",
                  background: "rgb(220 38 38)",
                },
              },
              custom: {
                style: {
                  fontFamily: "Arial",
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#000",
                  background: "#fff",
                },
              },
            }}
          />
          <App />
        </Providers>
      </React.StrictMode>
    );
  } catch (error) {
    console.error(error);
    root.render(
      <StartupError
        title="Failed to start the app"
        details={[error instanceof Error ? error.message : String(error)]}
      />
    );
  }
}
