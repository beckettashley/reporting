/* eslint-disable */
// Cache bust: add-article-details-product-comparison
"use client"

import { ContentType, CellContent } from "@/types/grid"
import {
  Type,
  Image,
  Video,
  List,
  ListOrdered,
  LayoutList,
  MousePointer2,
  Sparkles,
  Minus,
  ArrowUpDown,
  Badge,
  Star,
  FileText,
  BarChart3,
  Megaphone,
  PanelBottom,
  Menu,
  ChevronsDown,
} from "lucide-react"

export interface ComponentDefinition {
  type: ContentType
  label: string
  description: string
  icon: React.ReactNode
  category: "typography" | "media" | "lists" | "actions" | "layout"
  defaultContent: Partial<CellContent>
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // Typography
  {
    type: "textBox",
    label: "Text Box",
    description: "Rich text with headings, formatting, colors, and links",
    icon: <Type className="h-5 w-5" />,
    category: "typography",
    defaultContent: {
      type: "textBox",
      text: "",
    },
  },
  // Media
  {
    type: "image",
    label: "Image",
    description: "Single image with alt text",
    icon: <Image className="h-5 w-5" />,
    category: "media",
    defaultContent: {
      type: "image",
      imageUrl: "",
      imageAlt: "",
      imageAspectRatio: "widescreen",
      imageObjectFit: "cover",
    },
  },
  {
    type: "carousel",
    label: "Carousel",
    description: "Image carousel with thumbnails and navigation",
    icon: <LayoutList className="h-5 w-5" />,
    category: "media",
    defaultContent: {
      type: "carousel",
      carouselImages: [
        { url: "", alt: "Slide 1" },
        { url: "", alt: "Slide 2" },
      ],
      carouselBorderRadius: 6,
      carouselShowThumbnails: true,
      carouselAutoplay: false,
      carouselAutoplayInterval: 5000,
      carouselThumbnailSize: 60,
      carouselThumbnailGap: 8,
    },
  },
  {
    type: "video",
    label: "Video",
    description: "Embedded video player",
    icon: <Video className="h-5 w-5" />,
    category: "media",
    defaultContent: {
      type: "video",
      videoUrl: "",
      videoAspectRatio: "square",
    },
  },
  {
    type: "iconBlock",
    label: "Icon Block",
    description: "Icon with label text",
    icon: <Sparkles className="h-5 w-5" />,
    category: "media",
    defaultContent: {
      type: "iconBlock",
      iconBlockItems: [],
    },
  },
  // Lists
  {
    type: "bulletList",
    label: "Bullet List",
    description: "Unordered list of items",
    icon: <List className="h-5 w-5" />,
    category: "lists",
    defaultContent: {
      type: "bulletList",
      bulletItems: ["First item", "Second item", "Third item"],
    },
  },
  {
    type: "numberedList",
    label: "Numbered List",
    description: "Ordered list of items",
    icon: <ListOrdered className="h-5 w-5" />,
    category: "lists",
    defaultContent: {
      type: "numberedList",
      bulletItems: ["Step one", "Step two", "Step three"],
    },
  },
  {
    type: "iconList",
    label: "Icon List",
    description: "List with custom icon per item",
    icon: <LayoutList className="h-5 w-5" />,
    category: "lists",
    defaultContent: {
      type: "iconList",
      iconListItems: [],
    },
  },
  // Actions
  {
    type: "ctaButton",
    label: "CTA Button",
    description: "Call-to-action button",
    icon: <MousePointer2 className="h-5 w-5" />,
    category: "actions",
    defaultContent: {
      type: "ctaButton",
      ctaText: "Get Started",
      ctaUrl: "#",
      ctaVariant: "primary",
    },
  },
  {
    type: "stickyBottomCta",
    label: "Sticky Bottom CTA",
    description: "CTA button that sticks to bottom after scroll",
    icon: <ChevronsDown className="h-5 w-5" />,
    category: "actions",
    defaultContent: {
      type: "stickyBottomCta",
      ctaText: "Get Started Now",
      ctaUrl: "#",
    },
  },
  {
    type: "badge",
    label: "Badge",
    description: "Small label or tag",
    icon: <Badge className="h-5 w-5" />,
    category: "actions",
    defaultContent: {
      type: "badge",
      text: "New",
      badgeVariant: "default",
    },
  },
  {
    type: "starRating",
    label: "Star Rating",
    description: "Star rating display with optional label",
    icon: <Star className="h-5 w-5" />,
    category: "actions",
    defaultContent: {
      type: "starRating",
      starCount: 5,
      starValue: 4.5,
      starLabel: "4.5 out of 5",
      starColor: "#f59e0b",
    },
  },
  // Layout
  {
    type: "spacer",
    label: "Spacer",
    description: "Empty vertical space",
    icon: <ArrowUpDown className="h-5 w-5" />,
    category: "layout",
    defaultContent: {
      type: "spacer",
      spacerHeight: 40,
    },
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal line separator",
    icon: <Minus className="h-5 w-5" />,
    category: "layout",
    defaultContent: {
      type: "divider",
    },
  },
  {
    type: "iconBlock",
    label: "Icon Block",
    description: "Row of icons with labels",
    icon: <Sparkles className="h-5 w-5" />,
    category: "layout",
    defaultContent: {
      type: "iconBlock",
      iconBlockItems: [],
    },
  },
  // Components
  {
    type: "articleDetails",
    label: "Article Details",
    description: "Author byline with avatar, name, and date",
    icon: <FileText className="h-5 w-5" />,
    category: "typography",
    defaultContent: {
      type: "articleDetails",
      articleAuthor: "Author Name",
      articleAuthorImage: "",
      articleDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      articleVariant: "default",
    },
  },
  {
    type: "productComparison",
    label: "Product Comparison",
    description: "Side-by-side product comparison table",
    icon: <BarChart3 className="h-5 w-5" />,
    category: "layout",
    defaultContent: {
      type: "productComparison",
      productComparisonProducts: [
        { name: "Us", color: "#EAFBFB" },
        { name: "Competitor A" },
        { name: "Competitor B" },
      ],
      productComparisonMetrics: [
        { label: "Feature 1", emoji: "⭐", values: ["✓", "✓", "✗"] },
        { label: "Feature 2", emoji: "💪", values: ["✓", "✗", "✗"] },
        { label: "Feature 3", emoji: "💵", values: ["✓", "✓", "✓"] },
      ],
    },
  },
  {
    type: "banner",
    label: "Banner",
    description: "Sticky or static announcement banner with optional CTA and countdown",
    icon: <Megaphone className="h-5 w-5" />,
    category: "actions",
    defaultContent: {
      type: "banner",
    },
  },
  {
    type: "navbar",
    label: "NavBar",
    description: "Navigation bar with logo and links",
    icon: <Menu className="h-5 w-5" />,
    category: "layout",
    defaultContent: {
      type: "navbar",
    },
  },
  {
    type: "footer",
    label: "Footer",
    description: "Legal disclaimer, copyright line, and links (Terms / Privacy)",
    icon: <PanelBottom className="h-5 w-5" />,
    category: "layout",
    defaultContent: {
      type: "footer",
      footerDisclaimer: "*Special offer valid only on first order. Subscription renews every 30 days. Max one offer per customer.",
      footerCopyright: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      footerLinks: [
        { label: "Terms of Service", url: "#" },
        { label: "Privacy Policy", url: "#" },
      ],
    },
  },
]

export const CATEGORIES = [
  { id: "typography", label: "Typography" },
  { id: "media", label: "Media" },
  { id: "lists", label: "Lists" },
  { id: "actions", label: "Actions" },
  { id: "layout", label: "Layout" },
] as const

export const getComponentByType = (type: ContentType): ComponentDefinition | undefined => {
  return COMPONENT_LIBRARY.find((c) => c.type === type)
}

export const getComponentsByCategory = (category: ComponentDefinition["category"]): ComponentDefinition[] => {
  return COMPONENT_LIBRARY.filter((c) => c.category === category)
}
