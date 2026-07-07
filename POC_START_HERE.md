# POC Start Here

**Read this first** if you are evaluating this project and are new to React, Next.js, or Optimizely.

The main [README.md](README.md) covers setup and how to add blocks.

---

## Recommended reading order

1. [README.md](README.md) — install and run the site
2. This file — map of the codebase
3. [docs/DATA_SHAPES.md](docs/DATA_SHAPES.md) — why JSON sometimes looks like `data.data.data`
4. `app/page.tsx` — homepage entry (has comments)
5. `components/CMSContent.tsx` — how blocks appear on screen
6. `components/blocks/BlockRenderer.tsx` — CMS type → React component

---

## Site routes

| URL | File | Purpose |
|-----|------|---------|
| `/` | `app/page.tsx` | Homepage from Optimizely |
| `/about/`, etc. | `app/[...slug]/page.tsx` | Other CMS pages by URL |
| `/preview?key=...` | `app/preview/page.tsx` | Live preview from Optimizely CMS |

---

## Two ways pages render

| Route | Optimizely page type | Renderer |
|-------|---------------------|----------|
| `/` | `BlankExperience` | `CMSContent` → `BlockRenderer` |
| `/about/`, etc. | `LandingPage`, `ArticlePage`, … | `LandingPageDisplay` or inline in `[...slug]/page.tsx` |
| `/preview` | Any (by content key) | Same as above depending on type |

---

## Explorer tools (part of the POC demo)

These are **intentional** — use them to inspect CMS data with the customer:

| Tool | How to access |
|------|----------------|
| **CMS Data popup** | Nav bar → "CMS Data" button |
| **SEO inspector** | Floating button (bottom-right on main pages) |
| **Floating dev menu** | Right side menu (theme, JSON, links) |
| **Footer data explorer** | Double-click the footer |
| **GraphQL viewer** | [/graphql-viewer](http://localhost:3000/graphql-viewer) or nav link |
| **Preview data popup** | Shown automatically on `/preview` |

---

| Component | When it shows | Purpose |
|-----------|---------------|---------|
| `Navigation` | Default branding (no `cms_demo` header) | Top nav bar |
| `CustomHeader` + `CMSMenu` | Custom branding (`cms_demo` header set) | Header image; click opens CMS page menu |

CMS page links in the menu come from `/api/optimizely/pages`.

---

## Key files

| Task | File |
|------|------|
| Fetch homepage | `app/api/optimizely/homepage/route.ts` |
| Fetch pages by URL | `app/api/optimizely/page/route.ts` |
| Render blocks | `components/CMSContent.tsx` + `components/blocks/*` |
| Landing pages | `components/LandingPageDisplay.tsx` |
| Live preview | `lib/optimizely/fetchPreviewContent.ts` |

API list: [app/api/optimizely/README.md](app/api/optimizely/README.md)

---

## Quick sanity checks

```bash
npm run dev
```

| Check | Expected |
|-------|----------|
| Open `/` | Homepage with CMS blocks |
| Open `/api/optimizely/homepage` | `"success": true` |
| Open `/preview` with no params | Error — must open from Optimizely CMS |
