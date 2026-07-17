import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import App from "./App";
import Ensv2WarningBanner from "./components/ensv2-warning-banner";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
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
