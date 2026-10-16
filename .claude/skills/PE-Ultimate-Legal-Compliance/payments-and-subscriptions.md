# Payments and subscriptions

## Current state (binding)

- PE Ultimate is **free**. There are no purchases, subscriptions, trials, donations, licence keys or paid tiers. `terms.html` §1 says "no user accounts and no payments"; the store listing says "free".
- Payments are **on hold** by owner decision (`AGENTS.md`: "No payments, new API keys, paid services or required account system"; `docs/ACTION_PLAN_2026-10-03.md`: issue #14 deferred). Owner reconfirmed the hold on 2026-10-16.
- Therefore agents must not add: price text, "Pro"/"Premium" labels, locked features, paywalls, billing libraries (Play Billing, StoreKit, RevenueCat, Stripe, PayPal), licence checks, donation or "buy me a coffee" links, or server endpoints for entitlements.

If a user asks for any of this, explain the hold, and offer to prepare a written proposal only (no code).

## Before the hold can be lifted

Only the owner lifts the hold, explicitly and in writing (an Issue or `AGENTS.md` change). A proposal must answer all of these first:

1. **What is sold and why.** Which features, and confirmation that the offline core (class, attendance, measurement, grades, backup) stays usable. Existing users' data and features must not be taken away or locked.
2. **Accounts.** Subscriptions across devices usually need an account or store-based entitlement. Any account system conflicts with the current no-account rule and changes privacy, Data safety and App Privacy answers.
3. **Store billing rules** (verify current text before deciding):
   - Google Play: digital features or content bought inside an app distributed on Play generally must use Google Play Billing; check the current Payments policy and any regional alternative-billing programs.
   - Apple App Store: unlocking features or content inside the app generally must use In-App Purchase (App Review Guideline 3.1.1); check current guidelines and regional exceptions.
   - The web version (Netlify) is outside store billing but must not be used to steer in-app users around store rules unless the current policy allows it.
4. **Seller identity and tax.** Who is the seller of record, VAT/sales tax handling (stores act as merchant of record in many countries; direct web sales do not), invoices/receipts, and Israeli tax registration for the operator. Needs an accountant, not an agent.
5. **Consumer law.** Price display, renewal terms, cancellation and refunds (`refunds-and-cancellations.md`), pre-contract information, and rules for selling to schools (procurement, invoices) versus individual teachers.
6. **Privacy.** Purchase history and account IDs are personal data: update `privacy.html` (five languages), store declarations and retention.
7. **Pupils.** No purchases may be offered in student mode or to pupils. The app is for adults.
8. **Terms.** New paid terms, licence scope (personal teacher vs. school), and what happens when a subscription ends (data must remain exportable).
9. **No new paid services or API keys** unless the owner lifts that rule as well.

## If the hold is lifted later

- Work only on a reserved task with an owner-approved design.
- Implement store billing through the platform's own mechanism; never handle card data in the app.
- Keep free functionality and existing data intact on upgrade, downgrade, expiry and refund.
- Add tests for entitlement loss, offline use while subscribed, restore purchases and refund revocation.
- Update `legal-audit-checklist.md` section E.
