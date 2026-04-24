export interface AccountInfo {
  companyName: string;
  operatingName: string;
  website: string;
  fullName: string;
  email: string;
}

export interface SubdomainState {
  subdomain: string;
  rootDomain: string;
  dnsVerified: boolean;
  verificationStatus: "pending" | "verifying" | "verified" | "failed" | null;
}

export interface IntegrationsState {
  stripe: boolean;
  paypal: boolean;
  taxjar: boolean;
}

export interface TrackingIntegration {
  id: string;
  name: string;
  enabled: boolean;
  configValue: string;
  status?: "active" | "pending" | "error";
  isCustom?: boolean;
}

export interface TrackingState {
  integrations: TrackingIntegration[];
  customRequests: TrackingIntegration[];
  metaPixelId?: string; // Required pixel ID
  googleConversionId?: string;
  subdomain?: string;
}

export interface StoreConnection {
  id: string;
  storeUrl: string;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSynced: string | null;
}

export interface StoreState {
  shopifyStoreUrl: string;
  connected: boolean;
  stores: StoreConnection[];
}

export interface MetaPixel {
  id: string;
  name: string;
}

export interface AdAccountState {
  connected: boolean;
  accountId: string;
  pixels?: MetaPixel[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  vendor: string;
  category: string;
  price: string;
  variants: number;
  image: string | null;
  selected: boolean;
  status?: "active" | "draft" | "archived";
  inventory?: number;
}

export interface ThemeColorSwatch {
  id: string;
  name: string;
  hex: string | null; // null = empty/transparent
}

export interface ThemeTypographyItem {
  name: string;
  font: string;
  weight: number;
}

export interface ThemeState {
  status: "idle" | "building" | "ready";
  logo: string | null;
  favicon: string | null;
  coreColors: ThemeColorSwatch[]; // 4: Primary, Secondary, CTA, Accent
  extendedColors: ThemeColorSwatch[]; // 5: optional extras
  typography: ThemeTypographyItem[]; // Heading, Subheading, Body
  sourceProductId: string | null;
  primaryColor?: string;
  secondaryColor?: string;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type StepStatus = "incomplete" | "started" | "in-progress" | "complete";

export interface OnboardingState {
  account: AccountInfo | null;
  currentStep: number;
  completedSteps: number[];
  onboardingComplete: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  adAccount: AdAccountState;
  integrations: IntegrationsState;
  subdomain: SubdomainState;
  tracking: TrackingState;
  store: StoreState;
  products: Product[];
  theme: ThemeState;
}

export const MOCK_SHOPIFY_PRODUCTS: Product[] = [
  { id: "1",  name: "Classic Tee",          sku: "TEE-CLS-001", vendor: "Brand Co.",    category: "Apparel",     price: "$29.00",  variants: 6,  image: null, selected: false, status: "active", inventory: 1248 },
  { id: "2",  name: "Classic Tee — Womens", sku: "TEE-CLS-002", vendor: "Brand Co.",    category: "Apparel",     price: "$29.00",  variants: 6,  image: null, selected: false, status: "active", inventory: 892 },
  { id: "3",  name: "Classic Tee — Kids",   sku: "TEE-CLS-003", vendor: "Brand Co.",    category: "Apparel",     price: "$22.00",  variants: 4,  image: null, selected: false, status: "draft", inventory: 156 },
  { id: "4",  name: "Premium Hoodie",        sku: "HOD-PRM-001", vendor: "Brand Co.",    category: "Apparel",     price: "$79.00",  variants: 5,  image: null, selected: false, status: "active", inventory: 423 },
  { id: "5",  name: "Premium Hoodie — Zip",  sku: "HOD-PRM-002", vendor: "Brand Co.",    category: "Apparel",     price: "$89.00",  variants: 5,  image: null, selected: false, status: "active", inventory: 287 },
  { id: "6",  name: "Logo Cap",              sku: "CAP-LOG-001", vendor: "Headwear Co.", category: "Apparel",     price: "$34.00",  variants: 3,  image: null, selected: false, status: "active", inventory: 512 },
  { id: "7",  name: "Logo Cap — Snapback",   sku: "CAP-LOG-002", vendor: "Headwear Co.", category: "Apparel",     price: "$38.00",  variants: 2,  image: null, selected: false, status: "archived", inventory: 34 },
  { id: "8",  name: "Starter Bundle",        sku: "BDL-STR-001", vendor: "Brand Co.",    category: "Collections", price: "$99.00",  variants: 1,  image: null, selected: false, status: "active", inventory: 89 },
  { id: "9",  name: "Popular Bundle",        sku: "BDL-POP-001", vendor: "Brand Co.",    category: "Collections", price: "$149.00", variants: 1,  image: null, selected: false, status: "active", inventory: 156 },
  { id: "10", name: "Sample Pack",           sku: "PCK-SMP-001", vendor: "Brand Co.",    category: "Collections", price: "$59.00",  variants: 1,  image: null, selected: false, status: "draft", inventory: 0 },
  { id: "11", name: "Water Bottle — 500ml",  sku: "BTL-WAT-001", vendor: "Drinkware Co.", category: "Accessories", price: "$24.00", variants: 4,  image: null, selected: false, status: "active", inventory: 1893 },
  { id: "12", name: "Water Bottle — 1L",     sku: "BTL-WAT-002", vendor: "Drinkware Co.", category: "Accessories", price: "$32.00", variants: 4,  image: null, selected: false, status: "active", inventory: 756 },
  { id: "13", name: "Tote Bag",              sku: "BAG-TOT-001", vendor: "Brand Co.",    category: "Accessories", price: "$19.00",  variants: 3,  image: null, selected: false, status: "active", inventory: 2341 },
  { id: "14", name: "Notebook — A5",         sku: "NTB-A05-001", vendor: "Paper Co.",    category: "Accessories", price: "$14.00",  variants: 2,  image: null, selected: false },
  { id: "15", name: "Notebook — A4",         sku: "NTB-A04-001", vendor: "Paper Co.",    category: "Accessories", price: "$18.00",  variants: 2,  image: null, selected: false },
];
