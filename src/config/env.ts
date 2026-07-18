export const REQUIRED_ENV_VARS = [
  "VITE_WALLET_CONNECT_PROJECT_ID",
  "VITE_DRPC_API_KEY_FRONTEND",
  "VITE_SUBGRAPH_URL",
  "VITE_SEPOLIA_SUBGRAPH_URL",
  "VITE_FACTORY_ADDRESS",
] as const;

export type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

export function findMissingEnvVars(
  env: Partial<Record<RequiredEnvVar, unknown>>
) {
  return REQUIRED_ENV_VARS.filter((key) => {
    const value = env[key];
    return typeof value !== "string" || value.trim() === "";
  });
}
