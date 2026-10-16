# International compliance

The app ships in five languages (Hebrew, English, Arabic, Russian, Spanish) and can be installed anywhere the stores allow. The operator is based in Israel. This file lists the legal frameworks most likely to matter and how the current design relates to them. It is orientation for agents, not legal advice; before a launch in a new market or a school/district deal, the owner needs a local legal check.

## Design facts that drive most answers

- The operator receives only the optional contact form (name, email, phone, message, language, app version). Netlify processes it on the operator's behalf.
- Pupil data is entered by the teacher, stored on the device, and never sent to the operator. The operator does not have it and cannot access, export or delete it.
- No accounts, no tracking, no ads, no profiling, no sale of data.
- Audience is adults. Pupils (often minors) are data subjects, not users of their own accounts.

These facts keep the operator's obligations small. Any change to them (accounts, cloud sync, analytics, payments) re-opens every section below.

## Israel

- **Protection of Privacy Law, 5741-1981**, as amended (Amendment 13, in force from August 2025, expanded definitions, enforcement powers and duties). Applies to the operator's contact-form database. Keep: purpose limitation, a clear notice (the privacy page), access/correction/deletion handling, retention as promised.
- **Privacy Protection (Data Security) Regulations, 2017**: security levels depend on database type and size; a small contact database is likely at the basic level. Check current thresholds and registration duties with a professional.
- **Schools:** Ministry of Education rules on pupil information and the use of digital tools apply to the teacher and school, not to the operator directly. The terms already put responsibility for permission on the teacher/school.
- **Consumer protection** (only relevant if payments are added): see `refunds-and-cancellations.md`.

## European Union and United Kingdom (GDPR / UK GDPR)

- The contact form is personal data processing by the operator as controller. Needed: lawful basis (consent or legitimate interest for replying), transparency (privacy page), data-subject rights (access, deletion), retention limit (24 months promised), a processor agreement with Netlify (Netlify offers a DPA; the owner should accept it), and a basis for transfer outside the EU/UK (Israel has an EU adequacy decision; Netlify is a US company, so check its transfer mechanism).
- Pupil data on the device: the school or teacher is the controller; the operator is neither controller nor processor because it never receives the data. Keep it that way. If any sync to an operator server is ever built, the operator becomes a processor and a Data Processing Agreement with schools is required.
- Children's data: GDPR age-of-consent rules for information-society services apply to services offered directly to children. The app is not offered to children; do not add child-facing sign-up.
- Do not state "GDPR compliant" anywhere.

## United States

- **COPPA:** applies to services directed to children under 13 or with actual knowledge of collecting their personal information online. The app is adult-directed and the operator collects no pupil data. Adding pupil accounts, pupil contact collection or pupil-facing online features would change this.
- **FERPA** applies to schools receiving federal funds; teachers decide what education records they put on a device. The operator does not receive records.
- **State student-privacy laws** (e.g. California SOPIPA and similar) target operators of K-12 services that collect student data. Not triggered while nothing reaches the operator; triggered by any operator-side student data.
- **State consumer privacy laws** (CCPA/CPRA and others) have revenue/volume thresholds; the current contact form is far below them, but re-check if the project grows or adds payments.

## Arabic-, Russian- and Spanish-speaking markets

- Many countries have their own data protection laws (for example Spain is under GDPR; Latin American countries such as Brazil (LGPD), Mexico, Argentina, Colombia; Gulf states such as the UAE and Saudi Arabia (PDPL); Russia (Federal Law 152-FZ, with data-localisation rules for operators that collect citizens' data)).
- With the current design the operator's only processing is the optional contact form. Before targeting a specific country through marketing, school partnerships or store country selection, the owner should check that country's rules, especially localisation (Russia) and cross-border transfer rules.
- Translations of the privacy page are drafts, not reviewed by native-speaking lawyers. If a language version is ever relied on legally, have it reviewed, and say which version prevails.

## Rules for agents

1. Do not add country-specific legal claims or compliance badges.
2. Do not change norms, defaults or legal text automatically based on UI language (see `docs/ACTION_PLAN_2026-10-03.md`, held items).
3. Treat any request for school/district contracts, DPAs or certifications as an owner/legal task; prepare factual data maps only.
4. Keep the five privacy page languages equivalent; a change in one language is a change in all five.
