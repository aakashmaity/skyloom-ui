# Advanced UI research and implementation plan

Reviewed 2026-11-20 against the existing React 19, Tailwind v4, Radix, TanStack, and semantic-token architecture.

## Reference findings

| Reference | Useful behavior | Decision for Sky UI |
| --- | --- | --- |
| [Aceternity component catalog](https://ui.aceternity.com/explore), [Card Spotlight](https://ui.aceternity.com/components/card-spotlight), [Animated Tabs](https://ui.aceternity.com/components/tabs) | Interactive surfaces, visual emphasis, and animated content changes | Implement token-driven lift/spotlight cards and subtle transitions. Keep essential content visible without hover. Avoid copying fixed colors, shader dependencies, or marketing effects into forms and tables. |
| [Aceternity card guidance](https://ui.aceternity.com/card) | Touch does not provide dependable hover; expandable cards still need modal focus handling | Use explicit actions and existing Radix dialogs. Decorative card effects do not turn a div into a button. |
| [shadcn Sheet](https://ui.shadcn.com/docs/components/sheet), [theming](https://ui.shadcn.com/docs/theming) | Composable overlays and semantic surface/foreground roles | Preserve package wrappers and root theme inheritance. The column drawer gets a stationary heading/footer and a scrolling list. |
| [Radix animation](https://www.radix-ui.com/primitives/docs/guides/animation) | State attributes support CSS entry/exit animations; CSS exits delay unmount | Use existing Radix state for entrance animation rather than a second overlay engine. Dismiss immediately: a browser regression showed canceled exit animations could leave a closed select mounted when the OS motion preference changed mid-exit. Keep Escape, focus restoration, and drag cancellation tested. |
| [Motion accessibility](https://motion.dev/docs/react-accessibility) | Respect OS reduced motion; avoid large transforms and parallax for those users | Persist System/Reduced/None motion preferences. OS reduction always wins. No animation is required to understand a component. |
| [Vercel AI SDK chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) | App-owned message state, streaming lifecycle, submit/stop/error behavior | Keep PromptInput controlled and transport-independent. Do not introduce a model endpoint or synthetic hidden reasoning. |
| [AI Elements Suggestion](https://elements.ai-sdk.dev/components/suggestion), [Tool](https://elements.ai-sdk.dev/components/tool), [Plan](https://elements.ai-sdk.dev/components/plan), [Reasoning](https://elements.ai-sdk.dev/components/reasoning) | Prompt suggestions, tool state, and expandable progress/details | Add Suggestions, ToolStatus, TaskPlan, and finite ShimmerText feedback. Callers supply status and visible details. These are native package components, not API-compatible copies. |

The AI Elements site currently announces a move into [shadcn/ui AI Elements](https://ui.shadcn.com/docs/ai-elements) and deprecation at the end of November 2026. Do not add the retiring package as a dependency. The AI SDK transport remains a separate app integration concern.

## Implemented scope and coverage

1. Every catalog entry has a Playground tab, generated from typed option metadata. Existing demos remain in Preview. Playground controls cover actual props and states rather than invented variants.
2. Select a variant/state, compare one dimension at a time, choose a compared option, narrow the container, reset state, and copy a standalone React example. Generated examples are typechecked against the package for every exposed option. Comparison previews mount independently with unique field IDs.
3. Motion applies at the shared component level: button press feedback, field-color transitions, progress changes, tab content, accordion disclosure, dialog/sheet entrance, popovers, menus, selects, and tooltips. Existing switch/loading behavior follows the same global motion settings. Static primitives such as labels and separators remain static; their playground previews can fade on configuration changes.
4. Add reusable InteractiveCard (lift/spotlight/none), Suggestions, ToolStatus, TaskPlan, and ShimmerText. Surface colors and motion dimensions/durations come from tokens. The text pulse is finite; reduced motion disables it. No new runtime dependency is required.
5. Refine the table drawer from the supplied screenshot: compact rows, visible-count summary, less introductory copy, independently scrolling column groups, persistent Reset/Done actions, and animated side entry. Preserve keyboard, pointer, touch, visibility, and pin behavior.

| Family | Playground options |
| --- | --- |
| Buttons and fields | All declared variants, button sizes/shapes, disabled/invalid/read-only states, selection states |
| Cards, badges, feedback | All declared surfaces and tones, image/fallback avatar, progress values, skeleton shapes, empty/action states |
| Navigation and overlays | Tab style/orientation, accordion single/multiple, dialog style/size, sheet side, floating side/alignment, pagination position |
| Table and analytics | Populated/empty/loading/error, column-management toggle/pinning, line/area/bar, stacking and empty/zero chart states |
| AI and advanced surfaces | Message role/style/content length, composer lifecycle, suggestion disabled state, tool/plan statuses, shimmer and card effects |
| Layout and static primitives | Stack/grid, separator orientation, group orientation, keyboard hints; shared theme and motion preview |

## Validation and boundaries

Run `npm run check`, production build, and browser tests across mobile/tablet/laptop. Check comparison reflow at 320 CSS pixels, theme inheritance in portals, generated-code correctness, control labels, reset, motion persistence, OS reduction, drawer footer visibility, and existing table drag/pin tests.

This is a reusable UI library and local catalog. It does not execute tools, stream model responses, upload attachments, or expose a backend. Chart playgrounds use small synthetic data sets to demonstrate the underlying chart component; analytics demos retain their original metric data. Narrow-container preview does not emulate a browser viewport breakpoint. The expansion now includes a lazy Three.js globe and canvas/SVG effects; additional shader and carousel families remain outside this implementation.


## Advanced expansion integration

Implemented references include [Aceternity components](https://ui.aceternity.com/components), [shadcn semantic theming](https://ui.shadcn.com/docs/theming), and [Vercel AI Elements](https://ai-sdk.dev/elements/overview). The library keeps presentation separate from application requests and AI orchestration. It does not add an AI SDK backend or make simulated progress into real task progress.

The catalog includes all eight requested families plus the text-effect family from the approved plan. Shared SVG icons, theme tokens, motion settings, keyboard alternatives, and local gallery artwork support these examples. Compare and infinite-grid interactions are native implementations. See the package README for APIs, dependency boundaries, geography attribution, and external preview opt-in behavior.


### Validation of the expansion

- `npm run check`: TypeScript, semantic-token checks, and 65 tests pass, including typechecking generated playground options.
- `npm run build`: package and Next.js production build pass.
- Browser coverage: 38 applicable checks pass across mobile, tablet, and laptop when combining the full regression run with the corrected advanced-test rerun; four deliberately desktop-only duplicates are skipped. Two initial map assertions matched a toolbar icon as well as the map; the role-based selector correction passes at all three sizes.
- All 98 catalog playgrounds open without page errors. Comparison keyboard input, gallery controls/details, input focus, 320-pixel reflow, table ordering/pinning, settings persistence, and icon alignment are covered.
- A separate browser probe verifies WebGL rendering without page errors, SVG fallback when WebGL is unavailable, and renderer chunks requested only after globe activation.
- Package dry run: 137 files, 101,429 compressed bytes, 370,996 unpacked bytes. Installed runtime dependencies are additional to these package archive sizes. No publishing or deployment was performed.


## Follow-up plan audit

Reviewed the attached expansion plan against public exports, component behavior, generated examples, semantic CSS references, and responsive catalog entries.

| Requested group | Existing implementation | Gaps corrected in this audit |
| --- | --- | --- |
| Gradient button | Existing Button variant; native/ref/asChild support | Stop decorative border animation for aria-disabled links |
| Loaders | Five wrappers, timed/controlled modal steps, canvas overlay | Stop non-looping sequence timers; show explicit waiting state; catch unavailable canvas contexts; keep static-effect status readable; demonstrate overlay on local artwork |
| Navigation | All eight planned navigation components | Attach dock tooltip/ref to actual control; suppress touch-focus magnification; retain text for iconless collapsed sidebar items |
| Forms | FormPanel/signup, gradient Input, vanish input, gooey input, upload | Ignore duplicate selections before enforcing upload count limits |
| Data and visualization | Local-data globe/map, timeline, Compare, Prism CodeBlock | Catch WebGL capability-check exceptions and retain map fallback |
| Layout and grid | Expandable LayoutGrid, BentoGrid, ContainerCover, bounded InfiniteCardGrid | Centralize cover-effect timing in tokens |
| Tooltip and preview | Animated avatars, supplied/custom/Microlink metadata | Clear request deadline after success; ignore responses after timeout; avoid aborting other preview subscribers at an individual deadline |
| Compare and infinite gallery | Shared controlled/native slider, drag/hover orientations, modern divider/particles, recycled two-dimensional gallery with finite list | Centralize particle timing and delay in tokens |

No component family from the agreed inventory is absent. This verifies native Sky UI equivalents, not pixel-for-pixel Aceternity reproduction or compatibility with every upstream prop. ?Data & Visualization? follows the plan's explicit interpretation; a date-picker family is not part of that inventory. Remote screenshots and upload/authentication services remain application integrations.


Follow-up validation: `npm run check` passes 69 tests, TypeScript, and token checks; production build passes. Six targeted browser cases pass across mobile/tablet/laptop, combining the responsive interaction run with the dock/image-loader rerun. The latter scrolls its control into view before focusing, avoiding Radix's intentional dismissal during scrolling. The image overlay was checked in Light/Dark/Sepia and reduced motion. The existing 38-case regression evidence above predates this follow-up; it was not rerun in full for these focused fixes.


### Additional acceptance coverage

Modern Compare now adds an orientation-aware curved divider with local backdrop blur and split-color edging during dragging. Reduced motion suppresses this treatment. Navigation and tooltip transitions read shared duration and spring tokens. Playground options now include timed/controlled steps, looping, image-loader geometry/easing, and custom preview resolvers. Regression tests cover vanish-input IME submission, mocked opt-in Microlink requests, and hydration of simultaneous comparison instances. These focused checks do not establish exhaustive coverage of the original acceptance matrix.

Validation: package/application builds, TypeScript, and token checks passed. The single-worker unit run passed 70/72 tests; two existing table cases timed out under concurrent browser load, and all 12 table tests passed on isolated rerun. All nine targeted browser cases passed across mobile/tablet/laptop. The initial generated-example regression was corrected before these reruns.
