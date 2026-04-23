import { readApiRuntimeEnv } from "../env";
import { createIndexerContext } from "../modules/indexer/context";
import { reconcileVaultMetadata } from "../modules/indexer/reconciliation.service";

const main = async () => {
  const env = readApiRuntimeEnv();
  const context = await createIndexerContext(env);

  await reconcileVaultMetadata(context);
};

void main();
