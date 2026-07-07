# SaaSCMS — Optimizely + Next.js POC

> **New to this repo?** Start with **[POC_START_HERE.md](POC_START_HERE.md)** — a map of what matters, what to ignore, and common confusion points.

A proof-of-concept website that loads its homepage from **Optimizely SaaS CMS** and renders it with **Next.js** and **React**. Content editors work in Optimizely; developers map CMS block types to React components in this repo.

You do not need deep React or Next.js knowledge to run the site or add a simple block. Follow the sections below in order.

---

## Quick start (get the site running)

### What you need

- **Node.js 18+** — [Download Node.js](https://nodejs.org/)
- **An Optimizely SaaS CMS instance** with Graph enabled
- **Your Optimizely Graph Single Key** — found in the Optimizely admin under your CMS / Graph settings

### Step 1: Install

```bash
git clone <your-repo-url>
cd SaaSCMS
npm install
```

### Step 2: Connect to Optimizely

Create a file called `.env.local` in the project root (same folder as `package.json`):

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Graph keys (see **[Environment variables](#environment-variables)** for the full list, where to get each value, and which ones you can remove).

At minimum you need:

```bash
NEXT_PUBLIC_SDK_KEY=your_actual_key_here
OPTIMIZELY_GRAPH_SINGLE_KEY=your_actual_key_here
```

Both variables use the same key. The app checks either one.

### Step 3: Run the site

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You should see the homepage with content from Optimizely. If you see "Loading CMS content..." forever or an error, see [Troubleshooting](#troubleshooting).

### Step 4: Verify the API (optional)

Visit [http://localhost:3000/api/optimizely/homepage](http://localhost:3000/api/optimizely/homepage) in your browser. You should see JSON with `"success": true` and homepage data. If `"success": false`, check your SDK key and that a page exists at URL `/` in Optimizely.

---

## Environment variables

All configuration lives in **`.env.local`** at the project root (same folder as `package.json`). This file is gitignored — never commit secrets.

```bash
cp .env.example .env.local
```

Restart `npm run dev` after any change to `.env.local`.

### Required

| Variable | Where to get it | Why it is needed | Used in |
|----------|-----------------|------------------|---------|
| `NEXT_PUBLIC_SDK_KEY` | Optimizely CMS admin → **Settings** → **Optimizely Graph** → copy the **Single Key** (sometimes labelled SDK key or Graph single key) | Authenticates GraphQL requests to Optimizely Graph. The `NEXT_PUBLIC_` prefix exposes it to the browser, which some client components need (e.g. Menu, Carousel fetching Graph directly). | All `/api/optimizely/*` routes, `lib/optimizely/fetchPreviewContent.ts`, `components/blocks/Menu.tsx`, `components/blocks/Carousel.tsx` |
| `OPTIMIZELY_GRAPH_SINGLE_KEY` | Same Single Key as above — paste the **identical value** | Server-side fallback if `NEXT_PUBLIC_SDK_KEY` is missing. Keeps API routes working when only the server key is set (e.g. some deployment setups). | Same API routes and preview fetch as above |

You only need **one** of these for local dev, but setting **both to the same key** is recommended so server routes and client-side Graph calls both work.

| Variable | Where to get it | Why it is needed | Used in |
|----------|-----------------|------------------|---------|
| `NEXT_PUBLIC_OPTIMIZELY_CMS_URL` | Your CMS login URL, e.g. `https://app-epsajjcmson91rm1p001.cms.optimizely.com` (no trailing slash) | Base URL for CMS admin deep links in the dev floating menu and live preview script. | `components/RightFloatingMenuComponent.tsx`, `app/preview/PreviewClient.tsx` |
| `NEXT_PUBLIC_OPTIMIZELY_CMS_INSTANCE_ID` | The UUID in your CMS URL — the part after `app-` and before `.cms.optimizely.com`, e.g. `epsajjcmson91rm1p001` | Builds CMS/preview URLs when `NEXT_PUBLIC_OPTIMIZELY_CMS_URL` is omitted. Set both for clarity. | `lib/optimizely/env.ts` |

**How to find the Single Key in Optimizely:**

1. Log in to your CMS instance (e.g. `https://app-<instance-id>.cms.optimizely.com`)
2. Open **Settings** in the left menu
3. Go to **Optimizely Graph**
4. Copy the **Single Key** value

### Optional

| Variable | Where to get it | Why it is needed | Used in |
|----------|-----------------|------------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Your site URL — `http://localhost:3000` locally, or your production URL when deployed | When the server fetches its own API to merge menu data into a page, it needs the full base URL. Defaults to `http://localhost:3000` if omitted. | `app/api/optimizely/page/route.ts` |

### Not used by this app — safe to delete

These variables appear in some `.env.local` files (including templates from other Optimizely projects) but **nothing in this codebase reads them**. The Graph endpoint is still hardcoded as `https://cg.optimizely.com/content/v2`.

**To test safely:** rename them with an `OLD_` prefix and move them to a separate section at the bottom of `.env.local`. If the site still works after restarting `npm run dev`, delete that whole section.

| Original name | Status | Notes |
|---------------|--------|-------|
| `OPTIMIZELY_GRAPH_SECRET` | **Unused — delete** | Graph Secret is for server-to-server / management APIs. This POC only uses the public Single Key. |
| `OPTIMIZELY_GRAPH_GATEWAY` | **Unused — delete** | Gateway URL is hardcoded to `https://cg.optimizely.com` in every API route. |
| `OPTIMIZELY_GRAPH_APP_KEY` | **Unused — delete** | App key is not referenced anywhere in this repo. |
| `OPTIMIZELY_DAM_ENABLED` | **Unused — delete** | No DAM integration is implemented in this POC. |
| `OPTIMIZELY_CLIENT_SECRET` | **Unused — delete** | Not referenced in code. If you did need OAuth client credentials, the value should be a secret string — not a CMS URL. |

### Recommended `.env.local` for this POC

```bash
# Required — same Single Key from Optimizely Graph settings
NEXT_PUBLIC_SDK_KEY=your_optimizely_graph_single_key_here
OPTIMIZELY_GRAPH_SINGLE_KEY=your_optimizely_graph_single_key_here

# CMS instance — from your Optimizely login URL
NEXT_PUBLIC_OPTIMIZELY_CMS_URL=https://app-your-instance-id.cms.optimizely.com
NEXT_PUBLIC_OPTIMIZELY_CMS_INSTANCE_ID=your-instance-id

# Optional — only needed if server-side self-fetch fails in production
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Still hardcoded (optional future env vars)

| What | Where | Notes |
|------|-------|-------|
| Graph gateway `cg.optimizely.com` | All API routes, `Menu.tsx`, `Carousel.tsx` | Could use `OPTIMIZELY_GRAPH_GATEWAY` |
| CMS root content ID `6` | `RightFloatingMenuComponent.tsx` CMS deep link | Could use `OPTIMIZELY_CMS_ROOT_CONTENT_ID` |

---

## How the homepage loads (big picture)

When someone opens the homepage, data flows like this:

```
Browser (localhost:3000)
    │
    ▼
app/page.tsx                    ← React page; asks our server for CMS data
    │
    ▼
/api/optimizely/homepage        ← Next.js API route; runs a GraphQL query
    │
    ▼
Optimizely Graph (cg.optimizely.com)   ← Returns page + blocks as JSON
    │
    ▼
components/CMSContent.tsx       ← Walks the page layout (grids → rows → columns → blocks)
    │
    ▼
components/blocks/BlockRenderer.tsx   ← Picks the right React component per block type
    │
    ▼
components/blocks/Hero.tsx, Heading.tsx, etc.   ← Renders HTML on screen
```

**In plain terms:**

1. The **homepage** (`app/page.tsx`) fetches content when the page loads.
2. Our **API route** asks Optimizely Graph for the page at URL `/` (a `BlankExperience` page type).
3. Optimizely returns a **composition**: a nested layout of grids, rows, columns, and **blocks** (Hero, Heading, FeatureGrid, etc.).
4. **CMSContent** loops through that tree and renders each block.
5. **BlockRenderer** looks at each block’s type name (e.g. `"Heading"`) and renders the matching React file.

Comments in the code mirror this flow — start reading at `app/page.tsx`.

> **Why does JSON sometimes look like `data.data.data`?** See [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md).

---

## Other CMS pages (`[...slug]`)

URLs like `/about/` or `/news/my-article/` are handled by `app/[...slug]/page.tsx` — a **catch-all route** that matches any path not already taken by `/` or `/preview`.

1. URL segments become a CMS path (`/about/` → Optimizely URL field)
2. `/api/optimizely/page?path=...` fetches content by URL (different API shape than homepage — see [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md))
3. Page **type** from `_metadata.types[0]` picks the renderer:
   - `LandingPage` → `LandingPageDisplay.tsx` (content areas, not BlockRenderer)
   - `ArticlePage` → article template in `[...slug]/page.tsx`
   - `NewsLandingPage` → `NewsLandingPage.tsx`

The homepage (`/`) is separate because it uses `BlankExperience` + composition layout.

---

## Live preview (edit content in Optimizely, see it on your site)

Live preview lets editors open your Next.js site **inside Optimizely CMS** in an iframe. They see draft/unpublished content and can click blocks to edit them inline.

### How it works (big picture)

```
Optimizely CMS (parent window, editor UI)
    │
    │  Opens iframe →  https://your-site.com/preview?key=...&ver=...&ctx=edit&preview_token=...
    ▼
app/preview/page.tsx              ← Server: fetches draft content by key + version
    │
    ▼
lib/optimizely/fetchPreviewContent.ts   ← GraphQL with preview token (not just SDK key)
    │
    ▼
app/preview/PreviewClient.tsx     ← Client: loads Optimizely script, renders CMSContent
    │
    ▼
components/CMSContent.tsx         ← Same block renderer as homepage, plus data-epi-* attributes
    │
    ▼
Optimizely communicationinjector.js   ← Draws edit overlays; talks to parent CMS window
```

**In plain terms:**

1. An editor clicks **Preview** in Optimizely CMS.
2. Optimizely loads your `/preview` URL with query params: `key`, `ver`, `loc`, `ctx`, `preview_token`.
3. The **server** fetches that specific content version from Graph using the preview token (so drafts work).
4. **PreviewClient** renders the page with `isPreview={true}` and `contextMode="edit"`.
5. **CMSContent** adds `data-epi-block-id` on each block so Optimizely knows where to draw click-to-edit overlays.
6. Individual block components add `data-epi-edit="FieldName"` on editable fields.
7. When the editor saves, Optimizely fires `optimizely:cms:contentSaved` and the page refreshes to show updates.

### Configure preview in Optimizely

1. In Optimizely CMS go to **Settings → Applications** (or your app / frontend host config).
2. Set the **preview URL** to point at this app, for example:
   ```
   https://localhost:3000/preview?key={contentKey}&ver={version}&loc={locale}&ctx=edit&preview_token={previewToken}
   ```
   Use the placeholders Optimizely provides for your instance (names may vary slightly).
3. Run your site (`npm run dev`) and open preview **from inside the CMS** — do not visit `/preview` directly without params.

### URL parameters

| Parameter | Purpose |
|-----------|---------|
| `key` | Content item GUID — which page/block to preview (required) |
| `ver` | Version number — required for draft preview |
| `loc` | Locale (e.g. `en`) |
| `ctx` | `edit` = inline editing overlays; `view` = read-only preview |
| `preview_token` | Auth token so Graph returns unpublished content |

### Key files for preview

| File | Role |
|------|------|
| `app/preview/page.tsx` | Server entry — reads URL params, fetches content, passes to client |
| `app/preview/PreviewClient.tsx` | Loads Optimizely script, handles save/refresh, renders page |
| `lib/optimizely/fetchPreviewContent.ts` | GraphQL query by key + version (with preview token) |
| `app/api/optimizely/preview-content/route.ts` | API fallback for client-side refetch after save |
| `components/CMSContent.tsx` | Adds `data-epi-block-id` when `contextMode === 'edit'` |
| `components/blocks/*.tsx` | Add `data-epi-edit="FieldName"` on editable elements |

### Inline editing attributes

Optimizely matches CMS fields to DOM elements using these HTML attributes:

- **`data-epi-block-id`** — on the wrapper for each block (set in `CMSContent.tsx`)
- **`data-epi-edit="FieldName"`** — on the element for a specific CMS property (e.g. `Heading`, `HeadingSize`)

The field name must match the property API name in Optimizely exactly.

### Preview vs homepage

| | Homepage (`/`) | Live preview (`/preview`) |
|--|----------------|---------------------------|
| Content source | Published page at URL `/` | Specific item by `key` + `ver` |
| Auth | SDK key only | SDK key + `preview_token` for drafts |
| Optimizely script | Not loaded | `communicationinjector.js` loaded |
| Edit overlays | No | Yes, when `ctx=edit` |
| Same block components? | Yes | Yes — `CMSContent` + `BlockRenderer` |

---

## Adding a new block: Optimizely → Graph → React

This is the full workflow when you want a new content type on the site.

### Part A — Create the content type in Optimizely CMS

1. Log in to **Optimizely SaaS CMS** admin.
2. Go to **Settings → Content types** (or **Content model**).
3. Create a new **Block** type (not a page), e.g. `"TextBanner"`.
4. Add properties editors will fill in, e.g.:
   - `Title` — Text
   - `Body` — Rich text / XHTML
5. Save the content type. Note the **API name** exactly (e.g. `TextBanner`) — it must match in code.

### Part B — Publish to Graph

Content must be **published** and **available in Optimizely Graph** before the website can read it.

1. Create a block instance: **Content → Create → your new block type**, fill in fields, **Publish**.
2. Add the block to your homepage composition in the **Visual Builder** (or equivalent experience editor).
3. Publish the **page** (`BlankExperience` at URL `/`).
4. Confirm Graph sync by calling `/api/optimizely/homepage` and checking your block appears in the response.

If the new type does not appear, wait a few minutes for Graph indexing or check Optimizely’s Graph / publish settings.

### Part C — Tell the API to fetch your block’s fields

Edit **`app/api/optimizely/homepage/route.ts`**.

Inside the GraphQL query, find the `component { ... }` section where other blocks are listed (Hero, Heading, etc.). Add a fragment for your block:

```graphql
... on TextBanner {
  Title
  Body {
    html
  }
}
```

The name after `... on` must match the Optimizely content type API name.

Restart `npm run dev` after changing this file.

### Part D — Build the React component

1. Create **`components/blocks/TextBanner.tsx`**:

```tsx
'use client'

interface TextBannerProps {
  Title?: string
  Body?: { html?: string }
}

export default function TextBanner({ Title, Body }: TextBannerProps) {
  if (!Title) return null

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold">{Title}</h2>
        {Body?.html && (
          <div dangerouslySetInnerHTML={{ __html: Body.html }} />
        )}
      </div>
    </section>
  )
}
```

2. Register it in **`components/blocks/BlockRenderer.tsx`**:

```tsx
import TextBanner from './TextBanner'

// Inside the switch (blockType):
case 'TextBanner':
  return <TextBanner {...component} />
```

The `case` string must match the Optimizely type name (`TextBanner`).

3. Refresh the homepage — your block should render where you placed it in the CMS.

### Checklist

| Step | Where | Must match |
|------|--------|------------|
| Content type API name | Optimizely admin | Graph `... on TypeName` |
| Block type in switch | `BlockRenderer.tsx` | Same `TypeName` |
| GraphQL fields | `homepage/route.ts` | Property names from CMS |

**Landing pages:** If the block is on a `LandingPage` (not the homepage), also edit `app/api/optimizely/page/route.ts` and `LandingPageDisplay.tsx`. See [components/blocks/README.md](components/blocks/README.md).

---

## Code structure

```
SaaSCMS/
├── app/
│   ├── layout.tsx                  # Root shell — wraps ALL pages; theme + branding providers
│   ├── page.tsx                    # Homepage — fetches CMS data, renders layout shell
│   ├── [...slug]/page.tsx          # Other CMS pages by URL path
│   ├── preview/
│   │   ├── page.tsx                # Live preview server entry (Optimizely iframe)
│   │   └── PreviewClient.tsx       # Live preview client — script, overlays, save refresh
│   └── api/optimizely/
│       ├── homepage/route.ts       # ★ GraphQL query for homepage (start here for new blocks)
│       ├── page/route.ts           # GraphQL for pages by URL
│       ├── menu/route.ts           # CMS menu items
│       ├── pages/route.ts          # Page list for CMSMenu
│       └── preview-content/route.ts
│
├── components/
│   ├── CMSContent.tsx              # ★ Renders page composition (grid → row → column → block)
│   ├── CMSMenu.tsx                 # CMS page menu (custom branding sites)
│   ├── CustomHeader.tsx            # Branding header + CMS menu trigger
│   ├── CustomFooter.tsx            # Site footer
│   ├── Navigation.tsx              # Top nav (default branding)
│   ├── LandingPageDisplay.tsx      # Landing page renderer
│   └── blocks/
│       ├── BlockRenderer.tsx       # ★ Maps CMS block type → React component
│       └── ...
│
├── lib/optimizely/
│   └── fetchPreviewContent.ts      # Preview / draft content from Graph
│
├── contexts/                       # Theme + branding
└── .env.local                      # SDK key (not in git)
```

**Files to know for the homepage POC:**

| File | Role |
|------|------|
| `app/page.tsx` | Entry point; loads data and assembles header + CMS body + footer |
| `app/api/optimizely/homepage/route.ts` | Server-side GraphQL — defines which fields we request from Optimizely |
| `components/CMSContent.tsx` | Turns JSON composition into HTML structure |
| `components/blocks/BlockRenderer.tsx` | `"Hero"` → `<Hero />`, `"Heading"` → `<Heading />`, etc. |
| `components/blocks/*.tsx` | Presentation — how each block looks on the page |

**Useful URLs:**

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/graphql-viewer` | Inspect Graph queries and content types |
| `/preview?key=...` | Live preview (open from Optimizely CMS) |
| `/api/optimizely/homepage` | Raw homepage JSON |

**Explorer tools (for POC demos):** CMS Data nav button, SEO floating button, right-side dev menu, footer double-click explorer, [/graphql-viewer](/graphql-viewer).

**More docs:** [POC_START_HERE.md](POC_START_HERE.md) · [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md) · [docs/LEGACY_AND_CLEANUP.md](docs/LEGACY_AND_CLEANUP.md) · [app/api/optimizely/README.md](app/api/optimizely/README.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [OVERLAY_TROUBLESHOOTING.md](OVERLAY_TROUBLESHOOTING.md)

---

## Supported block types (homepage)

These CMS types already have React components:

- `Hero`, `Heading`, `Divider`, `ContentBlock`
- `FeatureGrid`, `CallToAction` / `CallToActionOutput`, `PromoBlock`
- `Image`, `Carousel`, `Menu`, `demo_block`

If Optimizely returns a type not in `BlockRenderer`, that block is skipped (check the browser console for warnings).

---

## Build for production

```bash
npm run build
npm start
```

Set the same environment variables on your host (Netlify, Vercel, etc.).

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| "SDK Key not configured" | `.env.local` exists with `NEXT_PUBLIC_SDK_KEY` or `OPTIMIZELY_GRAPH_SINGLE_KEY`. Restart `npm run dev` after creating/editing `.env.local`. |
| "No CMS content found" | A `BlankExperience` page is published at URL `/` in Optimizely. Open `/api/optimizely/homepage` and look for `BlankExperience.items`. |
| Block missing on page | Type added to GraphQL in `homepage/route.ts` **and** `case` in `BlockRenderer.tsx`. Block added to page composition in CMS. |
| GraphQL errors in API response | Field name typo in query, or content type name wrong. Check the API JSON response for `details`. |
| Old content after CMS publish | Hard refresh (Cmd+Shift+R). API uses `cache: 'no-store'` but browser may cache. |
| Confused by file names or JSON shape | Read [POC_START_HERE.md](POC_START_HERE.md) and [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md) |

---

## Tech stack

- **Next.js 14** (App Router) — React framework with API routes
- **TypeScript** — typed JavaScript
- **Tailwind CSS** — styling
- **Optimizely Graph** — headless CMS content API (GraphQL)
- **Framer Motion** — animations on some blocks

---

## License

MIT License — see [LICENSE](LICENSE).
