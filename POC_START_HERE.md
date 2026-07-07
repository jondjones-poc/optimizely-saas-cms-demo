# POC Start Here

**Read this first** if you are evaluating this project and are new to React, Next.js, or Optimizely.

The main [README.md](README.md) covers setup and how to add blocks.

---

## Day 1 checklist (~10 minutes)

1. **Install:** `npm install`
2. **Configure env:** `npm run setup` (or copy `.env.example` → `.env.local` manually)
3. **Fill in four values** when prompted:
   - Graph **Single Key** (not App key or Client secret)
   - CMS admin URL
   - Main Website **root node ID** (from `contentdata:///7` in CMS)
   - Main Website **URL path** (e.g. `/en/`)
4. **Run:** `npm run dev`
5. **Homepage:** open [http://localhost:3000](http://localhost:3000) — CMS blocks should render
6. **API check:** open [http://localhost:3000/api/optimizely/homepage](http://localhost:3000/api/optimizely/homepage) — expect `"success": true` and `BlankExperience.items`
7. **CMS link:** use the floating dev menu (bottom-right) → **CMS** — should open Main Website in Optimizely admin

If anything fails, see [Common gotchas](#common-gotchas) below.

---

## Recommended reading order

1. [README.md](README.md) — install, env vars, add a block
2. This file — map of the codebase
3. [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md) — why JSON sometimes looks like `data.data.data`
4. `app/page.tsx` — homepage entry (has comments)
5. `components/CMSContent.tsx` — how blocks appear on screen
6. `components/blocks/BlockRenderer.tsx` — CMS type → React component

---

## How content flows (two page models)

```
BlankExperience (homepage)
  app/page.tsx → /api/optimizely/homepage → Optimizely Graph
  → CMSContent → BlockRenderer → Hero, Heading, FeatureGrid, …

LandingPage / ArticlePage (/about/, /news-page/, …)
  app/[...slug]/page.tsx → /api/optimizely/page → Optimizely Graph
  → LandingPageDisplay (or inline render)

Live preview (/preview?key=…)
  app/preview/page.tsx → fetchPreviewContentFromGraph
  → same renderers as above (by content type)
```

| Route | Optimizely page type | Renderer |
|-------|---------------------|----------|
| `/` | `BlankExperience` at `OPTIMIZELY_HOMEPAGE_URL` | `CMSContent` → `BlockRenderer` |
| `/about/`, etc. | `LandingPage`, `ArticlePage`, … | `LandingPageDisplay` or inline in `[...slug]/page.tsx` |
| `/preview` | Any (by content key) | Same as above depending on type |

---

## Production path vs debug tools

**Learn the production path first.** Ignore debug tools until you understand how `/` loads CMS content.

### Production path (what the customer site uses)

| Step | File / URL |
|------|------------|
| Homepage UI | `app/page.tsx` |
| Fetch CMS data | `app/api/optimizely/homepage/route.ts` |
| Other pages | `app/[...slug]/page.tsx` + `app/api/optimizely/page/route.ts` |
| Render blocks | `components/CMSContent.tsx` → `components/blocks/BlockRenderer.tsx` |
| Live preview | `app/preview/page.tsx` + `lib/optimizely/fetchPreviewContent.ts` |
| Env config | `lib/optimizely/env.ts` + `.env.local` |

### Debug / demo tools (POC only — safe to ignore at first)

| Tool | How to access | Purpose |
|------|---------------|---------|
| **Floating dev menu** | Bottom-right buttons | Links to CMS admin, GraphQL viewer, raw JSON |
| **CMS Data popup** | Dev menu → Data Explorer | Inspect API response |
| **SEO inspector** | Floating button on pages | SEO field demo |
| **Footer data explorer** | Double-click footer | Raw page JSON |
| **GraphQL viewer** | [/graphql-viewer](http://localhost:3000/graphql-viewer) | Browse Graph types and pages |
| **Preview data popup** | Automatic on `/preview` | Preview debugging |

| Component | When it shows | Purpose |
|-----------|---------------|---------|
| `Navigation` | Default branding (no `cms_demo` header) | Top nav bar |
| `CustomHeader` + `CMSMenu` | Custom branding (`cms_demo` header set) | Header image; click opens CMS page menu |

CMS page links in the menu come from `/api/optimizely/pages`.

---

## Common gotchas

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **SDK Key not configured** | Missing or empty `NEXT_PUBLIC_SDK_KEY` | Use Graph **Single Key** only (not App key, Graph secret, or Manage Content API key). Run `npm run setup`. Restart `npm run dev`. |
| **No CMS content found** | Homepage Graph URL mismatch | Set `OPTIMIZELY_HOMEPAGE_URL` to Main Website → **URL** in CMS (often `/en/`, not `/`). |
| **Graph API `success: true` but empty items** | Same as above | Open `/api/optimizely/homepage` — if `BlankExperience.total` is `0`, fix `OPTIMIZELY_HOMEPAGE_URL`. |
| **CMS dev menu link opens wrong page** | Wrong root node ID | Set `NEXT_PUBLIC_OPTIMIZELY_CMS_ROOT_NODE_ID` to the ID in `contentdata:///7` for Main Website. |
| **Confused by `data.data.data`** | Different API response shapes | Read [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md). |
| **Block in CMS but not on site** | Missing code wiring | Follow [Add a new block](#add-a-new-block-recipe) below. |
| **Old env vars in `.env.local`** | Copy-paste from other projects | Remove `OPTIMIZELY_GRAPH_SINGLE_KEY` — app uses `NEXT_PUBLIC_SDK_KEY` only. |

---

## Add a new block (recipe)

Full detail in [README.md → Adding a new block](README.md#adding-a-new-block-optimizely--graph--react) and [components/blocks/README.md](components/blocks/README.md).

### Homepage / BlankExperience blocks

1. **Optimizely CMS** — create a **Block** content type; note the exact **API name** (e.g. `TextBanner`).
2. **Publish** — create a block instance, add it to Main Website in Visual Builder, publish the page.
3. **GraphQL** — add a `... on YourBlock { Field1 Field2 }` fragment in:
   - `app/api/optimizely/homepage/route.ts`
   - `lib/optimizely/fetchPreviewContent.ts` (for live preview)
4. **React** — create `components/blocks/YourBlock.tsx`.
5. **Register** — add `case 'YourBlock':` in `components/blocks/BlockRenderer.tsx`.
6. **Verify** — `/api/optimizely/homepage` shows your fields; refresh `/`.

### LandingPage blocks

Also update `app/api/optimizely/page/route.ts` and `components/LandingPageDisplay.tsx`.

---

## Site routes

| URL | File | Purpose |
|-----|------|---------|
| `/` | `app/page.tsx` | Homepage from Optimizely |
| `/about/`, etc. | `app/[...slug]/page.tsx` | Other CMS pages by URL |
| `/preview?key=...` | `app/preview/page.tsx` | Live preview from Optimizely CMS |

---

## Key files

| Task | File |
|------|------|
| Env vars | `.env.local` — use `npm run setup` |
| Fetch homepage | `app/api/optimizely/homepage/route.ts` |
| Fetch pages by URL | `app/api/optimizely/page/route.ts` |
| Render blocks | `components/CMSContent.tsx` + `components/blocks/*` |
| Landing pages | `components/LandingPageDisplay.tsx` |
| Live preview | `lib/optimizely/fetchPreviewContent.ts` |

API list: [app/api/optimizely/README.md](app/api/optimizely/README.md)

---

## Quick sanity checks

```bash
npm run setup   # first time only
npm run dev
```

| Check | Expected |
|-------|----------|
| Open `/` | Homepage with CMS blocks |
| Open `/api/optimizely/homepage` | `"success": true`, `BlankExperience.items` not empty |
| Dev menu → CMS | Opens Main Website in Optimizely admin |
| Open `/preview` with no params | Error — must open from Optimizely CMS |
