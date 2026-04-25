import assert from "node:assert/strict";
import test from "node:test";

import { routes } from "./routes";

test("public route targets stay explicit and non-conflicting", () => {
  assert.equal(routes.landing, "/");
  assert.equal(routes.howItWorks, "/how-it-works");
  assert.equal(routes.security, "/security");
  assert.equal(routes.appHome, "/vaults");
  assert.equal(routes.createVault, "/vaults/new");
  assert.equal(routes.activity, "/activity");
  assert.equal(routes.vaultDetail("0xabc"), "/vaults/0xabc");
});
