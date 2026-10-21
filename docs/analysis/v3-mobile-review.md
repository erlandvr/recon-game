# Mobile landscape review

2026-10-21 · D195 · `codex/v3-mobile-layout` · local work from `b731fae` (GitHub main verified before implementation).

## Delivered behavior

- Open the same game URL. Touch phones in portrait see a rotation prompt. Landscape starts at the existing welcome, then the three pointers and countdown.
- Rotation holds the intro, countdown and active simulation. Returning to landscape requires **Continue experience**. Cash, time and work do not catch up for the held interval. Results remain frozen. Reload still resets the run.
- A compact HUD retains cash/target, net earnings and time. Purchases retain prices, counts, disabled states and immediate feedback, with touch targets at least 44px high. Receipts temporarily replace availability text. Long availability explanations may ellipsize; the build/hire counts still show the limits.
- Wide short screens put purchases on the right so the animated workshop gets more height. Narrower landscape screens retain the bottom shelf. The workshop coordinates, worker routes, engine and prices are unchanged. Intro captions render as readable HTML on phones instead of shrinking with the artwork.
- Dynamic viewport height and safe-area padding keep the layout inside the browser. No orientation lock is required. D196 optionally requests document fullscreen from the phone’s Get your intro tap, before starting the intro. Unsupported/declined requests continue normally; desktop does not request fullscreen. Exiting fullscreen leaves the run intact. Compact mode omits decorative purchase props, crew row and secondary HUD breakdowns. At 380px height and below, it also omits the guidance footer and detailed earnings recap on results. Primary result information, replay and reopening the result remain available.

## Verification

- `npm test`: 172/172 passed. `npm run build`: passed, including TypeScript.
- `tests/v3-event-browser.ts`: existing desktop welcome/restart behavior and four viewport sizes passed.
- `tests/v3-orientation-browser.ts`: original desktop pointer timing, countdown, hidden/restart holds, reduced motion, refresh and replay passed across four desktop sizes.
- `tests/v3-mobile-browser.ts`: portrait entry, frozen cash/time through intro/countdown/run rotation, explicit continue, touch purchases, maximum estate (twelve systems/four developers/Recon Plus), complete paid run, results, reopening results and replay. Seven landscape viewports: 568×320, 667×280, 695×274, 740×320, 844×390, 932×430 and 1024×600. Screenshot evidence in ignored `test-results/v3-mobile/`; includes the narrow and busy scenes. The fast complete-run loop advances the browser clock in two-second intervals; it does not measure frame rate.
- Maestro on the user's connected Android phone in Chrome: portrait prompt, landscape welcome/intro/play, both landscape directions, portrait interruption and explicit continue, completed-run result and Play again observed/passed. Browser and Android system bars remained visible. The observed content viewport is approximately 695×274 CSS pixels. Source-side automated tests prove exact time/cash holds; the device flow proves visible interaction and fit.
- Reusable device flow: `tests/maestro/v3-mobile.yaml`; final saved flow, including the fullscreen toolbar assertion, passed all 19 commands on the connected Android device. Start a preview, forward its port with `adb reverse tcp:<port> tcp:<port>`, and supply `GAME_URL` if different from the default. Do not clear browser data. Local preview for this review: `http://127.0.0.1:5176/` (USB forwarding configured for the connected phone).

Final mobile browser runs passed in Chromium 151 and Playwright WebKit 26.5, including the seven viewport checks and complete touch run. WebKit screenshots are in `test-results/v3-mobile-webkit/`. This is Safari-engine coverage on the Mac, not a real iPhone test.

## Remaining limits

Real iPhone Safari, safe-area behavior on a notched iPhone, in-app browsers, physical thermal/frame-rate behavior and unassisted player comprehension are not verified. Browser viewport checks cannot establish those. The layout is reviewed at the dimensions above, not every possible zoom level or foldable configuration. Very small/enlarged-text dialogs retain internal scrolling as a fallback. Owner accepted the changes and authorized source publication under D198. These checks do not establish deployment completion or universal compatibility.

## Fullscreen follow-up — D196

`tests/v3-fullscreen-browser.ts` passes actual browser fullscreen entry from the intro button, game continuation after fullscreen exit, unsupported API, rejected request, synchronous API failure, and no fullscreen request on desktop. Exact-viewport mobile tests explicitly disable fullscreen to retain normal-browser fallback coverage. Maestro verified the Chrome address bar before tapping Get your intro, its disappearance afterwards, and enabled game controls after the countdown on the connected Android device. The inspected fullscreen screenshot shows the workshop using the whole display, with browser and system bars hidden. Maestro also passed portrait/landscape interruption and continue while fullscreen, followed by Android Back restoring the browser toolbar with the workshop still present. Normal mobile layout/rotation and desktop intro regressions passed. Real iPhone fullscreen behavior remains unverified; fallback is intentional.

## Laptop purchase appearance — D197

Owner requested the mobile card styling on laptop while retaining the bottom position. Shared styling now removes the decorative shelf/props and uses filled bordered cards, bold labels, prices beneath, corner counts and availability/receipt feedback. The compact right-hand column now requires a coarse pointer, preserving a bottom row on short laptop windows. Checked 1024×768, 1280×720, 1366×768, 1440×900 and 1280×600: all four controls stay in one row below the workshop with no page overflow, and purchase feedback remains functional. Build and the four-size desktop intro checks pass.

## Acceptance and additional regression — D198

Owner accepted the mobile experience and laptop controls and requested extra testing before committing, merging into main and pushing to GitHub and Bitbucket. Both remote main branches were fetched and verified at the shared starting commit `b731fae`; deployment configuration remains unchanged.

The additional checks cover rotation while a restart confirmation is open, backgrounding during that hold, cancellation without lost progress, rotation after victory, reopening results at four mobile sizes, and replay. Two presentation issues were found and corrected: taller mobile layouts showed two View result controls, and closing a result dialog could shift the game surface by one pixel as focus returned. The header result control now appears only when the footer is hidden; the compact game surface cannot scroll on focus restoration and the footer action aligns within the viewport. Regression checks include these cases.

The connected Android Chrome device passed the saved 19-command Maestro flow, including browser toolbar disappearance, play, portrait interruption, opposite landscape orientation and explicit continue. The full unit suite passed 172/172, the production build passed, desktop intro/event checks passed, and five laptop layouts retained their bottom purchase row. Exact browser results are recorded in the closeout below. Real iPhone and deployment completion remain separate, unverified checks.

Final closeout checks: the expanded mobile flow passes in Chromium and WebKit, including all visible header/footer/purchase touch targets and exactly one result action at each of the four result viewports. Fullscreen acceptance, exit continuity and all fallback cases pass in Chromium. Final TypeScript/production build passes. No remaining failures in the exercised scope.
