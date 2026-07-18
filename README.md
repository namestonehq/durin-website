# Durin Website

The official website for [Durin](https://durin.dev), an ENS protocol for issuing subdomains on Layer 2 blockchains.

## Overview

This repository contains the frontend application for Durin, allowing users to deploy their own L2 subname service by:

- Deploying L2 Registry contracts
- Configuring the ENS resolvers
- Connecting L1 resolvers to L2 registries
- Minting and managing ENS subdomains on Layer 2 networks

## Related Resources

- **Smart Contracts**: The Durin protocol contracts are available at [github.com/ensdomains/durin](https://github.com/ensdomains/durin)
- **Live website**: [durin.dev](https://durin.dev), hosted on Cloudflare Workers as static assets

## Development

Install [Bun](https://bun.sh), copy `example.env` to `.env.local`, and fill in the required values.

```bash
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Create a production build with:

```bash
bun run build
```

Preview the production build locally with Wrangler:

```bash
bun run preview
```

Deploy the static assets to Cloudflare Workers with:

```bash
bun run deploy
```

## Technology Stack

- Vite and React
- RainbowKit for wallet connection
- Wagmi/Viem for blockchain interactions
- Tailwind CSS for styling
- TypeScript
- Cloudflare Workers Static Assets for hosting

## Supported Networks

Durin supports multiple Layer 2 networks, including:

- Base
- Optimism
- Arbitrum
- Scroll
- Linea
- Celo
- Polygon
- World Chain
