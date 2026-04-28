# Pocket Vault Mobile UI Polish

## Purpose
This note records the production UI direction for the current mobile polish pass. It is implementation-facing documentation for keeping future screens consistent with the refreshed Pocket Vault experience.

## Scope
The polish pass keeps the existing Expo React Native architecture, bilingual i18n model, product behavior, wallet flows, analytics events, and backend read fallbacks intact. It focuses on presentation quality and consistency across:
- public marketing pages
- dashboard and vault cards
- create-vault flow
- vault detail flow
- activity history
- transaction success, error, recovery, and status states

## Visual Direction
Pocket Vault should feel like a calm premium savings tool, not a trading dashboard. Screens should use the existing bright slate, blue, emerald, and warning accents with restrained contrast, strong hierarchy, and compact mobile spacing.

Use icon-led headers for important panels. The leading icon should communicate the job of the panel before the user reads the text:
- `bullseye-arrow` for goal and progress intent
- `shield-lock-outline` or `shield-check-outline` for protected state
- `plus-circle-outline` for deposits
- `shield-lock-open-outline` for withdrawal readiness
- `timeline-clock-outline` or `history` for activity
- `alert-circle-outline` for errors and warnings

Avoid decorative blobs, excessive glass effects, and speculative finance language. Cards should explain the user action, rule state, or data status directly.

## Reusable Surfaces
`SurfaceCard` is the primary card primitive. Use `accentColor` when a panel has a clear semantic tone:
- blue for primary product flow
- emerald for success, synced, and completed states
- orange for rule friction, caution, and withdrawal gating
- red through `FeedbackStatusCard` for failed actions

`FeedbackStatusCard` is the shared transaction and notice shell. Use it for success, error, warning, and recovery states instead of rebuilding card headers locally. It provides:
- icon-led header
- semantic accent color
- consistent title and description spacing
- room for action buttons or transaction details

Operational notices for allowance, unsupported network, owner-only access, withdrawal locks, and loading should also use `FeedbackStatusCard`. Wallet connection status should use a semantic icon and accent: emerald for ready, orange for unsupported network, and blue for neutral, connecting, or disconnected states.

`EmptyState` now follows the same icon-led pattern and should be used for empty authenticated surfaces such as empty dashboard and empty activity.

## Interaction Rules
Primary actions should remain obvious and singular where possible. Secondary actions should use icon buttons only when the label is still clear. Keep transaction recovery and metadata recovery visible but calm: they should explain what remains recoverable without implying funds are lost.

Form fields use focus-aware borders and shadows. Keep helper and error text close to the field so validation stays local and predictable.

Top navigation should make the current route visible with semantic active styling instead of relying on page titles alone. Header links should remain icon-led on both compact and desktop layouts, and compact header controls should use the same tokenized borders, radii, and status colors as the rest of the product UI.

## Layout Rules
Use `inlineDirection()` for row layouts that contain icons, labels, steps, or action groups. This keeps Arabic RTL layout correct. Keep repeated metric cards at stable minimum widths and use wrapping rows for dashboard, review, and detail panels.

Avoid nested card stacks unless the inner surface is a metric, activity row, or status detail. Page-level sections should remain direct layouts inside `PageContainer` or `SectionContainer`.

Form sections and step indicators should use `inlineDirection()` for icon and label rows. Step indicators should preserve completion, active, and upcoming states through color and icon treatment while staying compact enough for mobile wrapping.

## Documentation Expectations
Future UI work should update this note when adding a reusable visual pattern, changing semantic color usage, or changing how transaction, recovery, or empty states are presented. Routine component-only polish should update only `docs/_local/current-session.md`.
