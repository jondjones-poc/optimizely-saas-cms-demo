/** Component tree metadata for the Landing Page "NextJS Components" explorer view. */

export type DisplayMode = 'wireframe' | 'html' | 'components'

export interface ComponentTreeNode {
  id: string
  label: string
  path: string
  description?: string
  subComponents: string[]
}

export const BLOCK_COMPONENT_PATHS: Record<string, string> = {
  Hero: 'components/blocks/Hero.tsx',
  Carousel: 'components/blocks/Carousel.tsx',
  ContentBlock: 'components/blocks/ContentBlock.tsx',
  Image: 'components/blocks/Image.tsx',
  Menu: 'components/blocks/Menu.tsx',
  Heading: 'components/blocks/Heading.tsx',
  Divider: 'components/blocks/Divider.tsx',
  FeatureGrid: 'components/blocks/FeatureGrid.tsx',
  CallToAction: 'components/blocks/CallToAction.tsx',
  CallToActionOutput: 'components/blocks/CallToAction.tsx',
  PromoBlock: 'components/blocks/PromoBlock.tsx',
  demo_block: 'components/blocks/DemoBlock.tsx',
}

/** Sub-components and libraries used inside each CMS block component. */
export const BLOCK_SUB_COMPONENTS: Record<string, string[]> = {
  Hero: ['next/image', 'framer-motion', 'lucide-react (ArrowRight, Play)', 'contexts/ThemeContext'],
  Carousel: ['framer-motion (motion, AnimatePresence)', 'lucide-react (ChevronLeft, ChevronRight)', 'contexts/ThemeContext'],
  ContentBlock: ['contexts/ThemeContext'],
  Image: ['framer-motion'],
  Menu: ['next/link'],
  Heading: ['contexts/ThemeContext'],
  Divider: [],
  FeatureGrid: ['components/blocks/FeatureCard.tsx', 'framer-motion', 'contexts/ThemeContext'],
  CallToAction: ['next/link', 'lucide-react (ArrowRight)', 'contexts/ThemeContext'],
  CallToActionOutput: ['next/link', 'lucide-react (ArrowRight)', 'contexts/ThemeContext'],
  PromoBlock: ['framer-motion', 'contexts/ThemeContext'],
  demo_block: ['next/image', 'contexts/ThemeContext', 'contexts/BrandingContext'],
}

export const APP_LAYOUT_NODES: ComponentTreeNode[] = [
  {
    id: 'layout',
    label: 'RootLayout',
    path: 'app/layout.tsx',
    description: 'Root HTML shell — loads global CSS and wraps every route in shared providers.',
    subComponents: ['contexts/BrandingContext.tsx', 'contexts/ThemeContext.tsx', 'app/globals.css'],
  },
  {
    id: 'slug-page',
    label: 'DynamicPage',
    path: 'app/[...slug]/page.tsx',
    description: 'Client route for CMS pages. Fetches /api/optimizely/page and picks a renderer from _metadata.types.',
    subComponents: ['utils/seoDataTransformers.ts'],
  },
]

export const PAGE_SHELL_NODES: ComponentTreeNode[] = [
  {
    id: 'custom-header',
    label: 'CustomHeader',
    path: 'components/CustomHeader.tsx',
    description: 'Branded header image + CMS menu. Hidden when no custom branding is active.',
    subComponents: ['components/CMSMenu.tsx', 'contexts/BrandingContext', 'next/navigation (usePathname)'],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    path: 'components/Navigation.tsx',
    description: 'Default site nav bar and CMS Data modal. Hidden when custom branding is active.',
    subComponents: ['contexts/ThemeContext', 'contexts/BrandingContext', 'services/homepage.ts', 'framer-motion', 'lucide-react'],
  },
  {
    id: 'custom-footer',
    label: 'CustomFooter',
    path: 'components/CustomFooter.tsx',
    description: 'Branded footer image. Double-click opens DataExplorer.',
    subComponents: ['components/DataExplorer.tsx', 'contexts/BrandingContext', 'contexts/ThemeContext'],
  },
  {
    id: 'floating-menu',
    label: 'RightFloatingMenuComponent',
    path: 'components/RightFloatingMenuComponent.tsx',
    description: 'Developer floating menu — theme toggle, CMS links, JSON viewer.',
    subComponents: ['services/homepage.ts', 'framer-motion', 'lucide-react'],
  },
]

export const PAGE_RENDERER_NODES: ComponentTreeNode[] = [
  {
    id: 'landing-page-display',
    label: 'LandingPageDisplay',
    path: 'components/LandingPageDisplay.tsx',
    description: 'LandingPage renderer — maps TopContentArea and MainContentArea to React output.',
    subComponents: ['components/blocks/BlockRenderer.tsx', 'utils/seoDataTransformers.ts'],
  },
  {
    id: 'block-renderer',
    label: 'BlockRenderer',
    path: 'components/blocks/BlockRenderer.tsx',
    description: 'Switch on _metadata.types[0] to pick the matching block component file.',
    subComponents: Object.values(BLOCK_COMPONENT_PATHS),
  },
]

export function getBlockComponentPath(componentType: string): string {
  return BLOCK_COMPONENT_PATHS[componentType] || `components/blocks/${componentType}.tsx`
}

export function getBlockSubComponents(componentType: string): string[] {
  return BLOCK_SUB_COMPONENTS[componentType] || []
}
