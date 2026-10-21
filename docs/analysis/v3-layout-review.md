# V3 spatial feasibility review

Checked 2026-10-20. [Open the interactive study](v3-layout-study.html). [Raw measurements](v3-layout-measurements.json).

## Scope update

D151–D152 now specify a central radar centrepiece and workshop purchase shelf. This study predates those choices and still shows a right-side Recon placeholder and rectangular purchase controls. Its measurements establish available space for the schematic composition only; the new art and placement need another fit check when designed.

## Finding

A schematic scene with twelve system positions, four developers/workbenches, three Recon slots and purchase/HUD space fits the tested desktop viewports. Begin artwork exploration around a machine height of **2.5 times** the developer's nominal standing height. Three times fits geometrically but leaves less visual breathing room. These are layout recommendations, not final art or proof of animation readability.

| Viewport | Developer height | Machine height at 2.5× | At 3× | Assessment |
| --- | ---: | ---: | ---: | --- |
| 1440×900 | 39 px | 97 px | 116 px | Comfortable spatial budget; posture can be comparatively clear. |
| 1280×800 | 33 px | 83 px | 100 px | Plausible desktop starting point. |
| 1024×768 | 31 px | 79 px | 94 px | Fits; emphasise silhouette and posture rather than facial detail. |
| 800×700 | 25 px | 61 px | 74 px | Fits geometrically, but expressive character readability is weak at this scale. A compact composition needs further visual work. |

The height ratio uses a 32-unit standing developer and 80- or 96-unit machine, before viewport scaling. The combined bent-over carrying silhouette is taller/wider than the developer alone. Shape proportions are illustrative; the study does not establish physical screen size or legibility from across a venue.

## What was checked

Local Chromium captured sixteen combinations: four viewports, two ratios and assembly/delivery states. All had no page overflow, no SVG group extending outside its board, four developer figures, three Recon slots and no page-script errors. Representative desktop and compact screenshots were inspected. Purchase controls are labelled layout placeholders, not functional game controls.

The scene contains eleven installed systems and one system under construction/in delivery, with its twelfth position reserved. The carried or bench-built machine is not an additional thirteenth system. The independent scenario selectors let reviewers compare 2×/2.5×/3× scale and assembly/delivery placement; the recorded checks cover 2.5× and 3×.

A first route was too tight for the large load. The final illustrated route uses a wider gap between clusters. Sampling its carried-machine rectangle at two-percent steps along each route segment found no overlap with the eleven installed machine bodies at either checked ratio. The destination placeholder is excluded because installation must enter that position. This is a check of one illustrative route, not a general pathfinding or concurrent-worker test.

## Consequences for the prototype

- Reserve wide movement corridors between clusters. Route the whole carried silhouette, not just the worker's feet. New placements must leave access to every maintenance destination.
- Keep four right-side benches and the Recon area distinct. Their schematic arrangement can fit, but exact props and processing animation must stay inside the reserved space.
- Do not place a full-sized machine at both the bench and destination during delivery. Use a subtle reserved-position outline if needed.
- Keep HUD and purchases outside the movement area. A decorative coin flight can cross the scene without covering controls or changing income logic.
- Keep world scale and destinations stable during active journeys. For compact viewports, simplify secondary labels and composition rather than shrinking the characters indefinitely. Do not infer a new minimum supported viewport from this study alone.
- Check actual path distances against the four–six-second typical walking proposal. One constant walking speed cannot force all routes to take the same duration.

## Limits and next checks

This study is static and uses intentionally schematic rectangles and stick figures. It does not validate detailed artwork, smooth motion, all node arrangements, four simultaneous carries, overlapping repair panels, accessibility of a finished game, queue balance or the two-to-three-minute target. Test those in the animated prototype and observe a bystander. At 800×700, spatial fit alone is not enough to claim the intended expressive performance works.

Screenshots from the local check are under `test-results/v3-layout/` (ignored output). The HTML and measurements are retained with the documentation. No production game or sandbox mechanics changed.
