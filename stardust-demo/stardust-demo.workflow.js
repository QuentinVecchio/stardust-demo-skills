export const meta = {
  name: 'stardust-demo',
  description: 'One URL → full presales demo: uplift (monolithic, full context), sprinkles open progressively as artifacts land.'
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
// Phase 1 — Open pipeline sprinkle immediately + launch uplift & watcher
// ===========================================================================
phase('launch');
log('Opening pipeline sprinkle + starting uplift and artifact watcher');

const [pipelineReady, upliftDone, watcherDone] = await parallel([

  // --- Pipeline sprinkle (opens first, shows live progress) ---
  () => agent(`
Read the template at /workspace/stardust-demo-skills/stardust-demo/templates/pipeline.shtml.tpl.

Generate the pipeline sprinkle:
1. Read the template
2. Replace placeholders:
   - {{URL}} → "${url}"
   - {{SLUG}} → "${slug}"
   - All other {{...}} placeholders → "" (empty for now — will be updated by the watcher)
3. Set Extract as "in-progress", everything else as "pending"
4. Write to /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml
5. Run: sprinkle open ${slug}-pipeline

Return "done".
`),

  // --- The monolithic uplift (preserves full context across all phases) ---
  () => agent(`
You are running the FULL stardust:uplift pipeline for ${url}.
This is a single, monolithic execution — you carry context from extraction through prototyping.

Output workspace: /workspace/stardust/

Skills to read FIRST:
- /workspace/skills/stardust/skills/uplift/SKILL.md — the full uplift procedure
- /workspace/skills/stardust/skills/uplift/reference/what-if-candidates.md
- /workspace/skills/stardust/reference/ — all reference docs
- /workspace/skills/stardust/skills/prototype/reference/motion-registers.md
- /workspace/skills/stardust/skills/prototype/reference/motion-runtime.md
- /workspace/skills/stardust/skills/prototype/reference/motion-attributes.md
- /workspace/skills/impeccable/SKILL.md
- /workspace/skills/impeccable/scripts/command-metadata.json

IMPORTANT: After completing each phase, write a signal file so the watcher knows progress:
- After Extract:    write /workspace/stardust/.signal-extract-done
- After Audit:     write /workspace/stardust/.signal-audit-done
- After Direction: write /workspace/stardust/.signal-direction-done
- After Prototypes: write /workspace/stardust/.signal-prototypes-done
Each signal file should contain just "done".

Execute ALL phases of stardust:uplift in sequence:

Phase 1 — Extract:
- Use playwright-cli to capture ${url}
- Extract brand data (palette, typography, motifs, voice, components, photography)
- Write: /workspace/stardust/current/_brand-extraction.json, pages/home.json, brand-review.html, PRODUCT.md, DESIGN.md
- Serve: open /workspace/stardust/current/brand-review.html
- Signal: write /workspace/stardust/.signal-extract-done

Phase 2 — Tension & Trait Identification:
- Analyze the brand surface for 5 specific weaknesses
- Identify 6-8 "what if" candidates from the closed catalog
- Write: /workspace/stardust/uplift-improvements.md, /workspace/stardust/uplift-questions.md
- Signal: write /workspace/stardust/.signal-audit-done

Phase 3 — Direction (pick 3 variant directions):
- Pick cinematic register for C
- Pick C's and B's "what if" candidates
- Write: /workspace/stardust/direction.md
Phase 4 — Direct (author design tokens):
- Write at /workspace/ root: PRODUCT.md, DESIGN.md, DESIGN.json, DESIGN-A/B/C.md, DESIGN-A/B/C.json
- DESIGN-C.json must include extensions.motion.register
- Signal: write /workspace/stardust/.signal-direction-done

Phase 5 — Prototype x3:
- Generate complete standalone HTML:
  /workspace/stardust/prototypes/home-A-proposed.html (faithful + improvements)
  /workspace/stardust/prototypes/home-B-proposed.html (amplified trait)
  /workspace/stardust/prototypes/home-C-cinematic.html (cinematic with motion runtime)
- Each variant differs by >= 2 structural changes
- Variant C bets on motion, not "more of B"
- Do NOT invent colors/fonts/content not on the site
- Open all three: open /workspace/stardust/prototypes/home-A-proposed.html (etc.)

Phase 6 — State:
- Write /workspace/stardust/state.json marking all as prototyped
- Signal: write /workspace/stardust/.signal-prototypes-done

Return "done" when all phases complete.
`, { thinking: 'medium' }),

  // --- Watcher: polls for signal files, opens sprinkles as artifacts land ---
  () => agent(`
You are the artifact watcher for the stardust demo of ${url} (slug: ${slug}).

Your job: poll for signal files written by the uplift agent, and as each one appears,
generate and open the corresponding sprinkle. Also update the pipeline sprinkle status.

The signal files are:
- /workspace/stardust/.signal-extract-done
- /workspace/stardust/.signal-audit-done
- /workspace/stardust/.signal-direction-done
- /workspace/stardust/.signal-prototypes-done

Templates are at: /workspace/stardust-demo-skills/stardust-demo/templates/

PROCEDURE (execute in order, polling between each):

1. POLL for /workspace/stardust/.signal-extract-done (check every 10 seconds up to 5 minutes):
   while [ ! -f /workspace/stardust/.signal-extract-done ]; do sleep 10; done

   When it lands:
   a. Serve brand-review: open /workspace/stardust/current/brand-review.html
   b. Read template brand-review.shtml.tpl, replace:
      - {{URL}} → "${url}"
      - {{SLUG}} → "${slug}"  
      - {{BRAND_REVIEW_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/current/brand-review.html"
   c. Write to /shared/sprinkles/${slug}-brand-review/${slug}-brand-review.shtml
   d. Run: sprinkle open ${slug}-brand-review
   e. Update pipeline: mark Extract done, Brand Review done, Audit in-progress
      Edit /shared/sprinkles/${slug}-pipeline/${slug}-pipeline.shtml accordingly
      Then: sprinkle close ${slug}-pipeline && sprinkle open ${slug}-pipeline

2. POLL for /workspace/stardust/.signal-audit-done:
   while [ ! -f /workspace/stardust/.signal-audit-done ]; do sleep 10; done

   When it lands:
   a. Read template audit.shtml.tpl and /workspace/stardust/uplift-improvements.md
   b. Replace {{URL}} → "${url}", {{SLUG}} → "${slug}}"
   c. Populate the 5 tensions from uplift-improvements.md
   d. Write to /shared/sprinkles/${slug}-audit/${slug}-audit.shtml
   e. Run: sprinkle open ${slug}-audit
   f. Update pipeline: mark Audit done, Direction in-progress
      Reload pipeline sprinkle.

3. POLL for /workspace/stardust/.signal-direction-done:
   while [ ! -f /workspace/stardust/.signal-direction-done ]; do sleep 10; done

   When it lands:
   a. Update pipeline: mark Direction done, Prototypes in-progress
      Reload pipeline sprinkle.

4. POLL for /workspace/stardust/.signal-prototypes-done:
   while [ ! -f /workspace/stardust/.signal-prototypes-done ]; do sleep 10; done

   When it lands:
   a. Serve prototypes:
      open /workspace/stardust/prototypes/home-A-proposed.html
      open /workspace/stardust/prototypes/home-B-proposed.html
      open /workspace/stardust/prototypes/home-C-cinematic.html
   b. Wait 3 seconds, then take screenshots:
      - Use playwright-cli tab-list to find the tabs
      - playwright-cli screenshot --tab <id> /shared/${slug}-variant-A.png
      - playwright-cli screenshot --tab <id> /shared/${slug}-variant-B.png
      - playwright-cli screenshot --tab <id> /shared/${slug}-variant-C.png
      - open /shared/${slug}-variant-A.png
      - open /shared/${slug}-variant-B.png
      - open /shared/${slug}-variant-C.png
   c. Read template variants.shtml.tpl and /workspace/stardust/direction.md and /workspace/stardust/uplift-improvements.md
   d. Replace:
      - {{URL}} → "${url}"
      - {{SLUG}} → "${slug}"
      - {{SCREENSHOT_A}} → "https://www.sliccy.ai/preview/shared/${slug}-variant-A.png"
      - {{SCREENSHOT_B}} → "https://www.sliccy.ai/preview/shared/${slug}-variant-B.png"
      - {{SCREENSHOT_C}} → "https://www.sliccy.ai/preview/shared/${slug}-variant-C.png"
      - {{VARIANT_A_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-A-proposed.html"
      - {{VARIANT_B_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-B-proposed.html"
      - {{VARIANT_C_URL}} → "https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-C-cinematic.html"
   e. Populate card content from direction.md and shared fixes from uplift-improvements.md
   f. Write to /shared/sprinkles/${slug}-variants/${slug}-variants.shtml
   g. Run: sprinkle open ${slug}-variants
   h. Update pipeline: mark Prototypes done (with variant substeps linking out)
      Reload pipeline sprinkle.

Return "done" when all 4 signals have been processed.
`)
]);

// ===========================================================================
// Done
// ===========================================================================
phase('complete');
log(`Demo ready for ${url}`);

return {
  url,
  slug,
  sprinkles: [
    `${slug}-pipeline`,
    `${slug}-brand-review`,
    `${slug}-audit`,
    `${slug}-variants`
  ],
  prototypes: {
    A: `https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-A-proposed.html`,
    B: `https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-B-proposed.html`,
    C: `https://www.sliccy.ai/preview/workspace/stardust/prototypes/home-C-cinematic.html`
  },
  brandReview: 'https://www.sliccy.ai/preview/workspace/stardust/current/brand-review.html',
  nextStep: 'User picks a variant via Deploy button → triggers stardust:deploy'
};
