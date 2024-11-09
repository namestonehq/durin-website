// app/api/get-domains/route.ts
import { NameWithRelation } from "@ensdomains/ensjs/subgraph";
import { addEnsContracts, ensSubgraphActions } from "@ensdomains/ensjs";
import { batch, getResolver } from "@ensdomains/ensjs/public";
import { mainnet } from "viem/chains";
import { createPublicClient, http, isAddress } from "viem";
import { NextRequest, NextResponse } from "next/server";

// Types
type EnrichedNameData = NameWithRelation & {
  validResolver: boolean;
  resolver: string | null;
};

// Constants
const providerUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

// Client setup
const client = createPublicClient({
  chain: {
    ...addEnsContracts(mainnet),
    subgraphs: {
      ens: {
        url: process.env.SUBGRAPH_URL || "",
      },
    },
  },
  transport: http(providerUrl),
}).extend(ensSubgraphActions);

// Route handlers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address || !isAddress(address, { strict: false })) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 });
    }

    console.log(client.chain.subgraphs.ens.url);

    const result = await client.getNamesForAddress({
      address: address,
      pageSize: 1000,
    });

    const filteredResult = result.filter(
      (item): item is NameWithRelation => !!item.name
    );

    const displayedData = await batch(
      client,
      ...filteredResult.map((item) => getResolver.batch({ name: item.name }))
    );

    const enrichedData: EnrichedNameData[] = filteredResult.map(
      (item, index) => ({
        ...item,
        resolver: displayedData[index],
      })
    );

    return NextResponse.json(enrichedData);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch names" },
      { status: 500 }
    );
  }
}

// Only allow GET method
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
