/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
  readonly VITE_DRPC_API_KEY_FRONTEND: string;
  readonly VITE_SUBGRAPH_URL: string;
  readonly VITE_SEPOLIA_SUBGRAPH_URL: string;
  readonly VITE_FACTORY_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
