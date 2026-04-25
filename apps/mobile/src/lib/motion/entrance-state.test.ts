import assert from "node:assert/strict";
import test from "node:test";

import { getMotionViewEntranceState } from "./entrance-state";

test("web entrance state renders content immediately", () => {
  const state = getMotionViewEntranceState({
    preset: "hero",
    isReducedMotion: false,
    platform: "web",
  });

  assert.equal(state.shouldAnimateOnMount, false);
  assert.equal(state.opacity, 1);
  assert.equal(state.translateY, 0);
  assert.equal(state.scale, 1);
});

test("native entrance state still animates when motion is allowed", () => {
  const state = getMotionViewEntranceState({
    preset: "hero",
    isReducedMotion: false,
    platform: "ios",
  });

  assert.equal(state.shouldAnimateOnMount, true);
  assert.equal(state.opacity, 0);
  assert.ok(state.translateY > 0);
  assert.ok(state.scale < 1);
});
