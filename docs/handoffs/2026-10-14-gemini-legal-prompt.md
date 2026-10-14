# Gemini / NotebookLM brief — legal research + draft legal texts for PE Tools Store — 2026-10-14

**How to use:** In NotebookLM (or Gemini with Deep Research), add every source in §3 to the notebook.
**Open each link and confirm it is the official, current text.** Replace any link that is broken or unofficial
with the official one and say so. Then run the task in §4.
You are a research assistant, not a lawyer. Everything you produce is a **draft for review by a licensed
lawyer**. Say this at the top of every document.

---

## 1. Business facts (use exactly these; do not assume others)
- **Seller:** a private individual in Israel who will open an **Osek Patur** (exempt dealer). Expected turnover is
  small. The 2026 ceiling is reported as ₪122,833; verify it with the Israel Tax Authority. The seller will move
  to Osek Murshe or a company if sales grow.
- **Products:** downloadable digital products for **PE (physical education) teachers**:
  - lesson-plan packs with diagrams in 5 languages: Hebrew, English, Arabic, Russian, Spanish;
  - a drill/game/activity pack;
  - standalone offline HTML tools: a tactics/coach board, a scoreboard, a "20 m Shuttle Run (Beep Test)" based on
    Léger et al. 1988, and an interval trainer;
  - a bundle.
- **Pricing:** one-time purchases of about ₪19–149. **No subscription.** No account is required for the tools.
- **Buyers:** teachers and schools in **Israel and worldwide**, including the EU, UK and US. The content is in 5
  languages for that reason.
- **Licence model (owner decision):** two separate products:
  - (a) a **Single-Teacher licence**: one named teacher, all of their classes, not transferable;
  - (b) a **School licence**: all PE staff of one school or campus, at a higher price.

  Both licences: no resale, no redistribution, and no uploading to public sites or shared drives outside the
  licensee. The seller keeps ownership.
- **Data:** the tools run offline and store settings only in the browser (localStorage). They send no data and use
  **no student accounts**. A teacher may type pupils' names or bib numbers into a tool; that stays on the device.
  The storefront will be a static website, with payment by a third-party provider (to be chosen).
- **Content:**
  - Original texts written with AI assistance.
  - Translations were made with AI. The owner states that the professional content was reviewed by several
    teachers and checked against Ministry of Education curricula.
  - No third-party text or media is used.
  - "FITNESSGRAM", "PACER" and "Healthy Fitness Zone" are deliberately **not** used, because they are Cooper
    Institute trademarks.
- **Physical activity:** the products describe exercises and a maximal-effort fitness test for pupils, which is a
  safety and liability exposure.

## 2. Questions to answer (each with citations to the sources)
1. **Business set-up:** Can an Osek Patur sell digital products to consumers abroad?
   - What are the income-tax and VAT obligations in Israel, including receipts and invoices (קבלות)?
   - Does selling from abroad affect the Osek Patur status?
2. **EU/UK/US sales tax:** Does a non-EU seller owe EU VAT on B2C digital sales from the first euro (non-Union
   OSS)? What are the UK VAT rules and US state sales tax nexus for digital goods?
   - Compare a **Merchant of Record** platform with a plain payment processor, where the MoR is the legal seller
     and handles VAT, receipts and refunds.
   - Compare at least **Paddle, Lemon Squeezy, Gumroad and Payhip**: whether each accepts an Israeli individual
     or Osek Patur, fees, payout to Israel, refund handling, and which takes legal responsibility. Use only their
     official pages.
3. **Consumer cancellation and refunds for digital content:**
   - Israel: distance-selling cancellation and the exception for "information" (מידע) under the Computers Law.
   - EU: Consumer Rights Directive art. 16(m), the express-consent and acknowledgement flow before download, and
     the Digital Content Directive remedies for defects.
   - UK: Consumer Contracts Regulations 2013.
   - US: general expectations.

   What must the checkout show? **Never** recommend "no refunds under any circumstances".
4. **Licence terms:** what makes a teacher licence and a school licence enforceable and clear, given that
   consumer law limits unfair terms (EU Unfair Terms Directive, Israeli Standard Contracts Law).
5. **Privacy:**
   - Israel: the Privacy Protection Law and its Amendment 13.
   - GDPR and UK GDPR for a static site with a payment provider.
   - What changes if analytics or cookies are added.
   - CCPA applicability thresholds.
   - COPPA: the products are sold to teachers, and pupils are not users. Confirm this.
6. **Website accessibility obligations:**
   - Israel: the Equal Rights for Persons with Disabilities service-accessibility regulations and IS 5568.
   - EU: the European Accessibility Act and its microenterprise exemption.
7. **Marketing rules:** the Israeli anti-spam rule (Communications Law §30A), GDPR consent for e-mail, FTC
   endorsement guides (no fake reviews), and price display including VAT.
8. **Safety and liability wording** for exercise and fitness-test content used by teachers with minors: what
   disclaimers are customary and what they cannot exclude.
9. **IP:**
   - The trademark-safe naming of the shuttle-run test, and how to cite Léger et al. 1988.
   - Copyright notice for AI-assisted original content.
   - Whether the owner should register a trademark for the store name. List options only.

## 3. Sources to load (verify each; add official texts you find necessary)
**Israel**
- Kol Zchut, cancelling a distance sale: https://www.kolzchut.org.il/he/ביטול_עסקת_מכר_מרחוק
- Kol Zchut, cancelling an internet/phone purchase: https://www.kolzchut.org.il/he/ביטול_רכישה_שנעשתה_באינטרנט_או_בטלפון_והחזרת_המוצר
- Kol Zchut, non-cancellable consumer transactions: https://www.kolzchut.org.il/he/עסקה_צרכנית_שלא_ניתן_לבטל
- Consumer Protection Law 5741-1981 and Consumer Protection (Cancellation of Transaction) Regulations 5771-2010:
  find the official texts (Nevo / Knesset / gov.il).
- Privacy Protection Law 5741-1981 including Amendment 13, and the Privacy Protection Authority guidance:
  https://www.gov.il/he/departments/the_privacy_protection_authority
- Israel Tax Authority, exempt dealer (עוסק פטור) and VAT on export of services: official gov.il pages.
- Standard Contracts Law 5743-1982; Copyright Law 2007; Trademarks Ordinance; Communications Law §30A.
- Equal Rights for Persons with Disabilities (Service Accessibility Adjustments) Regulations 5773-2013, website
  provisions; IS 5568.

**European Union**
- Consumer Rights Directive 2011/83/EU: https://eur-lex.europa.eu/eli/dir/2011/83/oj
- Digital Content Directive 2019/770: https://eur-lex.europa.eu/eli/dir/2019/770/oj
- Omnibus Directive 2019/2161: https://eur-lex.europa.eu/eli/dir/2019/2161/oj
- Unfair Terms Directive 93/13/EEC: https://eur-lex.europa.eu/eli/dir/1993/13/oj
- GDPR 2016/679: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- ePrivacy Directive 2002/58/EC: https://eur-lex.europa.eu/eli/dir/2002/58/oj
- Geo-blocking Regulation 2018/302: https://eur-lex.europa.eu/eli/reg/2018/302/oj
- European Accessibility Act 2019/882: https://eur-lex.europa.eu/eli/dir/2019/882/oj
- VAT One-Stop Shop: https://vat-one-stop-shop.ec.europa.eu/

**United Kingdom**
- Consumer Contracts Regulations 2013: https://www.legislation.gov.uk/uksi/2013/3134
- Consumer Rights Act 2015: https://www.legislation.gov.uk/ukpga/2015/15
- ICO guidance (UK GDPR): https://ico.org.uk/for-organisations/
- HMRC VAT on digital services to UK consumers: the official gov.uk page.

**United States**
- COPPA Rule: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- FTC Endorsement Guides, 16 CFR 255: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255
- CCPA: https://oag.ca.gov/privacy/ccpa
- Sales tax on digital goods after *South Dakota v. Wayfair*: an official or academic overview.

**Payment / Merchant of Record:** the official terms pages and seller-eligibility pages of Paddle, Lemon Squeezy,
Gumroad and Payhip.

**Background:** Léger, Mercier, Gadoury & Lambert (1988), *J Sports Sci* 6(2):93–101,
https://pubmed.ncbi.nlm.nih.gov/3184250/

## 4. Deliverables (Markdown, each document in **Hebrew and English**)
1. **`legal-research.md`:** answers to §2. Each answer has a citation (source and section), states its
   confidence, and ends with "Questions for a lawyer". Add a one-page **risk table**: issue, jurisdiction, risk
   (high/medium/low), recommended action.
2. **`recommended-setup.md`:** a concrete recommendation covering:
   - Osek Patur plus a specific Merchant of Record, or another option, with reasons and costs;
   - what to do before the first sale, as a step list;
   - when to switch to Osek Murshe.
3. Draft documents, ready for lawyer review:
   - **`terms-of-sale.md`:** Terms of Sale and End-User Licence. Include the Single-Teacher and School licence
     definitions, permitted and forbidden use, delivery, updates, the refund policy by jurisdiction,
     limitation of liability within what the law allows, governing law and jurisdiction, and contact details.
   - **`refund-policy.md`:** for Israel, EU, UK and the rest of the world, with the **exact checkbox wording**
     for the EU/UK waiver before download.
   - **`privacy-policy.md`:** two parts: the storefront, and the offline tools (local storage only, how to
     delete).
   - **`safety-disclaimer.md`:** short, for inside the products. Cover teacher responsibility, adapting to
     pupils, stopping on pain or dizziness, medical clearance for the maximal shuttle-run test, and no medical
     claims.
   - **`accessibility-statement.md`:** a template with the Israeli-required fields.
   - **`content-and-translation-notice.md`:** use the owner's wording: "Translations were produced with AI. The
     professional content is accurate and was reviewed by several teachers and checked against Ministry of
     Education curricula; small proofreading, syntax or terminology errors are possible." Add an AI-assistance
     note and the copyright line.
   - **`checkout-copy.md`:** the exact texts shown at checkout: price incl. tax, licence choice, waiver
     checkbox, links.
4. **`open-questions.md`:** everything the owner or a lawyer must decide, ranked.

## 5. Rules
- Cite a specific source for every legal statement. Where a source is missing or unclear, write "unverified"
  instead of guessing.
- Do not invent laws, section numbers, thresholds or fees. Copy figures with their date and source.
- Hebrew must be natural legal Hebrew. English must be plain English. Keep the drafts short and readable.
- **Never** promise "no refunds", "100% legal", "certified" or "approved by the Ministry".
- Return all files in one zip. Add a summary page that lists every source you actually opened, with the
  date you accessed it.
