# Refunds and cancellations

## Current state

There is nothing to refund or cancel: the app is free and has no purchases or subscriptions (see `payments-and-subscriptions.md`, payments on hold). Users can stop using the app at any time and delete their data on the device (Settings → Backup → "Delete all data", or uninstall / clear site data) without contacting anyone.

If a user writes in about a charge, it did not come from PE Ultimate. Possible causes: a different app with a similar name, or a lookalike listing. Answer politely, say the app is free, and suggest they check the store's order history. Do not ask for card or payment details.

"Cancellation" today can only mean:
- **Contact details:** a deletion request (About → request deletion, or `https://pe-ultimate.netlify.app/#delete-contact`); the operator deletes the Netlify submission (`privacy-and-student-data.md` §5).
- **Optional services the teacher set up** (Drive backup, records sync, Android Auto Backup): the teacher turns them off in the app and deletes the copies in their own Google account.

## Rules to apply only if payments are approved later

Verify each point against current law and store policy at that time; these are planning notes, not legal conclusions.

1. **Store purchases are refunded by the store.** Google Play and Apple handle refund requests for in-app purchases and subscriptions under their own policies. The developer has limited or no direct refund tools for Apple IAP; Google Play gives developers order-management refund options. The app and terms must point users to the right store process instead of promising refunds the operator cannot issue.
2. **Cancel as easily as subscribe.** Subscriptions must be cancellable through the store's subscription settings, and the app should link there. No dark patterns, no hidden renewal, clear price and period before purchase.
3. **Israel.** Israeli consumer protection law gives cancellation rights for distance sales and specific rules for ongoing (recurring) transactions, including cancellation by the same channels used to sign up and limits on cancellation fees. Check the current Consumer Protection Law and Cancellation of Transaction Regulations with a lawyer before setting terms.
4. **EU/UK.** Consumers generally have a 14-day withdrawal right for distance contracts; for digital content supplied immediately this right can be lost only with the consumer's express prior consent and acknowledgement. Check current rules.
5. **United States.** Several states have automatic-renewal laws (clear disclosure, affirmative consent, easy online cancellation). Check current state and federal rules if US users are targeted.
6. **Schools.** Sales to schools often run on invoices and purchase orders with their own cancellation terms; keep them separate from consumer subscriptions.
7. **Data after cancellation or refund.** The teacher keeps their on-device data and can export it. Losing a paid feature must never delete or lock existing pupil data.
8. **Records.** Keep only what is needed to handle a refund or dispute, disclose it in `privacy.html`, and set a retention period.
