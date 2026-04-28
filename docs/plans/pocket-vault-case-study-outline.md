# Pocket Vault Case Study Outline

## Product Summary
- Pocket Vault is a Base-native USDC savings product that protects one goal per vault with a time-based withdrawal rule.

## Problem
- Savings tools often make it too easy to break money meant for something important.
- Generic crypto dashboards expose too much complexity and too little emotional clarity.

## Product Wedge
- One goal per vault.
- One asset.
- One network.
- One clear unlock rule.

## Why Base And USDC
- Base keeps the launch surface narrow and operationally understandable.
- USDC makes the saving experience easier to explain than volatile assets.

## Why One Goal Per Vault
- It makes the purpose concrete.
- It keeps progress emotionally legible.
- It prevents the product from collapsing into a generic wallet balance view.

## Why Time Lock First
- It is the clearest rule to understand and demo.
- It strengthens trust because the withdrawal condition is obvious.
- It keeps the first contract surface strict and auditable.

## Universal Architecture
- One Expo React Native codebase for iOS, Android, and web.
- Shared UI, routing, logic, translation, and recovery behavior by default.
- Fastify backend for metadata enrichment, indexed activity, readiness, and sync hints.

## Product-Quality UX Highlights
- Calm empty, loading, syncing, and recovery states.
- Strong create, deposit, withdraw, and activity continuity.
- Clear separation between chain truth, metadata, and sync lag.

## Technical Credibility
- Typed chain integration and explicit wallet boundary.
- Receipt-based transaction progression and recovery handling.
- Honest fallback behavior when config, wallet, or backend state degrades.

## Phased Delivery Story
- Phases 1 through 6 built the universal shell, real create/deposit/withdraw flows, and backend enrichment.
- Phase 7 hardened resilience and recovery.
- Phase 8 polished onboarding and presentation.
- Phase 9 prepared deployment and launch packaging.
- Phase 10 finalizes demo guidance, case-study support, and presentation polish.
