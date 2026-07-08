# Content Import (`/import`)

Create new `poc_page_type` pages under the `/poc` parent in Optimizely CMS.

## Setup

Add to `.env.local` (server-only — never `NEXT_PUBLIC_`):

```bash
OPTIMIZELY_CMS_CLIENT_ID=your-client-id
OPTIMIZELY_CMS_CLIENT_SECRET=your-client-secret
OPTIMIZELY_POC_PARENT_CONTENT_KEY=10e451f873fc4b08856fa5ad02f73309
OPTIMIZELY_POC_PAGE_TYPE_KEY=poc_page_type
OPTIMIZELY_CMS_LOCALE=en
```

Restart `npm run dev` after editing `.env.local`.

## CMS API key permissions

The Manage Content API key needs **Create** (and ideally **Publish**) access on the `/poc` parent page:

**Settings → API Keys → your key → Authorization**

## Files

| File | Purpose |
|------|---------|
| `app/import/page.tsx` | Page UI + CMS config display |
| `app/import/components/ImportForm.tsx` | Page name form |
| `app/import/actions.ts` | Server action (create page) |
| `app/import/lib/cmsManagementApi.ts` | OAuth token + CMS REST calls |
| `app/import/lib/env.ts` | Server env helpers |

## API flow

1. `POST https://api.cms.optimizely.com/oauth/token` — client credentials
2. `POST https://api.cms.optimizely.com/v1/content` — create child page
3. `POST .../versions/{id}:publish` — publish (best effort)

Open [http://localhost:3000/import](http://localhost:3000/import).
