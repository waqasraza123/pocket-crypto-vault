# Current Session

## Date
2026-04-23

## Current Objective
Add Arabic as the second language with a production-grade i18n and RTL implementation in the universal Expo app.

## Last Completed Step
Implemented bilingual locale infrastructure, a header-level language switcher, direction-aware primitives, and Arabic coverage across the major marketing, dashboard, create-vault, and deposit flows.

## Current Step
Arabic and RTL support are implemented and verified. Leave the repo ready for live UI QA and any remaining translation coverage passes.

## Why This Step Exists
The product already had real create and deposit flows. This step adds the first production i18n layer and makes Arabic a real RTL experience instead of a later cosmetic pass.

## Files Touched
- `apps/mobile/src/lib/i18n/index.tsx`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/components/layout/{LanguageSwitcher.tsx,DesktopHeader.tsx,MobileHeader.tsx,TopNavigation.tsx,AppFooter.tsx,WalletEntryPlaceholder.tsx,WalletStatusCard.tsx}`
- `apps/mobile/src/components/primitives/{AppText.tsx,AppHeading.tsx,PrimaryButton.tsx,SecondaryButton.tsx,TextField.tsx,AmountField.tsx}`
- `apps/mobile/src/components/forms/StepPills.tsx`
- `apps/mobile/src/components/marketing/{HeroSection.tsx,HowItWorksSection.tsx,SecurityTrustSection.tsx,FinalCtaSection.tsx}`
- `apps/mobile/src/components/feedback/{AllowanceRequiredNotice.tsx,CreateVaultErrorState.tsx,DepositErrorState.tsx,MetadataRecoveryNotice.tsx,TransactionStatusCard.tsx,DisconnectedState.tsx,StateBanner.tsx,UnsupportedNetworkNotice.tsx}`
- `apps/mobile/src/components/vaults/{CreateVaultPreviewCard.tsx,CreateVaultReviewPanel.tsx,CreateVaultSuccessCard.tsx,DepositActionPanel.tsx,DepositAmountField.tsx,DepositApprovalNotice.tsx,DepositPreviewCard.tsx,DepositSuccessCard.tsx,VaultActivityPreview.tsx,VaultCard*.tsx,VaultDetailHeader.tsx,VaultProgressPanel.tsx,VaultRulePanel.tsx,WithdrawNoticeCard.tsx}`
- `apps/mobile/src/app/(marketing)/*`
- `apps/mobile/src/app/(app)/{index.tsx,activity.tsx,vaults/[vaultAddress].tsx,vaults/new.tsx}`
- `apps/mobile/src/features/create-vault/useCreateVaultForm.ts`
- `apps/mobile/src/hooks/{useCreateVaultMutation.ts,useVaultDepositFlow.ts,useVaultActivity.ts,useVaultDetail.ts}`
- `apps/mobile/src/lib/contracts/{mappers.ts,deposit-flow.ts}`
- `apps/mobile/src/lib/format/{currency.ts,date.ts,progress.ts}`
- `apps/mobile/src/state/{create-vault-state.ts,deposit-flow-state.ts}`
- `packages/shared/src/validation/createVault.ts`
- `docs/project-state.md`
- `docs/_local/current-session.md`

## Durable Decisions Captured
- Product: Goal Vault
- Base-native, USDC-only, wallet-first
- `v1` is time-lock only
- `v1.5` adds cooldown unlock
- `v2` adds guardian approval
- Reown AppKit remains the universal wallet strategy, with raw providers still isolated behind the wallet boundary.
- Base and Base Sepolia are the only supported write/read chains.
- Create-vault resolution uses receipt logs first and owner vault list fallback second.
- Session metadata cache is now the bridge between onchain success and later backend/indexer rollout.
- Deposit confirmations now write session activity immediately after receipt confirmation so the app reflects funding before full backend indexing ships.
- Locale state is app-owned, persisted with AsyncStorage, and used to drive document `dir`, root layout direction, formatting, and direction-aware icon/layout helpers from one place.

## Scope Boundaries
- No withdraw flow yet.
- No cooldown or guardian yet.
- Backend metadata POST is optional by env; session metadata plus session deposit activity are the current fallback bridge.
- Arabic support is limited to the current product surface. Future routes and new copy must use the shared i18n catalog rather than hardcoded strings.

## Exact Next Steps
1. Run live browser and device QA in both English and Arabic, especially around header, navigation, create-vault, and deposit states.
2. Replace remaining hardcoded strings in untouched future surfaces with the shared i18n catalog as those flows expand.
3. Add withdraw flow and unlocked-state action handling on top of the same locale and direction system.
4. Replace session activity fallback with indexed backend activity and richer metadata reads.

## Verification Commands
- `pnpm typecheck`
- `pnpm --filter @goal-vault/mobile exec expo export --platform web --output-dir ../../dist-web-i18n`
- `pnpm --filter @goal-vault/mobile exec expo export --platform ios --output-dir ../../dist-ios-i18n`
- `git status --short`
- `sed -n '1,220p' apps/mobile/src/lib/i18n/index.tsx`
- `sed -n '1,220p' docs/project-state.md`

## Handoff Note
Arabic is now a first-class app mode. For live QA, verify both locales on device and web, check header switching, confirm `dir` flips on web, and exercise create/deposit flows in both directions before shipping.
