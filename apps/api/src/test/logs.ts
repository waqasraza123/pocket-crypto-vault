import { encodeAbiParameters, encodeEventTopics, type AbiEvent, type Log } from "viem";

const defaultBlockHash = "0x1111111111111111111111111111111111111111111111111111111111111111";

export const createTestLog = ({
  abi,
  address,
  args,
  blockNumber,
  eventName,
  logIndex,
  txHash,
}: {
  abi: readonly unknown[];
  address: `0x${string}`;
  args: Record<string, unknown>;
  blockNumber: number;
  eventName: string;
  logIndex: number;
  txHash: `0x${string}`;
}): Log => {
  const eventAbi = abi.find(
    (item): item is AbiEvent => typeof item === "object" && item !== null && "type" in item && item.type === "event" && "name" in item && item.name === eventName,
  );

  if (!eventAbi) {
    throw new Error(`Event ${eventName} is not defined in the provided ABI.`);
  }

  const nonIndexedInputs = eventAbi.inputs.filter((input) => !input.indexed);

  return {
    address,
    blockHash: defaultBlockHash,
    blockNumber: BigInt(blockNumber),
    data:
      nonIndexedInputs.length > 0
        ? encodeAbiParameters(
            nonIndexedInputs.map((input) => ({
              type: input.type,
              name: input.name,
            })),
            nonIndexedInputs.map((input) => args[input.name ?? ""]),
          )
        : "0x",
    logIndex,
    removed: false,
    topics: encodeEventTopics({
      abi,
      eventName,
      args,
    }),
    transactionHash: txHash,
    transactionIndex: 0,
  } as Log;
};
