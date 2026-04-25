import assert from "node:assert/strict";
import test from "node:test";

import { getMarketingCtaTargets, getMarketingExperienceState, marketingLanguageOptions } from "./marketing-experience";

test("marketing experience keeps core public sections visible for disconnected and degraded wallet states", () => {
  const disconnected = getMarketingExperienceState("disconnected");
  const walletUnavailable = getMarketingExperienceState("walletUnavailable");
  const unsupportedNetwork = getMarketingExperienceState("unsupportedNetwork");

  for (const state of [disconnected, walletUnavailable, unsupportedNetwork]) {
    assert.equal(state.showHero, true);
    assert.equal(state.showHowItWorks, true);
    assert.equal(state.showSecurity, true);
    assert.equal(state.showFinalCta, true);
    assert.equal(state.showConnectionNotice, true);
  }
});

test("marketing experience hides the connection notice when the wallet is ready", () => {
  const ready = getMarketingExperienceState("ready");

  assert.equal(ready.showHero, true);
  assert.equal(ready.showHowItWorks, true);
  assert.equal(ready.showSecurity, true);
  assert.equal(ready.showFinalCta, true);
  assert.equal(ready.showConnectionNotice, false);
});

test("marketing CTA targets stay wired to meaningful public routes", () => {
  const targets = getMarketingCtaTargets();

  assert.equal(targets.enterVaults, "/vaults");
  assert.equal(targets.createVault, "/vaults/new");
  assert.equal(targets.howItWorks, "/how-it-works");
  assert.equal(targets.security, "/security");
});

test("language switcher options stay honest and bilingual", () => {
  assert.deepEqual(marketingLanguageOptions, [
    {
      locale: "en",
      label: "English",
    },
    {
      locale: "ar",
      label: "العربية",
    },
  ]);
});
