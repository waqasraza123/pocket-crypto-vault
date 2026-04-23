import { readApiRuntimeEnv } from "../env";
import { createIndexerContext } from "../modules/indexer/context";
import { syncFactoryEventsForChain } from "../modules/indexer/factory-sync.service";

const main = async () => {
  const env = readApiRuntimeEnv();
  const context = await createIndexerContext(env);

  await syncFactoryEventsForChain(context, 84532);
  await syncFactoryEventsForChain(context, 8453);
};

void main();
