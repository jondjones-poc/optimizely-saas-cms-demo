# CMS block components

Each file maps to an **Optimizely block content type**. `BlockRenderer.tsx` picks the matching component.

## Used by

- Homepage (`/`) via `CMSContent` → `BlockRenderer`
- Live preview (`/preview`)
- Landing pages partially via `LandingPageDisplay.tsx`

## Adding a new block (homepage / BlankExperience)

1. Add GraphQL fields in `app/api/optimizely/homepage/route.ts`
2. Add to `lib/optimizely/fetchPreviewContent.ts` (for preview)
3. Create `YourBlock.tsx` in this folder
4. Register in `BlockRenderer.tsx`

For **LandingPage** blocks, also edit `app/api/optimizely/page/route.ts` and `LandingPageDisplay.tsx`.
