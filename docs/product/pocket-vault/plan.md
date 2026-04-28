# Pocket Vault Product Plan

## 1. Product Definition

### Core idea
Pocket Vault is a Base-native USDC savings product where a user creates a vault for one specific purpose, funds it over time, and cannot withdraw until the chosen rule allows it.

The product is not about trading, yield, or speculation. It is about disciplined, intentional, emotionally meaningful saving.

### Product promise
Create a vault for one goal. Lock it with rules. Protect your money from your present self.

### What the product is
- A programmable savings vault
- A goal-first stablecoin product
- A behavior-shaping financial tool
- A premium onchain consumer app

### What the product is not
- Not a DeFi dashboard
- Not a trading interface
- Not a lending app
- Not a multi-asset portfolio manager
- Not a noisy crypto product

## 2. Product Thesis
Pocket Vault should make saving feel:

- intentional
- protected
- visible
- hard to undo
- personally meaningful

Its moat is the combination of:

- very narrow scope
- strong emotional framing
- beautiful product design
- credible onchain execution
- friction used in the right places

## 3. MVP Scope

### MVP must do only five things
1. User creates a vault.
2. User deposits USDC.
3. User sees progress toward a goal.
4. User cannot withdraw until the rule allows.
5. User can unlock or withdraw only when the condition is satisfied.

### MVP technical boundaries
- Chain: Base
- Asset: USDC only
- Wallet-first onboarding
- One owner per vault
- Private vault metadata by default
- No yield
- No swaps
- No multi-chain
- No social layer
- No AI features

### Recommended release order
- `v1`: time lock only, create vault, deposit, withdraw after unlock date
- `v1.5`: cooldown unlock
- `v2`: guardian approval

## 4. Users and Use Cases

### Primary user
Freelancers, crypto-savvy earners, and disciplined savers who want to protect money from impulse decisions.

### Strong use cases
- Laptop fund
- Emergency fund
- Umrah fund
- Wedding fund
- Business launch fund
- Tax reserve
- Car repair fund
- Baby fund

### Jobs to be done
- I want to separate important money from spendable money.
- I want a clean place to save in USDC without feeling like I am using DeFi.
- I want a rule that stops me from breaking this goal too easily.
- I want to see progress in a way that keeps me emotionally committed.

## 5. Product Principles

### Goal-first, never protocol-first
The interface should always begin with the purpose of the vault, not the contract or chain.

Good language:
- What are you saving for?
- Protect this goal
- Unlocks on August 30
- 64% funded

Bad language:
- Deploy vault contract
- Lock primitive
- Wallet orchestration
- Position state

### Calm, not noisy
The product should feel premium and controlled. No casino energy, flashing prices, aggressive gradients, or moon language.

### Intentional friction
Depositing should feel easy. Withdrawing should feel serious.

### Premium simplicity
Minimal elements, but each one polished. Large spacing. Strong hierarchy. Excellent typography. Purposeful motion.

### Trust through clarity
Rules must always be obvious:
- what locks the vault
- when it becomes withdrawable
- what must happen before funds can move

## 6. Product Architecture

### Core surfaces
1. Landing page
2. Connect / first-run entry
3. Vault creation wizard
4. My Vaults dashboard
5. Vault detail page
6. Deposit modal
7. Withdraw / unlock modal
8. Withdrawal status page
9. Guardian approval page later

### Core entities
- User
- Vault
- Deposit
- Withdrawal request
- Lock rule
- Vault metadata
- Notifications later

### Core rule types
- Rule A - Time lock
- Rule B - Cooldown unlock
- Rule C - Guardian approval

Only Rule A ships in `v1`.

## 7. UI/UX Design Direction

### Design mood
The UI should feel like:
- a premium financial artifact
- a modern lockbox
- soft, elegant, deliberate
- emotionally meaningful without being cheesy

### Visual character
- Light or soft-neutral theme
- Clean bright surfaces
- Frosted panels used sparingly
- Large amount typography
- Subtle gradients only as accents
- High whitespace
- Strong component rhythm
- One accent color per vault
- Rounded but not toy-like
- Motion used for confirmation and state, not decoration

### Tone reference
Closer to:
- premium fintech
- Apple-like calm
- modern wealth product
- a beautiful focused SaaS

Not closer to:
- generic crypto dashboard
- NFT landing page
- dark neon DeFi interface

### Design system direction

Colors:
- warm white / soft ivory background
- light gray cards
- crisp charcoal text
- muted secondary text
- one accent per vault family

Suggested accent mapping:
- blue for emergency
- green for business
- gold for travel / Umrah
- rose for family / wedding
- slate for tax reserve

Typography:
- premium sans with strong numeral rendering
- clear hierarchy for hero amounts, section titles, and support text

Spacing:
- generous section padding
- comfortable card spacing
- no dense dashboards
- max three primary data points per card

Icons:
- lock
- calendar
- shield
- hourglass
- target
- wallet
- progress ring motifs

Motion:
- vault creation success lock-in animation
- progress fill animation
- deposit confirmation pulse
- countdown digit transition
- withdrawal confirmation fade
- state chip updates

## 8. Information Architecture

### Public
- Home
- How it works
- Vault types
- Security / trust
- Connect wallet CTA

### Authenticated
- My Vaults
- Vault detail
- Create vault
- Activity
- Profile / settings later

### Navigation pattern
Public nav:
- Logo
- How it works
- Security
- Open App / Connect Wallet

Authenticated nav:
- My Vaults
- Create Vault
- Activity
- Wallet menu

## 9. Landing Page Plan

### Hero
Goals:
- communicate what it is
- communicate why it matters
- communicate how it feels

Layout:
- left: headline, subhead, primary CTA, secondary CTA
- right: semi-real vault preview artifact

Headline direction:
- Protect the money you do not want to break.
- Create a vault for one goal. Lock it until it matters.

CTA:
- Primary: Create a Vault
- Secondary: See How It Works

### How it works
Three-step strip:
1. Name your goal
2. Deposit USDC
3. Unlock only when the rule allows

### Vault rule types
Three elegant cards:
- Time Lock
- Cooldown Unlock
- Guardian Approval

Behavioral framing:
- Time Lock: best when you already know the date this money should become available.
- Cooldown Unlock: best when your biggest risk is impulse.
- Guardian Approval: best when you want accountability from someone you trust.

### Sample goals
Example cards:
- Laptop Fund
- Umrah Fund
- Emergency Reserve
- Tax Reserve

Each card shows:
- goal name
- saved amount
- target
- percentage funded
- unlock rule summary
- status chip

### Trust / security
- USDC on Base
- Rule-enforced withdrawal logic
- Transparent onchain balances
- Simple scoped product
- No lending, no speculation

### Final CTA
Build one vault for what matters next.

## 10. First-Run Experience

### Step 1 - Connect wallet
Minimal screen with:
- short headline
- one sentence on what the product does
- connect options
- note that funds stay in rule-bound vaults, not a trading account

### Step 2 - Optional micro onboarding
Lightweight explainer modal:
- Vaults hold USDC for one goal
- You choose the unlock rule
- Deposits are easy
- Withdrawals follow your rule

## 11. Vault Creation Wizard

### Wizard principles
- 3 or 4 steps maximum
- show progress at top
- never overwhelm with all fields at once
- every step should feel calm and important
- preview the vault as the user builds it

### Step 1 - Goal details
Fields:
- Goal name
- Optional category
- Target amount
- Optional note
- Optional theme accent

UX details:
- open with "What are you saving for?"
- show real-time vault preview
- use example placeholders like New laptop, Emergency fund, Umrah 2027

Validation:
- goal name required
- target amount required and numeric

### Step 2 - Rule selection
In `v1`:
- Time Lock with date picker

Later:
- Cooldown presets
- Guardian wallet entry

UX details:
- use cards, not technical dropdowns
- show a human-readable summary
- prevent clearly broken dates

Live summary panel:
- vault name
- target
- rule
- estimated unlock description

### Step 3 - Review
Show:
- Goal name
- Target amount
- Unlock rule
- Asset: USDC
- Network: Base
- Ownership wallet
- Short summary of what can and cannot happen

Key copy examples:
- This vault cannot be withdrawn before August 30, 2026.
- Deposits can be made anytime.
- This vault is built for one goal.

CTA:
- Create Vault

### Step 4 - Success state
Show:
- large lock success animation
- vault name
- rule summary
- Vault active
- Deposit now
- View vault

## 12. My Vaults Dashboard

### Layout
Top:
- heading
- total saved
- vault count
- quick create button

Body:
- vault card grid on desktop
- stacked cards on mobile

### Vault card contents
- goal name
- saved amount
- target amount
- percentage funded
- progress ring or bar
- rule type
- unlock date or status
- state chip
- small recent activity hint

Optional:
- accent strip or theme circle
- category icon

### Empty state
- elegant placeholder
- Your first vault starts with one goal.
- CTA: Create a Vault

## 13. Vault Detail Page

### Above the fold
Primary content:
- goal name
- optional note
- amount saved
- target amount
- progress visualization
- rule summary
- state chip

Secondary content:
- next key event
- unlock date or countdown
- deposit CTA
- withdraw or request unlock CTA

### Lower sections
Vault progress:
- progress bar or ring
- saved amount
- remaining amount
- percentage
- optional milestone markers at 25, 50, 75, 100

Rule status:
- Locked until August 30, 2026
- Unlock request required
- Cooldown has not started
- Withdrawable now

Activity feed:
- vault created
- deposit confirmed
- unlock requested
- withdrawal completed

Settings later:
- rename metadata
- change accent
- privacy settings
- guardian management later

## 14. Deposit UX

### Deposit entry
Button:
- Deposit USDC

Modal or sheet:
- current vault name
- current progress
- amount input
- quick amounts if useful
- wallet balance hint
- transaction summary

UX details:
- support clean decimal handling
- show balance and max
- preview new progress before confirm
- reinforce the new completion percentage

### Deposit states
- Awaiting wallet approval
- Confirming transaction
- Deposit confirmed
- Deposit failed

### Success experience
- animate progress change
- show updated amount
- short positive reinforcement
- offer Add another deposit or Done

## 15. Withdrawal / Unlock UX

### Design principle
Withdrawal should never feel casual.

Depositing should feel like adding to a promise. Withdrawing should feel like deciding whether to break that promise.

### Time lock flow
If locked:
- action disabled or informational
- show exact unlock date
- show countdown
- explain why action is unavailable

If unlocked:
- allow withdrawal
- still require deliberate confirmation

Confirmation copy direction:
- This vault is now eligible for withdrawal.
- You are about to move funds out of this goal vault.

### Cooldown flow later
Button:
- Request Unlock

Flow:
1. confirm cooldown duration
2. start cooldown
3. show unlock pending state
4. make countdown primary
5. allow withdrawal after cooldown completes

### Guardian flow later
Flow:
1. request unlock
2. show guardian pending state
3. show approval request clearly
4. reflect approved or rejected status clearly

## 16. Status and State Design

### Vault states
- Draft
- Active
- Locked
- Unlock pending
- Withdrawable
- Withdrawn
- Closed

### State chip semantics
- Active: subtle blue/green
- Locked: neutral/slate
- Pending: amber
- Withdrawable: green
- Closed: muted gray

### Transaction states
- Awaiting signature
- Submitted
- Confirming
- Confirmed
- Failed

## 17. Copywriting System

### Tone
- calm
- clear
- premium
- slightly human
- never hypey
- never meme-crypto
- never overly poetic

### Good copy examples
- What are you saving for?
- Give this vault a purpose.
- Protect this goal with a time lock.
- Funds become available on August 30, 2026.
- Deposit anytime. Withdraw only when the rule allows.
- This vault is now active.

### Avoid
- Deploy intent contract
- Vault primitive initialized
- DeFi-native savings abstraction
- Ritualized capital preservation layer

## 18. Mobile UX
- large tap targets
- short vertical forms
- sticky action buttons
- compact but beautiful cards
- safe wallet interactions
- readable countdowns
- one-primary-action screens

Mobile rules:
- avoid dense dual-column layouts
- make deposit and withdraw bottom-sheet friendly
- keep progress visuals legible on narrow screens
- simplify activity feed on mobile

## 19. Accessibility and Trust UX

### Accessibility requirements
- good contrast
- clear label-input association
- visible focus states
- screen-reader-friendly transaction states
- readable date and amount formats
- do not rely on color alone for status

### Trust UX
Always show:
- connected wallet
- network
- asset
- rule summary
- amount before confirm
- transaction progress
- final state after action

## 20. Smart Contract Plan

### Core contracts
`VaultFactory` responsibilities:
- create vaults
- track owner-to-vault mapping
- emit creation events

`GoalVault` stores:
- owner
- asset token address
- total balance
- target amount
- rule type
- unlock timestamp or cooldown config
- request state

`GoalVault` functions:
- `deposit(amount)`
- `requestUnlock()` later
- `withdraw(amount)` or full withdraw
- `closeVault()`
- view helpers

Optional helper / registry:
- efficient reads
- owner vault listing
- simplified frontend querying

### Contract rules for `v1`
- one token only: USDC
- one rule only: time lock
- no upgradeability unless absolutely required
- strict revert messages or custom errors
- precise event emission for frontend indexing

### Testing priorities
- cannot withdraw before unlock date
- can deposit anytime
- can withdraw after unlock
- ownership enforcement
- balance accounting
- multiple deposits
- zero and invalid amount handling

## 21. Backend and Indexing Plan

### Backend responsibilities
- store vault display metadata
- store categories, notes, theme accents
- index events for fast UI
- serve activity feed
- later support notifications and share pages

### Minimal tables
`users`:
- id
- wallet_address
- created_at

`vaults`:
- id
- chain_id
- contract_address
- owner_wallet
- display_name
- category
- target_amount
- note
- accent_theme
- created_at

`vault_events`:
- id
- vault_id
- event_type
- tx_hash
- amount
- created_at

`withdrawal_requests` later:
- id
- vault_id
- status
- requested_at
- unlock_at
- decision_at

### API surface
- get user vaults
- get vault detail
- get vault activity
- save vault metadata
- refresh indexed state if needed

## 22. Phase-by-Phase Build Plan

### Phase 0 - Product and UX spec
Deliverables:
- final PRD
- state machine
- user flows
- screen wireframes
- interaction map
- contract interface draft
- content and copy system

Acceptance:
- no unresolved product ambiguity
- every state mapped
- every screen justified

### Phase 1 - Design system and clickable UI
Deliverables:
- typography scale
- spacing system
- color tokens
- vault card system
- form patterns
- button hierarchy
- chips, modals, alerts
- high-fidelity screens

Screens:
- landing
- create vault
- my vaults
- vault detail
- deposit modal
- withdraw modal
- empty states
- loading states
- failure states

Acceptance:
- one consistent premium UI language
- mobile and desktop covered
- critical flows clickable and reviewable

### Phase 2 - Onchain `v1`
Deliverables:
- VaultFactory
- GoalVault time-lock implementation
- tests
- deployment scripts for Base
- contract addresses in app config

Acceptance:
- vault creation works
- deposits work
- withdrawal blocked before date
- withdrawal succeeds after date
- all core tests passing

### Phase 3 - Frontend integration
Deliverables:
- wallet connection
- create vault flow wired to contracts
- deposit flow
- vault list view
- vault detail data reads
- transaction state UX
- indexer or direct read fallback

Acceptance:
- full happy path works end-to-end
- state updates reflected accurately
- no confusing transaction states

### Phase 4 - Metadata backend and polish
Deliverables:
- vault metadata persistence
- note/category/accent support
- activity feed
- loading skeletons
- better empty states
- responsive refinement
- trust/security section on landing

Acceptance:
- product feels coherent and real
- vaults feel personalized
- cards and detail pages feel emotionally sticky

### Phase 5 - Cooldown unlock
Deliverables:
- contract support for unlock requests
- countdown state
- request unlock flow
- pending status UX
- withdrawable transition UI

Acceptance:
- cooldown concept obvious to user
- no ambiguity about when funds become available

### Phase 6 - Guardian approval
Only after the rest is excellent.

## 23. Detailed Acceptance Criteria For `v1`

### User can create a vault
- Must input goal name, target amount, unlock date
- Must connect wallet
- Must confirm transaction
- Must land on success state

### User can deposit
- Must see balance and amount
- Must approve USDC if needed
- Must confirm deposit
- UI must update progress accurately

### User can view vaults
- Must see all owned vaults
- Must see saved vs target
- Must see rule summary
- Must see lock state clearly

### User cannot withdraw early
- Button state and messaging must be clear
- Contract must block it
- UI must not imply it is allowed

### User can withdraw after unlock
- Must see withdraw eligibility clearly
- Must confirm transaction
- Must see final updated state

## 24. Biggest Risks

### Product risks
- overbuilding too soon
- turning it into general fintech
- making the UI too poetic or too crypto-native

### UX risks
- unclear lock rules
- cluttered vault cards
- weak mobile experience
- confusing transaction states

### Technical risks
- time handling bugs
- inaccurate indexed state
- poor USDC approval flow
- mismatch between metadata and contract state

## 25. What Makes The Product Exceptional
- The vault card should be beautiful enough that one screenshot sells the product.
- Rule clarity should always explain why funds are locked and when they become available.
- Emotional reinforcement should make deposits feel like progress and withdrawals feel consequential.

## 26. Final Recommended Definition

### Product
Pocket Vault

### Launch version
A Base-native USDC product where users create a named vault for one goal, set a time lock, deposit funds, and withdraw only when the rule allows.

### Core emotional hook
A visible, rule-protected promise to your future self.

### Core product advantage
It does one thing extremely well: protect intentional savings from impulse.
