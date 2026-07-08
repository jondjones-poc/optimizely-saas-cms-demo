/**
 * SHARED GRAPHQL BLOCK FRAGMENTS — single place to define CMS block fields.
 *
 * When you add a new block type:
 *   1. Add a `... on YourBlock { ... }` fragment below (composition and/or landing page)
 *   2. Create components/blocks/YourBlock.tsx
 *   3. Register case 'YourBlock' in BlockRenderer.tsx
 *
 * Used by:
 *   - app/api/optimizely/homepage/route.ts
 *   - lib/optimizely/fetchPreviewContent.ts
 *   - app/api/optimizely/page/route.ts
 *
 * See components/blocks/_examples/SimpleBlock.example.tsx for a minimal React template.
 */

/** Blocks inside BlankExperience composition (homepage + live preview) */
export const compositionBlockFields = `
  ... on demo_block {
    _metadata {
      key
    }
    ImageNumber
    MarginTopAndBottom
  }
  ... on Hero {
    Heading
    SubHeading
    Body {
      html
      json
    }
    Image {
      key
      url {
        base
        default
      }
    }
    Links {
      target
      text
      title
      url {
        type
        default
        hierarchical
        internal
        graph
        base
      }
    }
  }
  ... on FeatureGrid {
    _metadata {
      key
    }
    Heading
    SubHeading
    Cards {
      key
      url {
        base
        default
        graph
        hierarchical
        internal
        type
      }
    }
  }
  ... on CallToActionOutput {
    _metadata {
      key
    }
    Header
    Links {
      target
      text
      title
      url {
        base
        default
      }
    }
  }
  ... on PromoBlock {
    _metadata {
      key
    }
    BackgroundStyle
    CTA {
      base
      default
    }
    CTAColour
    Description {
      html
    }
    Image {
      base
      default
    }
    Title
  }
  ... on Image {
    AltText
    Image {
      url {
        base
        default
        graph
      }
    }
  }
  ... on ContentBlock {
    _metadata {
      key
    }
    Content {
      html
    }
    Position
  }
  ... on Heading {
    _metadata {
      key
    }
    Heading
    HeadingSize
    Alignment
  }
  ... on Divider {
    _metadata {
      key
    }
    DividerSize
  }
  ... on Menu {
    _metadata {
      key
      displayName
    }
  }
  ... on Carousel {
    Cards {
      key
      url {
        base
        default
        hierarchical
        internal
      }
    }
  }
`

/** LandingPage TopContentArea blocks */
export const landingPageTopContentFields = `
  ... on Hero {
    _metadata {
      key
      displayName
      types
    }
    Heading
    SubHeading
    Body {
      html
    }
    Image {
      key
      url {
        base
        default
      }
    }
    Links {
      target
      text
      title
      url {
        base
        default
      }
    }
    Video {
      key
      url {
        base
        default
      }
    }
  }
  ... on Carousel {
    Cards {
      key
      url {
        base
        default
        hierarchical
        internal
      }
    }
  }
`

/** LandingPage MainContentArea blocks */
export const landingPageMainContentFields = `
  ... on ContentBlock {
    Content {
      html
    }
    Position
  }
  ... on Heading {
    Heading
    HeadingSize
    Alignment
  }
  ... on Divider {
    _metadata {
      key
    }
    DividerSize
  }
  ... on Image {
    AltText
    Image {
      url {
        base
        default
        graph
      }
    }
  }
  ... on Menu {
    _metadata {
      key
      displayName
    }
  }
`

/** LandingPage SEO fields (preview + page API) */
export const landingPageSeoFields = `
  SeoSettings {
    DisplayInMenu
    GraphType
    Indexing
    MetaDescription
    MetaTitle
  }
`

/** ArticlePage fields */
export const articlePageFields = `
  ... on ArticlePage {
    Heading
    SubHeading
    Author
    Body {
      html
    }
  }
`

/** NewsLandingPage fields */
export const newsLandingPageFields = `
  ... on NewsLandingPage {
    Title
  }
`

/** POC page type fields (beginner /poc and /import child pages) */
export const pocPageTypeFields = `
  ... on poc_page_type {
    Title
    Heading {
      _metadata {
        key
        displayName
        types
      }
      ... on Heading {
        Heading
        HeadingSize
        Alignment
      }
    }
  }
`
