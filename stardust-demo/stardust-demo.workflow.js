export const meta = {
  name: 'stardust-demo',
  description: 'One URL → full presales demo: uplift, audit, 3 variant prototypes, 4 sprinkles, optional deploy to AEM/EDS.'
};

// --- Input ---
const url = args?.url;
if (!url) return 'Error: provide a URL. Usage: stardust-demo \'{"url":"https://example.com"}\'';

// --- Slug derivation ---
const hostname = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[./:]/)[0].toLowerCase();
const hexId = Math.random().toString(16).slice(2, 6);
const slug = `${hostname}-${hexId}`;

log(`Starting stardust demo for ${url} (slug: ${slug})`);

// ===========================================================================
// Phase 1 — Extract + Uplift (single agent, does the heavy lifting)
// ===========================================================================
phase('uplift');
log('Running stardust:uplift — extract, tension analysis, direction, 3 prototypes');

const upliftResult = await agent(`
You are running the stardust:uplift pipeline for the URL ${url}.

Your output workspace is /workspace/stardust/. All files you write go there.

Skills available at:
- /workspace/skills/stardust/SKILL.md — master stardust skill
- /workspace/skills/stardust/skills/uplift/SKILL.md — uplift sub-skill
- /workspace/skills/stardust/skills/uplift/reference/what-if-candidates.md
- /workspace/skills/stardust/reference/ — all stardust reference docs
- /workspace/skills/stardust/skills/prototype/reference/motion-registers.md
- /workspace/skills/impeccable/SKILL.md — impeccable design skill
- /workspace/skills/impeccable/scripts/command-metadata.json

Execute ALL six phases of stardust:uplift:

Phase 1 — Extract: use playwright-cli to capture ${url}, extract brand data (palette, typography, motifs, voice, components, photography style). Write _brand-extraction.json, pages/home.json, brand-review.html, PRODUCT.md, DESIGN.md under /workspace/stardust/current/.

Phase 2 — Tension & trait identification: write uplift-improvements.md (5 specific weaknesses) and uplift-questions.md (6-8 "what if" candidates).

Phase 3 — Pick 3 variant directions: cinematic register for C, "what if" candidates for B and C, write direction.md.

Phase 4 — Direct: write PRODUCT.md, DESIGN.md, DESIGN.json, DESIGN-A/B/C.md and .json at /workspace/ root.

Phase 5 — Prototype x3: generate complete standalone HTML files:
- /workspace/stardust/prototypes/home-A-proposed.html (faithful + fixes)
- /workspace/stardust/prototypes/home-B-proposed.html (amplified trait)
- /workspace/stardust/prototypes/home-C-cinematic.html (cinematic with motion runtime)

Phase 6 — Write state.json marking all pages as prototyped.

Do NOT invent colors, fonts, or content not present on the actual site.
Use [data-placeholder] for any fabricated stats/quotes.
Each variant must differ from others by >= 2 structural changes.
Variant C bets on motion, not "more of B".

Begin immediately with Phase 1.
`, { thinking: 'medium' });

// ===========================================================================
// Phase 2 — Screenshots (after uplift completes)
// ===========================================================================
phase('screenshots');
log('Taking screenshots of all 3 prototypes');

const screenshotResult = await agent(`
Take screenshots of the three stardust prototype files and serve them via the open command.

1. Open each prototype in the browser:
   playwright-cli open /workspace/stardust/prototypes/home-A-proposed.html
   playwright-cli open /workspace/stardust/prototypes/home-B-proposed.html
   playwright-cli open /workspace/stardust/prototypes/home-C-cinematic.html

2. Wait 3 seconds for rendering, then screenshot each tab (use playwright-cli tab-list to find the tab IDs):
   playwright-cli screenshot --tab <A-tab-id> /shared/${slug}-variant-A.png
   playwright-cli screenshot --tab <B-tab-id> /shared/${slug}-variant-B.png
   playwright-cli screenshot --tab <C-tab-id> /shared/${slug}-variant-C.png

3. Serve the screenshots:
   open /shared/${slug}-variant-A.png
   open /shared/${slug}-variant-B.png
   open /shared/${slug}-variant-C.png

4. Also serve the brand review:
   open /workspace/stardust/current/brand-review.html

Return a JSON object with the preview URLs like:
{
  "screenshotA": "<url>",
  "screenshotB": "<url>",
  "screenshotC": "<url>",
  "variantA": "<url>",
  "variantB": "<url>",
  "variantC": "<url>",
  "brandReview": "<url>"
}
`, {
  schema: {
    type: 'object',
    properties: {
      screenshotA: { type: 'string' },
      screenshotB: { type: 'string' },
      screenshotC: { type: 'string' },
      variantA: { type: 'string' },
      variantB: { type: 'string' },
      variantC: { type: 'string' },
      brandReview: { type: 'string' }
    },
    required: ['screenshotA', 'screenshotB', 'screenshotC', 'variantA', 'variantB', 'variantC', 'brandReview']
  }
});

// ===========================================================================
// Phase 3 — Generate sprinkles (parallel — all 4 at once)
// ===========================================================================
phase('sprinkles');
log('Generating 4 sprinkles from templates');

const urls = screenshotResult || {
  screenshotA: `https://www.sliccy.ai/preview/shared/${slug}-variant-A.png`,
  screenshotB: `https://www.sliccy.ai/preview/shared/${slug}-variant-B.png`,
  screenshotC: `https://www.sliccy.ai/preview/shared/${slug}-variant-C.png`,
  variantA: `https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-A-proposed.html`,
  variantB: `https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-B-proposed.html`,
  variantC: `https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-C-cinematic.html`,
  brandReview: `https://www.sliccy.ai/preview/workspace/stardust/current/brand-review.html`
};

const sprinkleResults = await parallel([
  // Audit sprinkle
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/audit.shtml.tpl and the audit data at /workspace/stardust/uplift-improvements.md.

Generate the audit sprinkle by:
1. Reading the template
2. Replacing {{URL}} with "${url}"
3. Replacing {{SLUG}} with "${slug}"
4. Populating the tensions data from uplift-improvements.md (extract the 5 tensions with their categories and descriptions)
5. Write the result to /shared/sprinkles/${slug}-audit/${slug}-audit.shtml
6. Run: sprinkle open ${slug}-audit

Return "done" when complete.
`),

  // Brand review sprinkle
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/brand-review.shtml.tpl.

Generate the brand review sprinkle by:
1. Reading the template
2. Replacing {{URL}} with "${url}"
3. Replacing {{SLUG}} with "${slug}"
4. Replacing {{BRAND_REVIEW_URL}} with "${urls.brandReview}"
5. Write the result to /shared/sprinkles/${slug}-brand-review/${slug}-brand-review.shtml
6. Run: sprinkle open ${slug}-brand-review

Return "done" when complete.
`),

  // Variants sprinkle
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/variants.shtml.tpl and the direction file at /workspace/stardust/direction.md and the audit file at /workspace/stardust/uplift-improvements.md.

Generate the variants sprinkle by:
1. Reading the template
2. Replacing all placeholders:
   - {{URL}} → "${url}"
   - {{SLUG}} → "${slug}"
   - {{SCREENSHOT_A}} → "${urls.screenshotA}"
   - {{SCREENSHOT_B}} → "${urls.screenshotB}"
   - {{SCREENSHOT_C}} → "${urls.screenshotC}"
   - {{VARIANT_A_URL}} → "${urls.variantA}"
   - {{VARIANT_B_URL}} → "${urls.variantB}"
   - {{VARIANT_C_URL}} → "${urls.variantC}"
3. Populate the card content from direction.md (variant titles, pitches, "what if" questions, moves, roles)
4. Populate the shared fixes from uplift-improvements.md
5. Write to /shared/sprinkles/${slug}-variants/${slug}-variants.shtml
6. Run: sprinkle open ${slug}-variants

Return "done" when complete.
`),

  // Pipeline sprinkle
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/pipeline.shtml.tpl.

Generate the pipeline sprinkle by:
1. Reading the template
2. Replacing all placeholders:
   - {{URL}} → "${url}"
   - {{SLUG}} → "${slug}"
   - {{BRAND_REVIEW_URL}} → "${urls.brandReview}"
   - {{AUDIT_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/uplift-improvements.md"
   - {{VARIANT_A_URL}} → "${urls.variantA}"
   - {{VARIANT_B_URL}} → "${urls.variantB}"
   - {{VARIANT_C_URL}} → "${urls.variantC}"
   - {{PREVIEW_URL}} → "" (empty — deploy not started yet)
   - {{ORG}}/{{REPO}}/{{BRANCH}} → "" (empty — deploy not started yet)
3. Set all steps through Prototypes as "done", Deploy and Iterate as "pending"
4. Write to /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml
5. Run: sprinkle open ${slug}-pipeline

Return "done" when complete.
`)
]);

// ===========================================================================
// Phase 4 — Summary
// ===========================================================================
phase('complete');
log('Demo ready');

return {
  url,
  slug,
  sprinkles: [
    `${slug}-pipeline`,
    `${slug}-audit`,
    `${slug}-brand-review`,
    `${slug}-variants`
  ],
  prototypes: {
    A: urls.variantA,
    B: urls.variantB,
    C: urls.variantC
  },
  screenshots: {
    A: urls.screenshotA,
    B: urls.screenshotB,
    C: urls.screenshotC
  },
  brandReview: urls.brandReview,
  nextStep: 'User picks a variant → click Deploy → triggers stardust:deploy'
};
