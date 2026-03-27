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
  BarChart3
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
      imageAlt: "Describe this image",
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
      icon: "star",
      iconLabel: "Feature highlight",
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
        { name: "Product A", color: "#3b82f6" },
        { name: "Product B", color: "#10b981" },
      ],
      productComparisonMetrics: [
        { label: "Feature 1", emoji: "⭐", values: [true, true] },
        { label: "Feature 2", emoji: "✓", values: [true, false] },
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
