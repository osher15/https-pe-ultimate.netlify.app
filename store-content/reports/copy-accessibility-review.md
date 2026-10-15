# Copy accessibility review — B14 (draft audit)

Scope: the new store-content/copy drafts and store-content/site/seo.json on branch codex/g1-notion-export-pilot-20261014. This is a text-only review, not an accessibility conformance test.

## Checks performed
- Reviewed authored heading structure: one document title followed by section headings; email templates and support macros use numbered H2 sections.
- Checked that FAQ and support text uses meaningful policy references, but many destinations remain placeholders pending owner decisions.
- Reviewed drafts for misleading device support or official approval; explicit limitations are retained.
- Checked SEO title and description character limits in the creation script for 23 sitemap pages across five languages.

## Outstanding issues
1. Replace {{TERMS_URL}}, {{REFUND_POLICY_URL}}, {{SUPPORT_EMAIL}}, {{CATALOG_URL}} and related placeholders with descriptive, functioning links before publishing. Source: store-content/copy/faq.*.md and support-kb.*.md.
2. Some links are shown as raw placeholders without link text. Use descriptive labels such as “Read licence terms” in the rendered site. Source: store-content/copy/products.en.md.
3. Translations need native-language editorial review, especially accessibility vocabulary and right-to-left presentation. Source: store-content/copy/product-pages.{he,ar,ru,es}.md.
4. The B11 alt-text draft includes English movement names inside other languages and was not visually checked against animation frames. Do not ship until corrected. Source: store-content/exercise-anim/alt-texts.json.
5. Download README files are generic templates. Replace {{INCLUDED_FILES}} and check real keyboard, screen-reader and print behaviour per delivered product.
6. The current SEO descriptions repeat a generic page description across many pages. Improve page specificity before indexing; this is a quality issue, not a claim of accessibility compliance.

## Changes applied
No source copy changes in this audit. The listed items require editorial and/or owner review; do not mark them as fixed.

## Checks not performed
No screen-reader, keyboard, device, browser, automated accessibility scanner or visual contrast checks were executed.
