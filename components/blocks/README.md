# CMS block components

Each file maps to an **Optimizely block content type**. `BlockRenderer.tsx` picks the matching component.

## Used by

- Homepage (`/`) via `CMSContent` → `BlockRenderer`
- Live preview (`/preview`)
- Landing pages partially via `LandingPageDisplay.tsx`

---

## Add a new block — full recipe

### 1. Create the block in Optimizely CMS

1. Log in to CMS admin → **Settings → Content types**.
2. Create a new **Block** (not a page), e.g. `TextBanner`.
3. Add properties (Text, Rich text, etc.).
4. Save — note the exact **API name** (must match code).

### 2. Publish content

1. Create a block instance under **Content**.
2. Open **Main Website** → add the block in Visual Builder.
3. **Publish** the page.
4. Confirm Graph sync: open `/api/optimizely/homepage` and search for your block fields in the JSON.

### 3. Add GraphQL fields (two files)

Add a fragment inside the `component { ... }` section:

**`app/api/optimizely/homepage/route.ts`**

```graphql
... on TextBanner {
  Title
  Body { html }
}
```

**`lib/optimizely/fetchPreviewContent.ts`** — add the same fragment (required for live preview).

The type name after `... on` must match the Optimizely API name exactly.

### 4. Create the React component

Create `components/blocks/TextBanner.tsx`. Copy an existing block (e.g. `Heading.tsx`) as a template.

For live preview overlays, add `data-epi-block-id` and `data-epi-edit="FieldName"` attributes matching Optimizely property names.

### 5. Register in BlockRenderer

In `components/blocks/BlockRenderer.tsx`:

```tsx
case 'TextBanner':
  return <TextBanner {...component} isPreview={isPreview} contextMode={contextMode} />
```

### 6. Verify

| Check | Expected |
|-------|----------|
| `/api/optimizely/homepage` | Your block fields appear in JSON |
| `/` | Block renders on homepage |
| `/preview` (from CMS) | Block renders in preview mode |

---

## LandingPage blocks

Homepage blocks use the recipe above. For **LandingPage** content areas, also edit:

- `app/api/optimizely/page/route.ts` — GraphQL query
- `components/LandingPageDisplay.tsx` — render logic

---

## Quick reference (homepage only)

1. GraphQL in `homepage/route.ts` + `fetchPreviewContent.ts`
2. `components/blocks/YourBlock.tsx`
3. `case` in `BlockRenderer.tsx`

See also [README.md → Adding a new block](../../README.md#adding-a-new-block-optimizely--graph--react) and [POC_START_HERE.md](../../POC_START_HERE.md).
