export const meta = {
  name: 'stardust-demo',
  description: 'One URL → full presales demo: uplift, audit, 3 variant prototypes, 4 sprinkles opened progressively as artifacts land.'
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
// Phase 1 — Pipeline sprinkle (opens immediately, all steps pending)
// ===========================================================================
phase('pipeline');
log('Opening pipeline sprinkle — live status from the start');

const pipelineResult = await agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/pipeline.shtml.tpl.

Generate the pipeline sprinkle:
1. Read the template
2. Replace placeholders:
   - {{URL}} → "${url}"
   - {{SLUG}} → "${slug}"
   - {{BRAND_REVIEW_URL}} → ""
   - {{AUDIT_URL}} → ""
   - {{VARIANT_A_URL}} → ""
   - {{VARIANT_B_URL}} → ""
   - {{VARIANT_C_URL}} → ""
   - {{PREVIEW_URL}} → ""
   - {{ORG}}/{{REPO}}/{{BRANCH}} → ""
3. Set Extract as "in-progress", everything else as "pending"
4. Write to /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml
5. Run: sprinkle open ${slug}-pipeline

Return "done".
`);

// ===========================================================================
// Phase 2 — Extract (captures the site, produces brand-review.html)
// ===========================================================================
phase('extract');
log('Extracting brand surface from ' + url);

const extractResult = await agent(`
You are running Phase 1 (Extract) of stardust:uplift for ${url}.

Use playwright-cli to:
1. Navigate to ${url} and take a full-page screenshot
2. Capture the DOM/HTML content (playwright-cli fetch ${url})
3. Extract brand data: colors (palette), typography (fonts, sizes, weights), motifs, voice/tone, components, photography style

Write these files:
- /workspace/stardust/current/_brand-extraction.json — palette + type + motifs + voice + system components + photography
- /workspace/stardust/current/pages/home.json — full per-page capture (sections, content, CTAs, nav)
- /workspace/stardust/current/brand-review.html — HTML page showing the brand tensions/analysis
- /workspace/stardust/current/PRODUCT.md — descriptive product doc (current state)
- /workspace/stardust/current/DESIGN.md — descriptive design doc (current state)

Then serve the brand review:
  open /workspace/stardust/current/brand-review.html

Return the preview URL for brand-review.html.
`, { thinking: 'medium' });

// ===========================================================================
// Phase 3 — Brand review sprinkle opens NOW + Audit runs in parallel
// ===========================================================================
phase('audit + brand-review');
log('Opening brand review sprinkle + running tension analysis in parallel');

const [brandReviewSprinkle, auditResult] = await parallel([
  // Open brand review sprinkle immediately (extract is done)
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/brand-review.shtml.tpl.

Generate the brand review sprinkle:
1. Read the template
2. Replace {{URL}} with "${url}"
3. Replace {{SLUG}} with "${slug}"
4. Replace {{BRAND_REVIEW_URL}} with "https://www.sliccy.ai/preview/workspace/stardust/current/brand-review.html"
5. Write to /shared/sprinkles/${slug}-brand-review/${slug}-brand-review.shtml
6. Run: sprinkle open ${slug}-brand-review

Also update the pipeline sprinkle at /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml:
- Mark "Extract" as done
- Mark "Brand Review" as done
- Mark "Audit" as in-progress
Then reload: sprinkle close ${slug}-pipeline && sprinkle open ${slug}-pipeline

Return "done".
`),

  // Run tension analysis (Phase 2 of uplift)
  () => agent(`
You are running Phase 2 (Tension & Trait Identification) of stardust:uplift for ${url}.

Read:
- /workspace/stardust/current/_brand-extraction.json
- /workspace/stardust/current/brand-review.html
- /workspace/stardust/current/pages/home.json
- /workspace/skills/stardust/skills/uplift/SKILL.md (Phase 2 section)
- /workspace/skills/stardust/skills/uplift/reference/what-if-candidates.md

Write:
- /workspace/stardust/uplift-improvements.md — 5 specific weaknesses per the SKILL.md format (categories: dated-pattern, ia-clutter, contrast-or-density, cliché, missed-opportunity)
- /workspace/stardust/uplift-questions.md — 6-8 "what if" candidates from the closed catalog

Return "done".
`, { thinking: 'medium' })
]);

// ===========================================================================
// Phase 4 — Audit sprinkle opens NOW + Direction runs in parallel
// ===========================================================================
phase('direction + audit-sprinkle');
log('Opening audit sprinkle + picking 3 variant directions in parallel');

const [auditSprinkle, directionResult] = await parallel([
  // Open audit sprinkle immediately (tensions exist now)
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/audit.shtml.tpl and the audit data at /workspace/stardust/uplift-improvements.md.

Generate the audit sprinkle:
1. Read the template
2. Replace {{URL}} with "${url}"
3. Replace {{SLUG}} with "${slug}"
4. Populate the 5 tensions from uplift-improvements.md (extract categories, titles, descriptions)
5. Write to /shared/sprinkles/${slug}-audit/${slug}-audit.shtml
6. Run: sprinkle open ${slug}-audit

Also update the pipeline sprinkle at /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml:
- Mark "Audit" as done (meta: "5 tensions found")
- Mark "Direction" as in-progress
Then reload: sprinkle close ${slug}-pipeline && sprinkle open ${slug}-pipeline

Return "done".
`),

  // Phase 3 of uplift — pick directions
  () => agent(`
You are running Phase 3 (Direction) of stardust:uplift for ${url}.

Read:
- /workspace/stardust/current/PRODUCT.md
- /workspace/stardust/uplift-improvements.md
- /workspace/stardust/uplift-questions.md
- /workspace/skills/stardust/skills/uplift/SKILL.md (Phase 3 section)
- /workspace/skills/stardust/skills/prototype/reference/motion-registers.md

Execute Phase 3:
3a. Pick cinematic register for variant C (from motion-registers.md heuristic + PRODUCT.md Brand Personality)
3b. Pick C's "what if" candidate (per the register→candidate table in uplift SKILL.md)
3c. Pick B's "what if" candidate (different axis from C, addresses a tension)
3d. Write /workspace/stardust/direction.md with three variant declarations per the format in uplift SKILL.md § 3d

Also write Phase 4 (Direct) outputs:
- /workspace/PRODUCT.md, /workspace/DESIGN.md, /workspace/DESIGN.json (Mode A, target state)
- /workspace/DESIGN-A.md, /workspace/DESIGN-A.json
- /workspace/DESIGN-B.md, /workspace/DESIGN-B.json
- /workspace/DESIGN-C.md, /workspace/DESIGN-C.json (must include extensions.motion.register)

Return "done".
`, { thinking: 'medium' })
]);

// ===========================================================================
// Phase 5 — Prototypes (3 variants generated, then screenshots + variants sprinkle)
// ===========================================================================
phase('prototypes');
log('Generating 3 variant prototypes');

// Update pipeline: direction done, prototypes in-progress
await agent(`
Update the pipeline sprinkle at /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml:
- Mark "Direction" as done (meta: "3 variants · editorial register")
- Mark "Prototypes" as in-progress
Then reload: sprinkle close ${slug}-pipeline && sprinkle open ${slug}-pipeline
Return "done".
`);

// Generate all 3 prototypes
const prototypeResult = await agent(`
You are running Phase 5 (Prototype x3) of stardust:uplift for ${url}.

Read:
- /workspace/stardust/direction.md
- /workspace/stardust/current/_brand-extraction.json
- /workspace/stardust/current/pages/home.json
- /workspace/DESIGN-A.json, /workspace/DESIGN-B.json, /workspace/DESIGN-C.json
- /workspace/skills/stardust/skills/prototype/reference/motion-registers.md
- /workspace/skills/stardust/skills/prototype/reference/motion-runtime.md
- /workspace/skills/stardust/skills/prototype/reference/motion-attributes.md

Generate three complete, standalone HTML files (no external CDN deps except fonts):
- /workspace/stardust/prototypes/home-A-proposed.html — faithful + improvements, static
- /workspace/stardust/prototypes/home-B-proposed.html — amplified trait, static
- /workspace/stardust/prototypes/home-C-cinematic.html — fully cinematic with motion runtime inline

Each HTML file must:
- Be a complete, self-contained redesign of ${url}'s homepage
- Use only the captured brand colors, fonts, and assets
- Apply data-section, data-component attributes
- Expose :root CSS custom properties
- Variant C cinematic: embed the motion runtime inline per motion-runtime.md
- Each variant differs from others by >= 2 structural changes
- Variant C bets on motion, not "more of B"

Also write /workspace/stardust/state.json marking all pages as "prototyped".

Open each prototype:
  open /workspace/stardust/prototypes/home-A-proposed.html
  open /workspace/stardust/prototypes/home-B-proposed.html
  open /workspace/stardust/prototypes/home-C-cinematic.html

Return "done".
`, { thinking: 'medium' });

// ===========================================================================
// Phase 6 — Screenshots + Variants sprinkle (parallel)
// ===========================================================================
phase('variants-sprinkle');
log('Taking screenshots and opening variants sprinkle');

const [screenshotsResult, variantsSprinkle] = await parallel([
  // Screenshots
  () => agent(`
Take screenshots of the three prototype tabs and serve them:

1. Run playwright-cli tab-list to find the prototype tabs
2. Screenshot each:
   playwright-cli screenshot --tab <A-id> /shared/${slug}-variant-A.png
   playwright-cli screenshot --tab <B-id> /shared/${slug}-variant-B.png
   playwright-cli screenshot --tab <C-id> /shared/${slug}-variant-C.png
3. Serve them:
   open /shared/${slug}-variant-A.png
   open /shared/${slug}-variant-B.png
   open /shared/${slug}-variant-C.png

Return a JSON with the served URLs.
`, {
    schema: {
      type: 'object',
      properties: {
        screenshotA: { type: 'string' },
        screenshotB: { type: 'string' },
        screenshotC: { type: 'string' }
      },
      required: ['screenshotA', 'screenshotB', 'screenshotC']
    }
  }),

  // Variants sprinkle (can start now — prototypes exist, use fallback URLs until screenshots land)
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/variants.shtml.tpl, the direction at /workspace/stardust/direction.md, and the audit at /workspace/stardust/uplift-improvements.md.

Generate the variants sprinkle:
1. Read the template
2. Replace placeholders:
   - {{URL}} → "${url}"
   - {{SLUG}} → "${slug}"
   - {{SCREENSHOT_A}} → "https://www.sliccy.ai/preview/shared/${slug}-variant-A.png"
   - {{SCREENSHOT_B}} → "https://www.sliccy.ai/preview/shared/${slug}-variant-B.png"
   - {{SCREENSHOT_C}} → "https://www.sliccy.ai/preview/shared/${slug}-variant-C.png"
   - {{VARIANT_A_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-A-proposed.html"
   - {{VARIANT_B_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-B-proposed.html"
   - {{VARIANT_C_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-C-cinematic.html"
3. Populate card content from direction.md (variant titles, pitches, what-if questions, moves, roles)
4. Populate shared fixes from uplift-improvements.md
5. Write to /shared/sprinkles/${slug}-variants/${slug}-variants.shtml
6. Run: sprinkle open ${slug}-variants

Also update the pipeline sprinkle at /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml:
- Mark "Prototypes" as done (meta: "3 variants generated", with substeps A/B/C linking to their URLs)
- Keep "Deploy" and "Iterate" as pending
Then reload: sprinkle close ${slug}-pipeline && sprinkle open ${slug}-pipeline

Return "done".
`)
]);

// ===========================================================================
// Done
// ===========================================================================
phase('complete');
log(`Demo ready for ${url}`);

const variantA = 'https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-A-proposed.html';
const variantB = 'https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-B-proposed.html';
const variantC = 'https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-C-cinematic.html';

return {
  url,
  slug,
  sprinkles: [
    `${slug}-pipeline`,
    `${slug}-audit`,
    `${slug}-brand-review`,
    `${slug}-variants`
  ],
  prototypes: { A: variantA, B: variantB, C: variantC },
  screenshots: screenshotsResult,
  brandReview: 'https://www.sliccy.ai/preview/workspace/stardust/current/brand-review.html',
  nextStep: 'User picks a variant via Deploy button → triggers stardust:deploy'
};
