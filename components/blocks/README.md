# CMS block components

Each file maps to an **Optimizely block content type**. `BlockRenderer.tsx` picks the matching component.

## Used by

- Homepage (`/`) via `CMSContent` → `BlockRenderer`
- Live preview (`/preview`)
- Landing pages partially via `LandingPageDisplay.tsx`

**New to blocks?** Copy from [`_examples/SimpleBlock.example.tsx`](_examples/SimpleBlock.example.tsx) or read the [Demo Site Overview](/learn).

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

### 3. Add GraphQL fields (one file)

Add a fragment in **`lib/optimizely/graphql/blockFragments.ts`**:

- Homepage / BlankExperience blocks → `compositionBlockFields`
- LandingPage top area → `landingPageTopContentFields`
- LandingPage main area → `landingPageMainContentFields`

```graphql
... on TextBanner {
  Title
  Body { html }
}
```

The type name after `... on` must match the Optimizely API name exactly. Homepage, preview, and page APIs all import from this file — no copy-paste across routes.

### 4. Create the React component

Create `components/blocks/TextBanner.tsx`. Start from [`_examples/SimpleBlock.example.tsx`](_examples/SimpleBlock.example.tsx) or copy `Heading.tsx`.

For live preview overlays, add `data-epi-edit="FieldName"` attributes matching Optimizely property names (`data-epi-block-id` is set in `CMSContent.tsx`).

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

Add fragments to `landingPageTopContentFields` or `landingPageMainContentFields` in `blockFragments.ts`, then update `components/LandingPageDisplay.tsx` for render logic.

---

## Quick reference (homepage only)

1. GraphQL in `lib/optimizely/graphql/blockFragments.ts`
2. `components/blocks/YourBlock.tsx` (template: `_examples/SimpleBlock.example.tsx`)
3. `case` in `BlockRenderer.tsx`

See also [README.md → Adding a new block](../../README.md#adding-a-new-block-optimizely--graph--react), [POC_START_HERE.md](../../POC_START_HERE.md), and [/learn](../../app/learn/page.tsx) (dev tour).
