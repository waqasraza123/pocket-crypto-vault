import assert from "node:assert/strict";
import test from "node:test";

import { isNativeWalletRuntimeSupported } from "./native-runtime";

test("native wallet runtime is disabled in Expo Go", () => {
  assert.equal(isNativeWalletRuntimeSupported({ appOwnership: "expo" }), false);
  assert.equal(isNativeWalletRuntimeSupported({ appOwnership: null, expoGoConfig: {} }), false);
});

test("native wallet runtime stays enabled outside Expo Go", () => {
  assert.equal(isNativeWalletRuntimeSupported({ appOwnership: null }), true);
  assert.equal(isNativeWalletRuntimeSupported({}), true);
});
