# CMS data shapes — why `data.data.data`?

When debugging API responses, the JSON shape depends on **which endpoint** you called.

---

## Homepage API (`/api/optimizely/homepage`)

```json
{
  "success": true,
  "data": {
    "data": {
      "BlankExperience": {
        "items": [ { "...page and composition..." } ]
      }
    }
  }
}
```

`CMSContent.tsx` reads: **`data.data.data.BlankExperience.items[0]`**

---

## Page API (`/api/optimizely/page?path=/about/`)

```json
{
  "success": true,
  "data": {
    "_metadata": { "types": ["LandingPage"], "url": { "default": "/about/" } },
    "TopContentArea": [ "..." ],
    "MainContentArea": [ "..." ]
  }
}
```

`app/[...slug]/page.tsx` reads: **`result.data`** (flat page object)

---

## Preview

`PreviewClient` wraps preview content to match the homepage shape before passing to `CMSContent`.
