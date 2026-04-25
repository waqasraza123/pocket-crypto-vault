import test from "node:test";
import assert from "node:assert/strict";

import { isAppLocale, resolveInitialLocale, shouldApplyHydratedLocale } from "./locale-storage";

test("isAppLocale accepts supported locales only", () => {
  assert.equal(isAppLocale("en"), true);
  assert.equal(isAppLocale("ar"), true);
  assert.equal(isAppLocale("fr"), false);
  assert.equal(isAppLocale(null), false);
});

test("resolveInitialLocale falls back to english when storage is invalid", () => {
  assert.equal(resolveInitialLocale("en"), "en");
  assert.equal(resolveInitialLocale("ar"), "ar");
  assert.equal(resolveInitialLocale("fr"), "en");
  assert.equal(resolveInitialLocale(null), "en");
});

test("shouldApplyHydratedLocale skips late storage reads after manual selection", () => {
  assert.equal(shouldApplyHydratedLocale({ hydratedLocale: "ar", hasManualSelection: false }), true);
  assert.equal(shouldApplyHydratedLocale({ hydratedLocale: "en", hasManualSelection: true }), false);
  assert.equal(shouldApplyHydratedLocale({ hydratedLocale: "fr", hasManualSelection: false }), false);
});
