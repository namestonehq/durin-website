import { NameWithRelation } from "@ensdomains/ensjs/subgraph";
import { addEnsContracts, ensSubgraphActions } from "@ensdomains/ensjs";
import { batch, getResolver } from "@ensdomains/ensjs/public";
import { mainnet, sepolia } from "viem/chains";
import { createPublicClient, http, isAddress } from "viem";
import { drpc } from "evm-providers";

// Types
export type EnrichedNameData = NameWithRelation & {
  resolver: string | null;
};

const drpcApiKey = import.meta.env.VITE_DRPC_API_KEY_FRONTEND;

// Constants
const providerUrl = drpc(mainnet.id, drpcApiKey);
const sepoliaProviderUrl = drpc(sepolia.id, drpcApiKey);

// Function to get the appropriate client based on network
const getNetworkClient = (network?: string | null) => {
  const isSepoliaNetwork = network === "Sepolia";

  return createPublicClient({
    chain: {
      ...addEnsContracts(isSepoliaNetwork ? sepolia : mainnet),
      subgraphs: {
        ens: {
          url:
            (isSepoliaNetwork
              ? import.meta.env.VITE_SEPOLIA_SUBGRAPH_URL
              : import.meta.env.VITE_SUBGRAPH_URL) || "",
        },
      },
    },
    transport: http(isSepoliaNetwork ? sepoliaProviderUrl : providerUrl),
  }).extend(ensSubgraphActions);
};

// Fetch the ENS 2LDs owned by `address`, enriched with each name's resolver.
export async function getDomains(
  address: string,
  network?: string | null
): Promise<EnrichedNameData[]> {
  if (!address || !isAddress(address, { strict: false })) {
    throw new Error("Missing address");
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid address");
  }

  // Get the appropriate client based on the network
  const client = getNetworkClient(network);

  const result = await client.getNamesForAddress({
    address: address,
    pageSize: 1000,
  });

  // Make sure it's a known 2LD
  const filteredResult = result.filter(
    (item) =>
      !!item.name &&
      !item.name?.startsWith("[") &&
      item.name?.split(".").length === 2
  );

  const displayedData = await batch(
    client,
    ...filteredResult.map((item) => getResolver.batch({ name: item.name || "" }))
  );
  const enrichedData: EnrichedNameData[] = filteredResult.map(
    (item, index) => ({
      ...item,
      resolver: displayedData[index],
    })
  );

  return enrichedData;
}
