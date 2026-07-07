# Deployment Instructions

## Environment Variables

This app loads published CMS content from Optimizely Graph (`https://cg.optimizely.com/content/v2`).

### Required

| Env variable | Where to find it in Optimizely CMS Admin | Notes |
|---|---|---|
| `NEXT_PUBLIC_SDK_KEY` | **Settings → Optimizely Graph → Render Content → Single Key** | GraphQL content API auth. Available on server and client via Next.js `NEXT_PUBLIC_` prefix. |
| `NEXT_PUBLIC_OPTIMIZELY_CMS_URL` | CMS admin URL in browser address bar | Dev menu CMS shortcut links. No trailing slash. |
| `NEXT_PUBLIC_OPTIMIZELY_CMS_ROOT_NODE_ID` | Content tree → Main Website → ID in `contentdata:///` link | Dev menu CMS link target (e.g. `7`). |
| `OPTIMIZELY_HOMEPAGE_URL` | Content tree → Main Website → **URL** path | Homepage Graph query path (e.g. `/en/`). |

Optional: `NEXT_PUBLIC_OPTIMIZELY_CMS_INSTANCE_ID` — builds CMS URL when `NEXT_PUBLIC_OPTIMIZELY_CMS_URL` is omitted.

### Not used by this app

Do **not** deploy these—they are not read anywhere:

| Optimizely CMS Admin setting | Why it is not needed |
|---|---|
| **Render Content → App key** | Different credential type; content fetch uses the Single Key only. |
| **Render Content → Graph secret** | Graph management/auth secret, not content rendering. |
| **Manage Content → API key** (name + ID) | CMS API identity; routes use the Single Key instead. |
| **Manage Content → Client secret** | OAuth for CMS API; preview auth is per-request. |
| **`OPTIMIZELY_GRAPH_SINGLE_KEY`** | Removed — use `NEXT_PUBLIC_SDK_KEY` only (available on server and client in Next.js). |

## Platform setup

Set all four required variables in your deployment platform (Netlify, Vercel, etc.).

For local setup, run:

```bash
npm run setup
```

This writes `.env.local` and optionally tests the Graph connection.

## Build process

The application uses Next.js and should build once all required env variables are set.

Overview diagrams for `/learn` are static PNGs in `public/learn/` and are deployed with the site (no external image host required).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `SDK Key not configured` on homepage | `NEXT_PUBLIC_SDK_KEY` is missing or empty |
| `undefined/content/v2?auth=undefined` | Env vars not set in the deployment environment |
| Content loads in CMS but not on site | Wrong key type used, or `OPTIMIZELY_HOMEPAGE_URL` does not match Main Website URL in CMS |
| CMS dev menu link opens wrong page | `NEXT_PUBLIC_OPTIMIZELY_CMS_ROOT_NODE_ID` does not match Main Website node ID |
| Auth errors from Graph | Single Key copied incorrectly, or Graph sync not complete |
