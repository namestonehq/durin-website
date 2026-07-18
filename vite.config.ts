import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { findMissingEnvVars } from "./src/config/env";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd());
    const missing = findMissingEnvVars(env);
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
