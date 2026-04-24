"use client";

const _CONTEXT_VERSION = 5;

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  OnboardingState,
  AccountInfo,
  AdAccountState,
  IntegrationsState,
  SubdomainState,
  TrackingState,
  StoreState,
  ThemeState,
  StepStatus,
  SaveStatus,
  MOCK_SHOPIFY_PRODUCTS,
  Product,
} from "./types";

const STORAGE_KEY = "velocity-onboarding";

const defaultState: OnboardingState = {
  // TEMPORARY: pre-seeded for dev preview — restores to null in production
  account: { fullName: "John Demo", email: "demo@testbrand.com", companyName: "Test Brand Inc.", operatingName: "Test Brand", website: "https://testbrand.com" },
  currentStep: 1,
  completedSteps: [3, 4],
  onboardingComplete: false,
  saveStatus: "idle",
  lastSavedAt: null,
  adAccount: {
    connected: false,
    accountId: "",
    pixels: [],
  },
  integrations: {
    stripe: false,
    paypal: false,
    taxjar: false,
  },
  subdomain: {
    subdomain: "shop",
    rootDomain: "yourbrand.com",
    dnsVerified: true,
    verificationStatus: "verified",
  },
  tracking: {
    integrations: [],
    customRequests: [],
  },
  store: {
    shopifyStoreUrl: "acme-brand.myshopify.com",
    connected: true,
    stores: [
      {
        id: "store-1",
        storeUrl: "acme-brand.myshopify.com",
        status: "connected",
        lastSynced: "Apr 8, 2026 2:45 PM PDT",
      },
    ],
  },
  products: [], // TEMPORARY: cleared for fresh wizard start — remove when full flow is implemented
  theme: {
    status: "ready",
    logo: null,
    favicon: null,
    coreColors: [
      { id: "primary", name: "Primary", hex: "#3D348B" },
      { id: "secondary", name: "Secondary", hex: "#2A2552" },
      { id: "cta", name: "CTA button", hex: "#FFD162" },
      { id: "accent", name: "Accent bg", hex: "#FDFDE7" },
    ],
    extendedColors: [
      { id: "ext1", name: "Extended 1", hex: null },
      { id: "ext2", name: "Extended 2", hex: null },
      { id: "ext3", name: "Extended 3", hex: null },
      { id: "ext4", name: "Extended 4", hex: null },
      { id: "ext5", name: "Extended 5", hex: null },
    ],
    typography: [
      { name: "Heading", font: "Kefir", weight: 700 },
      { name: "Subheading", font: "Figtree", weight: 500 },
      { name: "Body", font: "Figtree", weight: 400 },
    ],
    sourceProductId: null,
  },
};

interface OnboardingContextType {
  state: OnboardingState;
  createAccount: (account: AccountInfo) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (step: number) => void;
  completeOnboarding: () => void;
  updateAdAccount: (data: Partial<AdAccountState>) => void;
  updateIntegrations: (data: Partial<IntegrationsState>) => void;
  updateSubdomain: (data: Partial<SubdomainState>) => void;
  updateTracking: (data: Partial<TrackingState>) => void;
  updateStore: (data: Partial<StoreState>) => void;
  updateProducts: (products: Product[]) => void;
  updateTheme: (data: Partial<ThemeState>) => void;
  getStepStatus: (step: number) => StepStatus;
  getStepProgress: (step: number) => number;
  isCurrentPageComplete: (step: number) => boolean;
  triggerSave: () => void;
  // Products page unsaved changes tracking
  productsHasUnsavedChanges: boolean;
  setProductsHasUnsavedChanges: (hasChanges: boolean) => void;
  // Callback registered by StepProducts so the parent page can trigger a save
  triggerProductsSave: (() => void) | null;
  setTriggerProductsSave: (fn: (() => void) | null) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [productsHasUnsavedChanges, setProductsHasUnsavedChanges] = useState(false);
  const [triggerProductsSave, setTriggerProductsSave] = useState<(() => void) | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitializedRef.current) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState({
            ...defaultState,
            ...parsed,
            lastSavedAt: parsed.lastSavedAt ? new Date(parsed.lastSavedAt) : null,
            // TEMPORARY: clear saved products for fresh wizard testing
            products: [],
          });
        } catch (e) {
          console.error("Failed to parse saved state:", e);
        }
      }
      isInitializedRef.current = true;
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((newState: OnboardingState) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  }, []);

  // Debounced save
  const triggerSave = useCallback(() => {
    setState((prev) => ({ ...prev, saveStatus: "saving" }));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setState((prev) => {
        const newState = {
          ...prev,
          saveStatus: "saved" as SaveStatus,
          lastSavedAt: new Date(),
        };
        saveToStorage(newState);
        return newState;
      });
    }, 1500);
  }, [saveToStorage]);

  const createAccount = useCallback(
    (account: AccountInfo) => {
      setState((prev) => {
        const newState = { 
          ...prev, 
          account,
          currentStep: 1, // Reset to step 1 when creating new account
          completedSteps: [], // Clear completed steps for fresh start
        };
        saveToStorage(newState);
        return newState;
      });
    },
    [saveToStorage]
  );

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 6),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const completeStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step],
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completedSteps: [1, 2, 3, 4, 5, 6],
      onboardingComplete: true,
    }));
  }, []);

  const updateAdAccount = useCallback(
    (data: Partial<AdAccountState>) => {
      setState((prev) => ({
        ...prev,
        adAccount: { ...prev.adAccount, ...data },
      }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateIntegrations = useCallback(
    (data: Partial<IntegrationsState>) => {
      setState((prev) => ({
        ...prev,
        integrations: { ...prev.integrations, ...data },
      }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateSubdomain = useCallback(
    (data: Partial<SubdomainState>) => {
      setState((prev) => ({
        ...prev,
        subdomain: { ...prev.subdomain, ...data },
      }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateTracking = useCallback(
    (data: Partial<TrackingState>) => {
      setState((prev) => ({
        ...prev,
        tracking: { ...prev.tracking, ...data },
      }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateStore = useCallback(
    (data: Partial<StoreState>) => {
      setState((prev) => ({
        ...prev,
        store: { ...prev.store, ...data },
      }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateProducts = useCallback(
    (products: Product[]) => {
      setState((prev) => ({ ...prev, products }));
      triggerSave();
    },
    [triggerSave]
  );

  const updateTheme = useCallback(
    (data: Partial<ThemeState>) => {
      setState((prev) => ({
        ...prev,
        theme: { ...prev.theme, ...data },
      }));
      triggerSave();
    },
    [triggerSave]
  );

  // Check if a step has all required fields completed based on actual data
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1: // Ad Account - Meta connected
        return state.adAccount.connected;
      case 2: // Payment - Stripe AND PayPal required (TaxJar is optional)
        return state.integrations.stripe && state.integrations.paypal;
      case 3: // Store - Shopify connected
        return state.store.connected;
      case 4: // Subdomain - domain must be verified
        return state.subdomain.dnsVerified === true;
      case 5: // Tracking - Meta Pixel required
        return !!state.tracking.metaPixelId;
      case 6: // Products - at least one product selected
        return state.products.some((p) => p.selected);
      case 7: // Theme - has logo
        return state.theme.logo !== null;
      case 8: // Assets - no required items
        return true;
      default:
        return false;
    }
  };

  // Check if a step has been started (any data entered)
  const isStepStarted = (step: number): boolean => {
    switch (step) {
      case 1:
        return state.adAccount.accountId.length > 0 || state.adAccount.connected;
      case 2:
        return state.integrations.stripe || state.integrations.paypal || state.integrations.taxjar;
      case 3:
        return state.store.shopifyStoreUrl.length > 0 || state.store.connected;
      case 4:
        return state.subdomain.subdomain.length > 0;
      case 5:
        return !!state.tracking.metaPixelId || state.tracking.integrations.length > 0 || state.tracking.customRequests.length > 0;
      case 6:
        return state.products.some((p) => p.selected);
      case 7:
        return state.theme.logo !== null || state.theme.favicon !== null;
      case 8:
        return true;
      default:
        return false;
    }
  };

  // Check if current page's required step is complete (all required items done)
  const isCurrentPageComplete = (currentStep: number): boolean => {
    return isStepComplete(currentStep);
  };

  const getStepStatus = (step: number): StepStatus => {
    if (isStepComplete(step)) return "complete";
    if (isStepStarted(step)) return "started";
    return "incomplete";
  };

  // Returns 0–1 representing how many required items are done
  const getStepProgress = (step: number): number => {
    switch (step) {
      case 1: // 1 required: Meta connected
        return state.adAccount.connected ? 1 : 0;
      case 2: { // 2 required: Stripe AND PayPal (TaxJar optional)
        const done = (state.integrations.stripe ? 1 : 0) + (state.integrations.paypal ? 1 : 0);
        return done / 2;
      }
      case 3: // 1 required: Shopify connected
        return state.store.connected ? 1 : 0;
      case 4: // 1 required: domain must be verified
        return state.subdomain.dnsVerified ? 1 : 0;
      case 5: // 1 required: Meta Pixel selected
        return state.tracking.metaPixelId ? 1 : 0;
      case 6: { // required: at least 1 product selected (binary — any = complete)
        return state.products.some((p) => p.selected) ? 1 : 0;
      }
      case 7: // 1 required: logo uploaded
        return state.theme.logo !== null ? 1 : 0;
      case 8: // no required items — always complete
        return 1;
      default:
        return 0;
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        createAccount,
        goToStep,
        nextStep,
        prevStep,
        completeStep,
        completeOnboarding,
        updateAdAccount,
        updateIntegrations,
        updateSubdomain,
        updateTracking,
        updateStore,
        updateProducts,
        updateTheme,
        getStepStatus,
        getStepProgress,
        isCurrentPageComplete,
        triggerSave,
        productsHasUnsavedChanges,
        setProductsHasUnsavedChanges,
        triggerProductsSave,
        setTriggerProductsSave,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
