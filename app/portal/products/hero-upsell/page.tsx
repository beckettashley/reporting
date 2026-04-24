"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  productId: string;
  quantity: number;
  sellPrice: number;
  minPrice: number;
  variants: number;
  status: "Active" | "Draft" | "Archived";
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

const generateDummyProducts = (): Product[] => {
  const products: Product[] = [];
  const statuses: ("Active" | "Draft" | "Archived")[] = ["Active", "Draft", "Archived"];
  const names = [
    "Classic Cotton Tee", "Canvas Backpack", "Baseball Cap", "Premium Hoodie",
    "Slim Fit Jeans", "Wool Beanie", "Cashmere Sweater", "Bucket Hat",
    "Duffle Bag", "Bomber Jacket", "Newsboy Cap", "Leather Wallet",
  ];

  for (let i = 0; i < 500; i++) {
    const sellPrice = Math.round(seededRandom(i * 2) * 150 * 100) / 100;
    const minPrice = roundToHalfDollar(sellPrice * 0.9); // 10% less, rounded to nearest $0.50
    
    products.push({
      id: `product-${i}`,
      name: `${names[i % names.length]} ${i}`,
      productId: `PROD-${String(i).padStart(5, "0")}`,
      quantity: Math.floor(seededRandom(i * 1) * 500) + 10,
      sellPrice,
      minPrice,
      variants: Math.floor(seededRandom(i * 4) * 8) + 1,
      status: statuses[Math.floor(seededRandom(i * 5) * statuses.length)],
    });
  }

  return products;
};

type PickerType = "hero" | "upsell" | null;

export default function ProductsPage() {
  const { toast } = useToast();
  const [allProducts] = useState<Product[]>(generateDummyProducts());
  const [heroProducts, setHeroProducts] = useState<Product[]>([
    allProducts[0],
    allProducts[5],
    allProducts[12],
  ]);
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([
    allProducts[1],
    allProducts[3],
    allProducts[7],
    allProducts[9],
    allProducts[15],
    allProducts[20],
    allProducts[25],
    allProducts[30],
  ]);

  const [pickerType, setPickerType] = useState<PickerType>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerPage, setPickerPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [minPriceEdits, setMinPriceEdits] = useState<Record<string, number>>({});
  const [upsellPage, setUpsellPage] = useState(1);
  const [heroSortKey, setHeroSortKey] = useState<string | null>(null);
  const [heroSortDir, setHeroSortDir] = useState<"asc" | "desc">("asc");
  const [upsellSortKey, setUpsellSortKey] = useState<string | null>(null);
  const [upsellSortDir, setUpsellSortDir] = useState<"asc" | "desc">("asc");
  const pickerPageSize = 20;
  const upsellPageSize = 10;

  // Sort function
  const sortProducts = (products: Product[], sortKey: string | null, sortDir: "asc" | "desc") => {
    if (!sortKey) return products;
    return [...products].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      switch (sortKey) {
        case "status": aVal = a.status; bVal = b.status; break;
        case "name": aVal = a.name; bVal = b.name; break;
        case "quantity": aVal = a.quantity; bVal = b.quantity; break;
        case "sellPrice": aVal = a.sellPrice; bVal = b.sellPrice; break;
        case "minPrice": aVal = a.minPrice; bVal = b.minPrice; break;
        case "variants": aVal = a.variants; bVal = b.variants; break;
      }
      if (typeof aVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  };

  // Sorted products
  const sortedHeroProducts = sortProducts(heroProducts, heroSortKey, heroSortDir);
  const sortedUpsellProducts = sortProducts(upsellProducts, upsellSortKey, upsellSortDir);

  // Sort handlers
  const handleHeroSort = (key: string) => {
    if (heroSortKey === key) {
      setHeroSortDir(heroSortDir === "asc" ? "desc" : "asc");
    } else {
      setHeroSortKey(key);
      setHeroSortDir("asc");
    }
  };

  const handleUpsellSort = (key: string) => {
    if (upsellSortKey === key) {
      setUpsellSortDir(upsellSortDir === "asc" ? "desc" : "asc");
    } else {
      setUpsellSortKey(key);
      setUpsellSortDir("asc");
    }
  };

  // Filtered products for picker
  const filteredPickerProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
    p.productId.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const totalPickerPages = Math.ceil(filteredPickerProducts.length / pickerPageSize);
  const paginatedPickerProducts = filteredPickerProducts.slice(
    (pickerPage - 1) * pickerPageSize,
    pickerPage * pickerPageSize
  );

  // Upsell pagination (use sorted products)
  const totalUpsellPages = Math.ceil(sortedUpsellProducts.length / upsellPageSize);
  const paginatedUpsells = sortedUpsellProducts.slice(
    (upsellPage - 1) * upsellPageSize,
    upsellPage * upsellPageSize
  );

  // Check if all filtered products on current page are selected
  const allFilteredSelected = paginatedPickerProducts.every((p) => selectedIds.has(p.id));
  const someFilteredSelected = paginatedPickerProducts.some((p) => selectedIds.has(p.id)) && !allFilteredSelected;

  const toggleSelectAllFiltered = () => {
    const newSet = new Set(selectedIds);
    if (allFilteredSelected) {
      // Deselect all filtered products on current page
      paginatedPickerProducts.forEach((p) => newSet.delete(p.id));
    } else {
      // Select all filtered products on current page
      paginatedPickerProducts.forEach((p) => newSet.add(p.id));
    }
    setSelectedIds(newSet);
  };

  const toggleProductSelection = (productId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      // Check if we're at the limit for hero products
      if (pickerType === "hero" && newSet.size >= 5) {
        toast({
          title: "Maximum hero products reached",
          description: "You can select up to 5 hero products. Deselect a product to add another.",
          variant: "destructive",
        });
        return;
      }
      newSet.add(productId);
    }
    setSelectedIds(newSet);
  };

  const openPicker = (type: PickerType) => {
    setPickerType(type);
    setPickerSearch("");
    setPickerPage(1);
    
    const currentSelection = type === "hero" ? heroProducts : upsellProducts;
    setSelectedIds(new Set(currentSelection.map((p) => p.id)));
  };

  const closePicker = () => {
    setPickerType(null);
    setSelectedIds(new Set());
    setMinPriceEdits({});
  };

  const savePicker = () => {
    const selectedProducts = allProducts
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({
        ...p,
        minPrice: minPriceEdits[p.id] !== undefined ? minPriceEdits[p.id] : p.minPrice,
      }));

    if (pickerType === "hero") {
      setHeroProducts(selectedProducts);
    } else {
      setUpsellProducts(selectedProducts);
      setUpsellPage(1);
    }
    closePicker();
  };

  const updateMinPrice = (productId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setMinPriceEdits((prev) => ({
        ...prev,
        [productId]: numValue,
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">Active</Badge>;
      case "Draft":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">Draft</Badge>;
      case "Archived":
        return <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">Archived</Badge>;
      default:
        return null;
    }
  };

  // Shared table row component
  const ProductRow = ({ 
    product, 
    showCheckbox = false, 
    isSelected = false, 
    onToggle, 
    disabled = false,
    editable = false,
  }: {
    product: Product;
    showCheckbox?: boolean;
    isSelected?: boolean;
    onToggle?: () => void;
    disabled?: boolean;
    editable?: boolean;
  }) => {
    const displayMinPrice = editable && minPriceEdits[product.id] !== undefined 
      ? minPriceEdits[product.id] 
      : product.minPrice;

    return (
      <TableRow 
        className={showCheckbox && !disabled ? "cursor-pointer hover:bg-muted/50" : ""}
        onClick={() => showCheckbox && !disabled && onToggle?.()}
      >
        {showCheckbox && (
          <TableCell className="py-2 w-12">
            <Checkbox
              checked={isSelected}
              disabled={disabled}
              onCheckedChange={() => !disabled && onToggle?.()}
              onClick={(e) => e.stopPropagation()}
            />
          </TableCell>
        )}
        <TableCell className="py-2">{getStatusBadge(product.status)}</TableCell>
        <TableCell className="py-2">
          <div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.productId}</p>
          </div>
        </TableCell>
        <TableCell className="py-2">{product.quantity}</TableCell>
        <TableCell className="py-2">${product.sellPrice.toFixed(2)}</TableCell>
        <TableCell className="py-2">
          {editable ? (
            <Input
              type="number"
              step="0.50"
              value={displayMinPrice.toFixed(2)}
              onChange={(e) => {
                e.stopPropagation();
                updateMinPrice(product.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-24"
            />
          ) : (
            `$${displayMinPrice.toFixed(2)}`
          )}
        </TableCell>
        <TableCell className="py-2">{product.variants}</TableCell>
      </TableRow>
    );
  };

  // Shared table header component
  const ProductTableHeader = ({ 
    showCheckbox = false, 
    showSelectAll = false, 
    allSelected = false, 
    someSelected = false, 
    onSelectAll,
    sortKey,
    sortDir,
    onSort,
  }: {
    showCheckbox?: boolean;
    showSelectAll?: boolean;
    allSelected?: boolean;
    someSelected?: boolean;
    onSelectAll?: () => void;
    sortKey?: string | null;
    sortDir?: "asc" | "desc";
    onSort?: (key: string) => void;
  }) => {
    const getSortIcon = (key: string) => {
      if (sortKey !== key) return null;
      if (sortDir === "asc") return <ArrowUp className="w-4 h-4 ml-1" />;
      return <ArrowDown className="w-4 h-4 ml-1" />;
    };

    const handleSort = (key: string) => {
      if (onSort) onSort(key);
    };

    return (
      <TableHeader className="bg-muted/50">
        <TableRow className="hover:bg-muted/50">
          {showCheckbox && (
            <TableHead className="h-9 text-xs w-12">
              {showSelectAll && (
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement).dataset.state = someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked";
                    }
                  }}
                  onCheckedChange={onSelectAll}
                />
              )}
            </TableHead>
          )}
          <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("status")}>
            <div className="flex items-center">Status{getSortIcon("status")}</div>
          </TableHead>
          <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("name")}>
            <div className="flex items-center">Product{getSortIcon("name")}</div>
          </TableHead>
          <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("quantity")}>
            <div className="flex items-center">Quantity{getSortIcon("quantity")}</div>
          </TableHead>
          <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("sellPrice")}>
            <div className="flex items-center">Sell Price{getSortIcon("sellPrice")}</div>
          </TableHead>
          <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("minPrice")}>
            <div className="flex items-center">Min Price{getSortIcon("minPrice")}</div>
          </TableHead>
          <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("variants")}>
            <div className="flex items-center">Variants{getSortIcon("variants")}</div>
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  };

  return (
    <main className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Products (Hero + Upsell)</h1>
      </div>

      {/* Hero Products Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Hero Products</h2>
          <Button onClick={() => openPicker("hero")} variant="outline" size="sm" className="gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Products
          </Button>
        </div>
        <Card className="overflow-hidden py-0">
          <Table>
          <ProductTableHeader sortKey={heroSortKey} sortDir={heroSortDir} onSort={handleHeroSort} />
          <TableBody>
            {sortedHeroProducts.length > 0 ? (
              sortedHeroProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hero products selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      </div>

      {/* Upsell Products Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Upsell Products</h2>
          <Button onClick={() => openPicker("upsell")} variant="outline" size="sm" className="gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Products
          </Button>
        </div>
        <Card className="overflow-hidden py-0">
          <Table>
          <ProductTableHeader sortKey={upsellSortKey} sortDir={upsellSortDir} onSort={handleUpsellSort} />
          <TableBody>
            {paginatedUpsells.length > 0 ? (
              paginatedUpsells.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No upsell products selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalUpsellPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {upsellPage} of {totalUpsellPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpsellPage(Math.max(1, upsellPage - 1))}
                disabled={upsellPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUpsellPage(Math.min(totalUpsellPages, upsellPage + 1))}
                disabled={upsellPage === totalUpsellPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>

      {/* Product Picker Modal */}
      <Dialog open={!!pickerType} onOpenChange={(open) => !open && closePicker()}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {pickerType === "hero" ? "Select Hero Products" : "Select Upsell Products"}
            </DialogTitle>
            <DialogDescription>
              {pickerType === "hero"
                ? `Choose up to 5 products. ${selectedIds.size} of 5 selected.`
                : `Choose products to include in offers. ${selectedIds.size} selected.`}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={pickerSearch}
              onChange={(e) => {
                setPickerSearch(e.target.value);
                setPickerPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto border rounded-lg">
            <Table>
              <ProductTableHeader 
                showCheckbox 
                showSelectAll={pickerType === "upsell"}
                allSelected={allFilteredSelected}
                someSelected={someFilteredSelected}
                onSelectAll={toggleSelectAllFiltered}
              />
              <TableBody>
                {paginatedPickerProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  const isDisabled = pickerType === "hero" && !isSelected && selectedIds.size >= 5;

                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      showCheckbox
                      isSelected={isSelected}
                      onToggle={() => toggleProductSelection(product.id)}
                      disabled={isDisabled}
                      editable={true}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPickerPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(pickerPage - 1) * pickerPageSize + 1} to{" "}
                {Math.min(pickerPage * pickerPageSize, filteredPickerProducts.length)} of{" "}
                {filteredPickerProducts.length}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPickerPage((p) => Math.max(1, p - 1))}
                  disabled={pickerPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPickerPage((p) => Math.min(totalPickerPages, p + 1))}
                  disabled={pickerPage === totalPickerPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closePicker}>
              Cancel
            </Button>
            <Button onClick={savePicker}>
              Save Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
