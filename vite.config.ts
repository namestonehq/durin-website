import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

const REQUIRED_ENV_VARS = [
  "VITE_WALLET_CONNECT_PROJECT_ID",
  "VITE_DRPC_API_KEY_FRONTEND",
  "VITE_SUBGRAPH_URL",
  "VITE_SEPOLIA_SUBGRAPH_URL",
  "VITE_FACTORY_ADDRESS",
];

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd());
    const missing = REQUIRED_ENV_VARS.filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}. ` +
          "See example.env for the full list."
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : undefined,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
