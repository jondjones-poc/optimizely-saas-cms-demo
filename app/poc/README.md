# Beginner POC (`/poc`)

**Start here** if the full demo site feels too complex.

## What is this?

A single page at **http://localhost:3000/poc** with two ideas:

1. **Title from CMS** — reads the `Title` property from your **POC page** (`poc_page_type`) at `/poc/` in Optimizely
2. **Heading blocks** — renders blocks from the `Heading` content area via `BlockRenderer`
3. **Stock price** — Next.js fetches data from a public API (`app/poc/components/StockTicker.tsx`)

## CMS setup

1. Create a **POC page** in Optimizely CMS (content type `poc_page_type`).
2. Set the page **URL** to **`/poc/`**.
3. Fill in the **Title** property, add **Heading** blocks to the Heading content area, and **Publish**.

## Files

| File | Purpose |
|------|---------|
| `app/poc/page.tsx` | Fetches CMS data, renders Title + blocks |
| `app/poc/lib/fetchPocCmsPage.ts` | GraphQL fetch for poc_page_type at `/poc/` |
| `app/poc/components/BlockRenderer.tsx` | Maps block types to POC components |
| `app/poc/components/Heading.tsx` | Renders Heading block text |
| `app/poc/components/StockTicker.tsx` | Stock API |

## Run it

```bash
npm run setup
npm run dev
```

Open [http://localhost:3000/poc](http://localhost:3000/poc).

## If Step 1 fails

- Confirm a **POC page** exists at URL **`/poc/`** and is published
- Check `NEXT_PUBLIC_SDK_KEY` in `.env.local`
- The GraphQL query expects `Title` and a `Heading` content area on `poc_page_type`

## Next steps

- [Demo Site Overview](/learn)
- [/](/) — full demo site
