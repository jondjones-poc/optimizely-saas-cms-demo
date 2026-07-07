# Optimizely API routes

Server-side routes under `app/api/optimizely/`.

Homepage URL is configured via **`OPTIMIZELY_HOMEPAGE_URL`** in `.env.local` (e.g. `/en/`), not hardcoded to `/`.

## Production / site

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/optimizely/homepage` | GET | Homepage (`BlankExperience` at `OPTIMIZELY_HOMEPAGE_URL`) |
| `/api/optimizely/page?path=/about/` | GET | CMS page by URL |
| `/api/optimizely/preview-content` | POST | Draft content for live preview |
| `/api/optimizely/menu` | GET | Menu items from Settings |
| `/api/optimizely/pages` | GET | Page list (CMSMenu + graphql-viewer) |
| `/api/optimizely/news-articles` | GET | Articles for NewsLandingPage |

## Explorer / POC tools

| Route | Purpose |
|-------|---------|
| `/api/optimizely/blocks` | Block types in Graph (graphql-viewer) |
| `/api/optimizely/page-types` | Page types in Graph (graphql-viewer) |
| `/api/optimizely/page-instances` | Page instances (graphql-viewer) |
| `/api/check-client-id` | Theme demo via `clientId` header |

See [docs/DATA_SHAPES.md](../../../docs/DATA_SHAPES.md) for homepage vs page JSON differences.

See [POC_START_HERE.md](../../../POC_START_HERE.md) for production path vs debug tools.
