import { readApiRuntimeEnv } from "../env";
import { createIndexerContext } from "../modules/indexer/context";
import { reconcileVaultMetadata } from "../modules/indexer/reconciliation.service";

const main = async () => {
  const env = readApiRuntimeEnv();
  const context = await createIndexerContext(env);

  try {
    await reconcileVaultMetadata(context);
  } finally {
    await context.close();
  }
};

void main();
