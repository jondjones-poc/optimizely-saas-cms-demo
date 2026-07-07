# SaaSCMS - Next.js Website

A modern, responsive website built with Next.js 14, TypeScript, and Tailwind CSS, inspired by the Phamily Pharma design.

## Features

- 🚀 **Next.js 14** with App Router
- 💎 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- ✨ **Framer Motion** for smooth animations
- 📱 **Responsive Design** for all devices
- 🎯 **Scroll Animations** for enhanced UX
- 🖼️ **Dummy Images** from Unsplash
- 🌙 **Dynamic Theme Switching** based on HTTP headers
- 🎨 **Dark Theme Support** for clientId=test
- 🏗️ **Optimizely CMS Integration** with GraphQL
- 📊 **GraphQL Viewer** for content inspection
- 🎯 **Dynamic Content Rendering** from CMS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SaaSCMS
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in `.env.local` from Optimizely CMS admin:

| Env variable | Optimizely CMS Admin path | Example |
|---|---|---|
| `NEXT_PUBLIC_SDK_KEY` | Settings → Optimizely Graph → Render Content → **Single Key** | `KH1AIT5MfN2n...` |
| `NEXT_PUBLIC_OPTIMIZELY_CMS_URL` | Browser address bar when logged into CMS admin | `https://app-joma01saas0yi0ct001.cms.optimizely.com` |
| `NEXT_PUBLIC_OPTIMIZELY_CMS_ROOT_NODE_ID` | Content tree → **Main Website** → ID in CMS link | `7` (from `contentdata:///7`) |
| `OPTIMIZELY_HOMEPAGE_URL` | Content tree → **Main Website** → **URL** field | `/en/` |

This app calls `https://cg.optimizely.com/content/v2?auth=<Single Key>` to load content.

**Do not add these to `.env.local`** (not read by this app):

| Optimizely CMS Admin path | UI label |
|---|---|
| Settings → Optimizely Graph → Render Content | **App key**, **Graph secret** |
| Settings → Optimizely Graph → Manage Content | **API key**, **Client secret** |

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
SaaSCMS/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/
│   ├── Navigation.tsx       # Navigation bar
│   ├── HeroSection.tsx      # Hero section
│   ├── MissionSection.tsx   # Mission cards
│   ├── SolutionSection.tsx  # Solution steps
│   ├── CommunitySection.tsx # Articles & community
│   ├── TeamSection.tsx      # Team members
│   └── Footer.tsx           # Footer
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Design System

### Colors
- **Primary Blue**: `#1e40af`
- **Light Blue**: `#3b82f6`
- **Orange**: `#f97316`
- **Dark Gray**: `#374151`
- **Light Gray**: `#f3f4f6`

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

## Components

### Navigation
- Fixed navigation with scroll effects
- Mobile-responsive hamburger menu
- Smooth scroll to sections

### Hero Section
- Gradient background with floating animations
- Call-to-action buttons
- Scroll indicator

### Mission Section
- Three-column card layout
- Icon-based design
- Hover animations

### Solution Section
- Numbered steps with alternating layout
- Progressive reveal animations
- Call-to-action buttons

### Community Section
- Article grid with images
- Category filters
- Newsletter signup

### Team Section
- Advisor cards with photos
- Regional coverage indicators
- Contact information

### Footer
- Newsletter subscription
- Footer links
- Contact information

## Animations

The website uses Framer Motion for:
- Scroll-triggered animations
- Page load animations
- Hover effects
- Smooth transitions

## Customization

### Colors
Update colors in `tailwind.config.js` under the `phamily` color palette.

### Content
Replace Lorem ipsum text in components with your actual content.

### Images
Replace Unsplash placeholder images with your own images.

## Build for Production

```bash
npm run build
npm start
```

## Theme System

### Dynamic Theme Switching

The website supports dynamic theme switching based on HTTP headers, similar to the [Optimizely Fullstack Demo](https://github.com/jondjones-poc/optimizely-fullstack-demo):

- **Default Theme**: Original Phamily Pharma colors (blue, orange, light gray)
- **Dark Theme**: Black theme activated when `clientId=test` header is present

### How to Test Theme Switching

1. **Using Browser Developer Tools**:
   - Open Developer Tools (F12)
   - Go to Network tab
   - Add custom header `clientId: test` to requests

2. **Using cURL**:
   ```bash
   # Test with dark theme
   curl -H "clientId: test" http://localhost:3001/api/check-client-id
   
   # Test with default theme
   curl http://localhost:3001/api/check-client-id
   ```

3. **Using Browser Extension**:
   - Install "ModHeader" extension
   - Add header: `clientId: test`
   - Refresh the page

4. **Manual Testing**:
   - Use the theme test component in the top-right corner
   - Toggle between Default and Dark themes

### Theme Context

The theme system uses React Context to manage theme state across components:

```typescript
const { theme, setTheme } = useTheme()
```

### API Endpoint

The `/api/check-client-id` endpoint checks for the `clientId` header and returns the appropriate theme:

```json
{
  "clientId": "test",
  "theme": "dark"
}
```

## Optimizely CMS Integration

This website integrates with Optimizely SaaS CMS to fetch and display dynamic content.

### Features

- **Homepage Content**: Dynamically pulls content from Optimizely CMS
- **GraphQL API**: Uses Optimizely Graph for content delivery
- **Block Rendering**: Supports Hero and Text blocks from CMS
- **Content Viewer**: Built-in GraphQL viewer at `/graphql-viewer`

### Environment Variables

Create a `.env.local` from `.env.example`. Four variables are required — see the table in [Getting Started](#getting-started) and [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Optimizely CMS Admin mapping.

### API Endpoints

- `/api/optimizely/homepage` - Fetches homepage content
- `/api/optimizely/block` - Fetches individual block content
- `/api/optimizely/page-types` - Lists available page types
- `/api/optimizely/blocks` - Lists available block types
- `/api/optimizely/page-instances` - Lists actual page instances

### GraphQL Viewer

Visit `/graphql-viewer` to:
- Inspect all page types and block types
- View GraphQL queries for content types
- Browse actual page instances with full content
- Copy GraphQL queries for development

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS with dark mode support
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **React Context** - Theme state management
- **Optimizely Graph** - Headless CMS integration
- **GraphQL** - Content query language

## License

This project is open source and available under the [MIT License](LICENSE).
