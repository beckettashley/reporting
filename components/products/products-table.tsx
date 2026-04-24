"use client";

import React, { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Search, ChevronLeft, ChevronRight, ChevronDown, ArrowUp, ArrowDown, Filter, X, Info } from "lucide-react";

export type ProductStatus = "Active" | "Draft" | "Archived" | "Unlisted";

export interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  minPrice: number;
  status: ProductStatus;
}

export interface Product {
  id: string;
  name: string;
  productId: string;
  quantity: number;
  sellPrice: number;
  minPrice: number;
  variantCount: number;
  variantList: Variant[];
  status: ProductStatus;
  hasActiveExperiment: boolean;
}

// Seeded random for deterministic values (avoids hydration mismatch)
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Round to nearest $0.50
const roundToHalfDollar = (value: number): number => {
  return Math.round(value * 2) / 2;
};

// Default min price: sell price minus 10%, rounded to nearest $0.50
const defaultMinPrice = (sellPrice: number): number => {
  return roundToHalfDollar(sellPrice * 0.9);
};

const generateVariants = (productId: string, basePrice: number, seed: number): Variant[] => {
  const variants: Variant[] = [];
  const colors = ["Black", "White", "Navy", "Gray", "Red", "Blue"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const statuses: ProductStatus[] = ["Active", "Draft", "Archived", "Unlisted"];
  
  const numColors = Math.floor(seededRandom(seed * 7) * 3) + 2;
  const productColors = colors.slice(0, numColors);
  
  const numSizes = Math.floor(seededRandom(seed * 11) * 4) + 3;
  const productSizes = sizes.slice(0, numSizes);
  
  let variantIndex = 0;
  for (const color of productColors) {
    for (const size of productSizes) {
      const variantSeed = seed * 100 + variantIndex;
      const productNum = parseInt(productId.replace("product-", ""));
      variants.push({
        id: String(50085480300000 + productNum * 100 + variantIndex),
        sku: `SKU-${String(productNum * 100 + variantIndex).padStart(8, "0")}`,
        size,
        color,
        quantity: Math.floor(seededRandom(variantSeed) * 100) + 5,
        price: basePrice,
        minPrice: roundToHalfDollar(basePrice * 0.9),
        status: statuses[Math.floor(seededRandom(variantSeed * 13) * statuses.length)],
      });
      variantIndex++;
    }
  }
  
  return variants;
};

export const generateDummyProducts = (): Product[] => {
  const products: Product[] = [];
  const statuses: ProductStatus[] = ["Active", "Draft", "Archived", "Unlisted"];
  const names = [
    "Classic Cotton Tee", "Canvas Backpack", "Baseball Cap", "Premium Hoodie",
    "Slim Fit Jeans", "Wool Beanie", "Cashmere Sweater", "Bucket Hat",
    "Duffle Bag", "Bomber Jacket", "Newsboy Cap", "Leather Wallet",
  ];

  for (let i = 0; i < 500; i++) {
    let basePrice = Math.round(seededRandom(i * 2) * 150 * 100) / 100;
    // Ensure minimum price of $19.99 for all products
    if (basePrice < 19.99) {
      basePrice = 19.99 + (i % 10) * 5;
    }
    const variantList = generateVariants(`product-${i}`, basePrice, i);
    
    const totalQuantity = variantList.reduce((sum, v) => sum + v.quantity, 0);
    const sellPrice = variantList.length > 0 ? variantList[0].price : basePrice;
    const minPrice = variantList.length > 0 ? Math.min(...variantList.map(v => v.minPrice)) : roundToHalfDollar(basePrice * 0.9);
    
    const isDefaultSelected = i < 5;
    
    products.push({
      id: `product-${i}`,
      name: `${names[i % names.length]} ${i}`,
      productId: String(10085480300000 + i),
      quantity: totalQuantity,
      sellPrice,
      minPrice,
      variantCount: variantList.length,
      variantList,
      status: isDefaultSelected ? "Active" : statuses[Math.floor(seededRandom(i * 5) * statuses.length)],
      hasActiveExperiment: isDefaultSelected,
    });
  }

  return products;
};

interface Filters {
  status: string[];
  availability: string;
  tags: string[];
  collection: string[];
}

const defaultFilters: Filters = {
  status: [],
  availability: "all",
  tags: [],
  collection: [],
};

const ALL_STATUSES: ProductStatus[] = ["Active", "Draft", "Archived", "Unlisted"];

const AVAILABLE_TAGS = ["Summer", "Winter", "New Arrival", "Sale", "Featured", "Limited Edition"];
const AVAILABLE_COLLECTIONS = ["Men's Apparel", "Women's Apparel", "Accessories", "Footwear", "Outerwear", "Seasonal"];

interface ProductsTableProps {
  products: Product[];
  selectedIds: Set<string>;
  selectedVariants: Map<string, Set<string>>;
  savedSelectedIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>, selectedVariants: Map<string, Set<string>>) => void;
  onSave?: () => void;
  onCancel?: () => void;
  hasUnsavedChanges?: boolean;
  showExperimentColumn?: boolean;
  showMinPriceInput?: boolean;
  pageSize?: number;
  maxProducts?: number;
  columnHighlightOpacity?: number;
  variantHighlightOpacity?: number;
  minPriceHighlightOpacity?: number;
  expandFirstProductTrigger?: number;
  collapseFirstProductTrigger?: number;
  onFirstProductSelected?: (rowEl: HTMLElement | null) => void;
  onMinPriceHovered?: () => void;
  onPriceChange?: () => void;
  onVariantChange?: () => void;
  guideStep?: number;
}

export function ProductsTable({
  products,
  selectedIds,
  selectedVariants,
  savedSelectedIds,
  onSelectionChange,
  onSave,
  onCancel,
  hasUnsavedChanges = false,
  showExperimentColumn = true,
  showMinPriceInput = true,
  pageSize = 20,
  maxProducts,
  columnHighlightOpacity = 0,
  variantHighlightOpacity = 0,
  minPriceHighlightOpacity = 0,
  expandFirstProductTrigger = 0,
  collapseFirstProductTrigger = 0,
  onFirstProductSelected,
  onMinPriceHovered,
  onPriceChange,
  onVariantChange,
  guideStep,
}: ProductsTableProps) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [productsToDeselect, setProductsToDeselect] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [variantMinPrices, setVariantMinPrices] = useState<Map<string, number>>(new Map());
  const [productMinPrices, setProductMinPrices] = useState<Map<string, number>>(new Map());
  const [allFilteredSelected, setAllFilteredSelected] = useState(false);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const hasCalledProductSelectedRef = React.useRef(false);
  const [blockedProduct, setBlockedProduct] = useState<Product | null>(null);
  const hasCalledMinPriceRef = React.useRef(false);
  const latestProductsRef = React.useRef(products);
  const latestSortedRef = React.useRef<Product[]>([]);
  const latestSelectedIdsRef = React.useRef(selectedIds);
  const latestExpandedRef = React.useRef(expandedProductId);

  useEffect(() => { latestProductsRef.current = products; }, [products]);
  useEffect(() => { latestSelectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => { latestExpandedRef.current = expandedProductId; }, [expandedProductId]);

  useEffect(() => {
    if (!expandFirstProductTrigger) return;
    const target = latestSortedRef.current[0];
    if (target) setExpandedProductId(target.id);
  }, [expandFirstProductTrigger]);

  useEffect(() => {
    if (!collapseFirstProductTrigger) return;
    setExpandedProductId(null);
  }, [collapseFirstProductTrigger]);

  // Reset allFilteredSelected when unsaved changes are cleared (e.g., on Cancel or Save)
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setAllFilteredSelected(false);
    }
  }, [hasUnsavedChanges]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status.length > 0 ||
      filters.availability !== "all" ||
      filters.tags.length > 0 ||
      filters.collection.length > 0
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.availability !== "all") count++;
    if (filters.tags.length > 0) count++;
    if (filters.collection.length > 0) count++;
    return count;
  }, [filters]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const searchMatch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.productId.toLowerCase().includes(search.toLowerCase());
      if (!searchMatch) return false;

      if (filters.status.length > 0 && !filters.status.includes(p.status)) return false;

      if (filters.availability !== "all") {
        const inStock = p.quantity > 0;
        if (filters.availability === "inStock" && !inStock) return false;
        if (filters.availability === "outOfStock" && inStock) return false;
      }

      if (filters.tags.length > 0 && !filters.tags.some(tag => 
        p.name.toLowerCase().includes(tag.toLowerCase())
      )) return false;

      if (filters.collection.length > 0 && !filters.collection.some(coll => 
        p.name.toLowerCase().includes(coll.toLowerCase())
      )) return false;

      return true;
    });
  }, [products, search, filters]);

  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];
    
    sorted.sort((a, b) => {
      const aSelected = savedSelectedIds.has(a.id);
      const bSelected = savedSelectedIds.has(b.id);
      if (aSelected !== bSelected) return bSelected ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
    
    if (sortKey) {
      sorted = sorted.sort((a, b) => {
        const aSelected = savedSelectedIds.has(a.id);
        const bSelected = savedSelectedIds.has(b.id);
        if (aSelected !== bSelected) return bSelected ? 1 : -1;
        
        let aVal: string | number = "";
        let bVal: string | number = "";
        switch (sortKey) {
          case "status": aVal = a.status; bVal = b.status; break;
          case "name": aVal = a.name; bVal = b.name; break;
          case "quantity": aVal = a.quantity; bVal = b.quantity; break;
          case "sellPrice": aVal = a.sellPrice; bVal = b.sellPrice; break;
          case "minPrice": aVal = a.minPrice; bVal = b.minPrice; break;
          case "variants": aVal = a.variantCount; bVal = b.variantCount; break;
          case "experiment": aVal = a.hasActiveExperiment ? 1 : 0; bVal = b.hasActiveExperiment ? 1 : 0; break;
        }
        if (typeof aVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
        }
        return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }
    return sorted;
  }, [filteredProducts, sortKey, sortDir, savedSelectedIds]);

  latestSortedRef.current = sortedProducts;

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const allPageSelected = paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.has(p.id));
  const somePageSelected = paginatedProducts.some((p) => selectedIds.has(p.id)) && !allPageSelected;

  const toggleSelectAll = () => {
    const newSelectedIds = new Set(selectedIds);
    const newSelectedVariants = new Map(selectedVariants);
    
    // Only enter deselect mode if ALL products on the current page are selected
    // (not just because allFilteredSelected is true from a previous action)
    if (allPageSelected) {
      // Allow deselection without warning - warning will show on Save if needed
      // Deselect all on current page (or all filtered if that was selected)
      paginatedProducts.forEach((p) => {
        newSelectedIds.delete(p.id);
        newSelectedVariants.delete(p.id);
      });
      if (allFilteredSelected) {
        // If all filtered was selected, deselect everything in filtered results
        sortedProducts.forEach((p) => {
          newSelectedIds.delete(p.id);
          newSelectedVariants.delete(p.id);
        });
      }
      setAllFilteredSelected(false);
    } else {
      // Select all products on the current page (no warning needed for selecting)
      paginatedProducts.forEach((p) => {
        newSelectedIds.add(p.id);
        const allVariantIds = new Set(p.variantList.map(v => v.id));
        newSelectedVariants.set(p.id, allVariantIds);
      });
      // Reset allFilteredSelected since we're now just selecting the current page
      setAllFilteredSelected(false);
    }
    onSelectionChange(newSelectedIds, newSelectedVariants);
  };

  const selectAllFiltered = () => {
    const newSelectedIds = new Set(selectedIds);
    const newSelectedVariants = new Map(selectedVariants);
    
    sortedProducts.forEach((p) => {
      newSelectedIds.add(p.id);
      const allVariantIds = new Set(p.variantList.map(v => v.id));
      newSelectedVariants.set(p.id, allVariantIds);
    });
    
    setAllFilteredSelected(true);
    onSelectionChange(newSelectedIds, newSelectedVariants);
  };

  const clearPageSelection = () => {
    const newSelectedIds = new Set(selectedIds);
    const newSelectedVariants = new Map(selectedVariants);
    
    paginatedProducts.forEach((p) => {
      newSelectedIds.delete(p.id);
      newSelectedVariants.delete(p.id);
    });
    
    setAllFilteredSelected(false);
    onSelectionChange(newSelectedIds, newSelectedVariants);
  };

  const toggleProduct = (productId: string, rowEl?: HTMLElement | null) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newSelectedIds = new Set(selectedIds);
    const newSelectedVariants = new Map(selectedVariants);
    
    if (newSelectedIds.has(productId)) {
      if (showExperimentColumn && product.hasActiveExperiment) {
        setBlockedProduct(product);
        return;
      }
      newSelectedIds.delete(productId);
      newSelectedVariants.delete(productId);
      if (expandedProductId === productId) {
        setExpandedProductId(null);
      }
      setShowLimitMessage(false);
    } else {
      if (maxProducts !== undefined && newSelectedIds.size >= maxProducts) {
        setShowLimitMessage(true);
        return;
      }
      newSelectedIds.add(productId);
      const allVariantIds = new Set(product.variantList.map(v => v.id));
      newSelectedVariants.set(productId, allVariantIds);
      setExpandedProductId(productId);
      if (!hasCalledProductSelectedRef.current) {
        hasCalledProductSelectedRef.current = true;
        onFirstProductSelected?.(rowEl ?? null);
      }
    }
    onSelectionChange(newSelectedIds, newSelectedVariants);
  };

  const confirmBulkDeselect = () => {
    if (productsToDeselect.length === 0) return;
    
    // User confirmed they want to save with these products removed
    setExpandedProductId(null);
    setProductsToDeselect([]);
    onSave?.();
  };

  const updateVariantMinPrice = (variantId: string, price: number, product?: Product) => {
    if (showExperimentColumn && product?.hasActiveExperiment) {
      setBlockedProduct(product);
      return;
    }
    const newPrices = new Map(variantMinPrices);
    newPrices.set(variantId, price);
    setVariantMinPrices(newPrices);
    onPriceChange?.();
  };

  const updateProductMinPrice = (product: Product, price: number) => {
    if (showExperimentColumn && product.hasActiveExperiment) {
      setBlockedProduct(product);
      return;
    }
    // Update product-level override
    const newProductPrices = new Map(productMinPrices);
    newProductPrices.set(product.id, price);
    setProductMinPrices(newProductPrices);
    // Propagate to all variants
    const newVariantPrices = new Map(variantMinPrices);
    product.variantList.forEach((v) => {
      newVariantPrices.set(v.id, price);
    });
    setVariantMinPrices(newVariantPrices);
    onPriceChange?.();
  };

  // Returns the effective min price to display for a product:
  // after save → min of cheapest variant; before save → product override or original
  const getEffectiveProductMinPrice = (product: Product): number => {
    const variantPrices = product.variantList.map(
      (v) => variantMinPrices.get(v.id) ?? defaultMinPrice(v.price)
    );
    if (variantPrices.length > 0) {
      return Math.min(...variantPrices);
    }
    return productMinPrices.get(product.id) ?? defaultMinPrice(product.sellPrice);
  };

  const notifyMinPriceHovered = () => {
    if (hasCalledMinPriceRef.current) return;
    hasCalledMinPriceRef.current = true;
    onMinPriceHovered?.();
  };

  const toggleExpansion = (productId: string) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null);
    } else {
      setExpandedProductId(productId);
    }
  };

  const toggleVariant = (productId: string, variantId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newSelectedVariants = new Map(selectedVariants);
    const productVariants = newSelectedVariants.get(productId) || new Set();
    const newProductVariants = new Set(productVariants);
    
    const isDeselecting = newProductVariants.has(variantId);
    if (isDeselecting && product.hasActiveExperiment) {
      setBlockedProduct(product);
      return;
    }

    if (isDeselecting) {
      newProductVariants.delete(variantId);
    } else {
      newProductVariants.add(variantId);
    }
    
    newSelectedVariants.set(productId, newProductVariants);
    
    const newSelectedIds = new Set(selectedIds);
    if (newProductVariants.size === 0) {
      newSelectedIds.delete(productId);
    } else {
      newSelectedIds.add(productId);
    }
    onSelectionChange(newSelectedIds, newSelectedVariants);
    onVariantChange?.();
  };

  const getVariantSelectionState = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { selected: 0, total: 0, allSelected: false };
    
    const variantSet = selectedVariants.get(productId);
    const selected = variantSet ? variantSet.size : 0;
    const total = product.variantList.length;
    return { selected, total, allSelected: selected === total };
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const updateFilter = (key: keyof Filters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-xs" style={{ backgroundColor: "#E5F4EE" }}>Active</Badge>;
      case "Draft":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">Draft</Badge>;
      case "Archived":
        return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 text-xs">Archived</Badge>;
      case "Unlisted":
        return <Badge variant="outline" className="bg-gray-200 text-gray-700 border-gray-300 text-xs">Unlisted</Badge>;
      default:
        return null;
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    if (sortDir === "asc") return <ArrowUp className="w-4 h-4 ml-1" />;
    return <ArrowDown className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 h-full">
      {/* Search and Filters + Cancel/Save Buttons */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        {maxProducts !== undefined && (
          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
            <span className={selectedIds.size >= maxProducts ? "text-foreground font-semibold" : ""}>{selectedIds.size}</span>
            {" / "}{maxProducts}
          </span>
        )}

        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                    Clear all
                  </Button>
                )}
              </div>

              {/* Status Filter - Multi-select */}
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {filters.status.length === 0
                        ? "All statuses"
                        : filters.status.length === 1
                        ? filters.status[0]
                        : `${filters.status.length} selected`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2">
                    <div className="space-y-1">
                      {ALL_STATUSES.map((s) => (
                        <div key={s} className="flex items-center gap-2 py-0.5">
                          <Checkbox
                            checked={filters.status.includes(s)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter("status", [...filters.status, s]);
                              } else {
                                updateFilter("status", filters.status.filter((x) => x !== s));
                              }
                            }}
                          />
                          <span className="text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Availability</Label>
                <Select value={filters.availability} onValueChange={(v) => updateFilter("availability", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="inStock">In Stock</SelectItem>
                    <SelectItem value="outOfStock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter - Multiselect */}
              <div className="space-y-2">
                <Label className="text-sm">Tags</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {filters.tags.length > 0 ? `${filters.tags.length} selected` : "Select tags..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2">
                    <div className="space-y-1">
                      {AVAILABLE_TAGS.map((tag) => (
                        <div key={tag} className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter("tags", [...filters.tags, tag]);
                              } else {
                                updateFilter("tags", filters.tags.filter((t) => t !== tag));
                              }
                            }}
                          />
                          <span className="text-sm">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Collection Filter - Multiselect */}
              <div className="space-y-2">
                <Label className="text-sm">Collection</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {filters.collection.length > 0 ? `${filters.collection.length} selected` : "Select collections..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2">
                    <div className="space-y-1">
                      {AVAILABLE_COLLECTIONS.map((coll) => (
                        <div key={coll} className="flex items-center gap-2">
                          <Checkbox
                            checked={filters.collection.includes(coll)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFilter("collection", [...filters.collection, coll]);
                              } else {
                                updateFilter("collection", filters.collection.filter((c) => c !== coll));
                              }
                            }}
                          />
                          <span className="text-sm">{coll}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasUnsavedChanges && onSave && (
          <>
            <Button 
              variant="outline"
              className="ml-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpandedProductId(null);
                setAllFilteredSelected(false);
                setProductsToDeselect([]);
                setSearch("");
                setPage(1);
                setFilters(defaultFilters);
                setSortKey(null);
                setSortDir("asc");
                setVariantMinPrices(new Map());
                onCancel?.();
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => {
              // Check if any products with experiments are being removed
              const removedProductsWithExperiments = products.filter(p => 
                savedSelectedIds.has(p.id) && !selectedIds.has(p.id) && p.hasActiveExperiment
              );
              
              if (removedProductsWithExperiments.length > 0) {
                setProductsToDeselect(removedProductsWithExperiments.map(p => p.id));
                return;
              }
              
              setExpandedProductId(null);
              onSave();
            }}>Save</Button>
          </>
        )}
      </div>

      {/* Max product limit message */}
      {showLimitMessage && maxProducts !== undefined && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          <span>You&apos;ve reached the {maxProducts} product limit. Deselect a product to swap it out.</span>
          <button type="button" onClick={() => setShowLimitMessage(false)} className="ml-auto hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Filters - Left aligned, only shown when active */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.join(", ")}
              <button type="button" onClick={() => updateFilter("status", [])} className="ml-1 hover:bg-muted rounded">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.availability !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Availability: {filters.availability === "inStock" ? "In Stock" : "Out of Stock"}
              <button type="button" onClick={() => updateFilter("availability", "all")} className="ml-1 hover:bg-muted rounded">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.tags.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Tags: {filters.tags.join(", ")}
              <button type="button" onClick={() => updateFilter("tags", [])} className="ml-1 hover:bg-muted rounded">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.collection.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Collection: {filters.collection.join(", ")}
              <button type="button" onClick={() => updateFilter("collection", [])} className="ml-1 hover:bg-muted rounded">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Products Table */}
      <TooltipProvider delayDuration={300}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0 border border-b-0 rounded-t-lg">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-[256px]" />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-20" />
              {showExperimentColumn && <col className="w-28" />}
              <col className="w-10" />
            </colgroup>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="h-9 text-xs bg-muted/50 px-2 relative">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: columnHighlightOpacity, transition: "opacity 0.4s ease" }} />
                    <div className="w-4 h-4" aria-hidden="true" />
                </TableHead>
                <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none px-2" onClick={() => handleSort("name")}>
                  <div className="flex items-center w-full h-full">Product{getSortIcon("name")}</div>
                </TableHead>
                <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none px-2" onClick={() => handleSort("status")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 w-full h-full">Shopify Status <Info className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40" />{getSortIcon("status")}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[220px]">{"The product's publishing status in Shopify."}</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none px-2" onClick={() => handleSort("quantity")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 w-full h-full">Available <Info className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40" />{getSortIcon("quantity")}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[240px]">Total inventory units available across all locations in Shopify.</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none px-2" onClick={() => handleSort("sellPrice")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 w-full h-full">Sell Price <Info className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40" />{getSortIcon("sellPrice")}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[200px]">{"The product's current listed price in Shopify."}</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none px-2 relative" onClick={() => handleSort("minPrice")}>
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: minPriceHighlightOpacity, transition: "opacity 0.4s ease" }} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 w-full h-full" onMouseEnter={() => notifyMinPriceHovered()}>Min Price <Info className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40" />{getSortIcon("minPrice")}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[260px]">Set the Minimum Sell Price for each variant. When building your offers, we&apos;ll bundle products and adjust pricing to increase order value — your minimum price is the floor we won&apos;t go below.</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none text-center px-2" onClick={() => handleSort("variants")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center gap-1 w-full h-full">Variants <Info className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40" />{getSortIcon("variants")}</div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[200px]">Number of variants for this product.</TooltipContent>
                  </Tooltip>
                </TableHead>
                {showExperimentColumn && (
                  <TableHead className="h-9 text-xs bg-muted/50 cursor-pointer select-none text-center px-2" onClick={() => handleSort("experiment")}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center gap-1 w-full h-full">Experiment <Info className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground/40" />{getSortIcon("experiment")}</div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-[200px]">Product live in an active experiment.</TooltipContent>
                    </Tooltip>
                  </TableHead>
                )}
                <TableHead className="h-9 text-xs bg-muted/50 px-0" />
              </TableRow>
              {/* Selection Banner Row �� only show when user actively selected, not on initial load of saved state */}
              {allPageSelected && hasUnsavedChanges && (
                <TableRow className="bg-blue-50 hover:bg-blue-50">
                  <TableHead colSpan={showExperimentColumn ? 8 : 7} className="h-9 text-xs text-center py-2">
                    {allFilteredSelected ? (
                      <span className="text-muted-foreground">
                        All {sortedProducts.length} products matching current filters are selected.{" "}
                        <button 
                          className="text-blue-600 underline hover:text-blue-700 font-medium"
                          onClick={clearPageSelection}
                        >
                          Clear selection
                        </button>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        All {paginatedProducts.length} products on this page are selected.
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showExperimentColumn ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  const variantState = getVariantSelectionState(product.id);
                  const isIndeterminate = isSelected && !variantState.allSelected && variantState.selected > 0;
                  const productVariantSet = selectedVariants.get(product.id) || new Set();

                  const isExpanded = expandedProductId === product.id;
                  
                  return (
                    <React.Fragment key={product.id}>
                      <TableRow
                        className="cursor-pointer transition-colors hover:brightness-95 h-12"
                        style={{ backgroundColor: isExpanded ? "#F1EFE8" : undefined }}
                        onClick={() => toggleExpansion(product.id)}
                      >
                        <TableCell className="py-2 px-2 relative text-center">
                          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: columnHighlightOpacity, transition: "opacity 0.4s ease" }} />
                          <Checkbox
                            className="border-foreground/50"
                            checked={isSelected}
                            ref={(el) => {
                              if (el) {
                                if (isIndeterminate) {
                                  (el as HTMLButtonElement).dataset.state = "indeterminate";
                                } else if (isSelected) {
                                  (el as HTMLButtonElement).dataset.state = "checked";
                                } else {
                                  (el as HTMLButtonElement).dataset.state = "unchecked";
                                }
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (showExperimentColumn && product.hasActiveExperiment) { setBlockedProduct(product); return; }
                              toggleProduct(product.id, (e.currentTarget as HTMLElement).closest("tr"));
                            }}
                          />
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          <p className="text-sm font-semibold">{product.name}</p>
                          <p className="text-xs text-muted-foreground">Product ID: {product.productId}</p>
                        </TableCell>
                        <TableCell className="py-2 px-2">
                          {getStatusBadge(product.status)}
                        </TableCell>
                        <TableCell className="py-2 px-2 font-semibold">{product.quantity}</TableCell>
                        <TableCell className="py-2 px-2 font-semibold">${product.sellPrice.toFixed(2)}</TableCell>
                        <TableCell className="py-2 px-2 font-semibold relative">
                          <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: minPriceHighlightOpacity, transition: "opacity 0.4s ease" }} />
                          {showMinPriceInput ? (
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={getEffectiveProductMinPrice(product).toFixed(2)}
                              key={`product-min-${product.id}-${getEffectiveProductMinPrice(product)}`}
                              className="w-full h-7 text-sm font-semibold bg-background border-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              readOnly={showExperimentColumn && product.hasActiveExperiment}
                              onClick={(e) => { e.stopPropagation(); if (showExperimentColumn && product.hasActiveExperiment) { setBlockedProduct(product); return; } }}
                              onMouseEnter={() => notifyMinPriceHovered()}
                              onBlur={(e) => {
                                e.stopPropagation();
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) updateProductMinPrice(product, value);
                              }}
                            />
                          ) : (
                            `$${getEffectiveProductMinPrice(product).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-center px-2 font-semibold tabular-nums">
                          {isSelected && !variantState.allSelected
                            ? `${variantState.selected}/${variantState.total}`
                            : product.variantCount}
                        </TableCell>
                        {showExperimentColumn && (
                          <TableCell className="py-2 text-center px-2">
                            {product.hasActiveExperiment && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                Live
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="py-2 text-center px-0 cursor-pointer" onClick={() => toggleExpansion(product.id)}>
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4 shrink-0 mx-auto" />
                            : <ChevronRight className="h-4 w-4 shrink-0 mx-auto" />
                          }
                        </TableCell>
                      </TableRow>
                      
                      {/* Variants separator and rows - shown when product is expanded */}
                      {expandedProductId === product.id && (
                        <>
                          <TableRow className="h-8 border-b border-border" style={{ backgroundColor: "#F0EFE9" }}>
                            <TableCell className="py-0 w-10" />
                            <TableCell colSpan={showExperimentColumn ? 8 : 7} className="py-0 px-2 text-xs font-medium text-muted-foreground">
                              Variants
                            </TableCell>
                          </TableRow>
                          {product.variantList.map((variant, variantIndex) => {
                        const isVariantSelected = productVariantSet.has(variant.id);
                        const isLastVariant = variantIndex === product.variantList.length - 1;
                        return (
                          <TableRow
                            key={variant.id}
                            className={`cursor-pointer transition-colors hover:brightness-95 h-12 ${isLastVariant ? 'border-b-2 border-b-border' : ''}`}
                            style={{ backgroundColor: "#F7F6F3" }}
                            onClick={() => toggleVariant(product.id, variant.id)}
                          >
                            <TableCell className="py-1.5 px-2 border-r border-border relative">
                              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: variantHighlightOpacity, transition: "opacity 0.4s ease" }} />
                            </TableCell>
                            <TableCell className="py-1.5 pl-4 pr-2 border-r border-border relative">
                              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: variantHighlightOpacity, transition: "opacity 0.4s ease" }} />
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isVariantSelected}
                                  disabled={showExperimentColumn && product.hasActiveExperiment}
                                  onCheckedChange={() => toggleVariant(product.id, variant.id)}
                                  onClick={(e) => { e.stopPropagation(); if (showExperimentColumn && product.hasActiveExperiment) setBlockedProduct(product); }}
                                  className="bg-white shrink-0 border-foreground/50"
                                />
                                <div>
                                  <p className="text-sm font-medium">{variant.color} / {variant.size}</p>
                                  <p className="text-xs text-muted-foreground">Variant ID: {variant.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 px-2 border-r border-border">
                              {getStatusBadge(variant.status)}
                            </TableCell>
                            <TableCell className="py-1.5 px-2 border-r border-border">{variant.quantity}</TableCell>
                            <TableCell className="py-1.5 px-2 border-r border-border">${variant.price.toFixed(2)}</TableCell>
                            <TableCell className="py-1.5 px-2 border-r border-border relative">
                              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(253, 224, 71, 0.35)", opacity: minPriceHighlightOpacity, transition: "opacity 0.4s ease" }} />
                              {showMinPriceInput ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  defaultValue={(variantMinPrices.get(variant.id) ?? defaultMinPrice(variant.price)).toFixed(2)}
                                  key={`variant-min-${variant.id}-${variantMinPrices.get(variant.id) ?? defaultMinPrice(variant.price)}`}
                                  className="w-full h-7 text-sm bg-background border-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={showExperimentColumn && product.hasActiveExperiment}
                                  onClick={(e) => { e.stopPropagation(); if (showExperimentColumn && product.hasActiveExperiment) setBlockedProduct(product); }}
                                  onMouseEnter={() => notifyMinPriceHovered()}
                                  onBlur={(e) => {
                                    e.stopPropagation();
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) updateVariantMinPrice(variant.id, value, product);
                                  }}
                                />
                              ) : (
                                `$${(variantMinPrices.get(variant.id) ?? defaultMinPrice(variant.price)).toFixed(2)}`
                              )}
                            </TableCell>
                            <TableCell className="py-1.5 px-2 text-center border-r border-border">
                              <Badge variant="outline" className="text-xs text-muted-foreground border-border">Variant</Badge>
                            </TableCell>
                            {showExperimentColumn && <TableCell className="py-1.5 text-center px-2 border-r border-border" />}
                            <TableCell className="py-1.5 px-0" />
                          </TableRow>
                        );
                      })}
                        </>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 flex-shrink-0 border rounded-b-lg bg-background">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({sortedProducts.length} products)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      </TooltipProvider>

      {/* Blocked deselection warning — product is live in an active experiment */}
      <Dialog open={!!blockedProduct} onOpenChange={(open) => !open && setBlockedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-semibold">
              This Product Cannot be Edited
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground px-1">
              <p>This product is live in an active experiment and cannot be edited.</p>
              <p>Please contact your Matter representative for assistance.</p>
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setBlockedProduct(null)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
