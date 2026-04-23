import { readApiRuntimeEnv } from "../env";
import { createIndexerContext } from "../modules/indexer/context";
import { syncVaultEventsForChain } from "../modules/indexer/vault-sync.service";

const main = async () => {
  const env = readApiRuntimeEnv();
  const context = await createIndexerContext(env);

  await syncVaultEventsForChain(context, 84532);
  await syncVaultEventsForChain(context, 8453);
};

void main();
