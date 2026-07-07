# Legacy code and cleanup

## Removed (unused — safe to stay deleted)

These had **zero imports / zero callers** and were not user-facing features:

- `services/optimizely.ts` — legacy Graph client, superseded by API routes
- `components/HeroSection.tsx`, `BrandingTest.tsx` — never wired up
- `components/CustomHeaderServer.tsx`, `CustomFooterServer.tsx` — never imported
- `utils/landingPageDataExtractor.ts` — duplicate of seo helpers, never imported
- `components/blocks/index.ts` — unused barrel file
- `app/api/optimizely/homepage-complete`, `menu-debug`, `test-page`, `check-cms-demo`, `introspect`, `block`, `card`, `cards`, `feature-card` — debug-only APIs with no UI
- `app/components/page.tsx`, `app/block-examples/page.tsx` — static demo routes (not the CMS site)
- Demo-only sections: `MissionSection`, `SolutionSection`, `CommunitySection`, `TeamSection`, static `Carousel.tsx`

## Restored (POC features — do not delete)

These were briefly removed by mistake during a “simplify” pass and are **back in the repo**:

- `/graphql-viewer` + `GraphQLQueryViewer`, `PageTypesList`
- Nav **CMS Data** modal, `SEOButton`, `RightFloatingMenuComponent`
- Footer **DataExplorer** (double-click)
- Preview **`OptimizelyDataPopup`**
- Supporting APIs: `blocks`, `page-types`, `page-instances`, `check-client-id`
- `services/homepage.ts`, `utils/seoDataExtractor.ts`, `utils/seoDataTransformers.ts`

## Optional future refactors

- Merge `CustomHeader` / `CustomHeaderClient`
- Shared GraphQL block fragments (one file for homepage + page + preview)
- `normalizeHomepageResponse()` to replace `data.data.data`
- Remove dead `LandingPage()` wireframe function inside `[...slug]/page.tsx` (~400 lines, never called)
