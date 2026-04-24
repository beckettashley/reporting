"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Trash2, Eye, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Link2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AssetFile {
  id: string;
  fileName: string;
  uploadedDate: string;
  uploadedTimestamp: number;
  type: "Brand Guidelines" | "Research" | "Press Feature" | "Product Information" | "Creative Assets" | "Other";
  assetType: "file" | "link";
  url?: string;
}

const ASSET_TYPES = [
  "Brand Guidelines",
  "Research",
  "Press Feature",
  "Product Information",
  "Creative Assets",
  "Other",
] as const;

const DUMMY_ASSETS: AssetFile[] = [
  { id: "asset-1", fileName: "brand-guidelines-2024.pdf", uploadedDate: "Apr 5, 2026 2:30 PM PDT", uploadedTimestamp: 1712350200000, type: "Brand Guidelines", assetType: "file" },
  { id: "asset-2", fileName: "product-catalog.pdf", uploadedDate: "Apr 3, 2026 10:15 AM PDT", uploadedTimestamp: 1712163300000, type: "Product Information", assetType: "file" },
  { id: "asset-3", fileName: "market-research-q1.xlsx", uploadedDate: "Apr 1, 2026 4:45 PM PDT", uploadedTimestamp: 1711928700000, type: "Research", assetType: "file" },
  { id: "asset-4", fileName: "press-release-launch.docx", uploadedDate: "Mar 28, 2026 11:20 AM PDT", uploadedTimestamp: 1711645200000, type: "Press Feature", assetType: "file" },
  { id: "asset-5", fileName: "logo-assets.zip", uploadedDate: "Mar 25, 2026 9:00 AM PDT", uploadedTimestamp: 1711375200000, type: "Brand Guidelines", assetType: "file" },
  { id: "asset-6", fileName: "Product Photos", uploadedDate: "Mar 22, 2026 3:30 PM PDT", uploadedTimestamp: 1711145400000, type: "Product Information", assetType: "link", url: "https://drive.google.com/drive/folders/abc123" },
  { id: "asset-7", fileName: "product-specs-v2.xlsx", uploadedDate: "Mar 20, 2026 10:00 AM PDT", uploadedTimestamp: 1710943200000, type: "Product Information", assetType: "file" },
  { id: "asset-8", fileName: "media-kit.pdf", uploadedDate: "Mar 18, 2026 2:15 PM PDT", uploadedTimestamp: 1710793500000, type: "Press Feature", assetType: "file" },
];

type SortDirection = "asc" | "desc" | null;

export default function BrandAssetsPage() {
  const [assets, setAssets] = useState<AssetFile[]>(DUMMY_ASSETS);
  const [previewAsset, setPreviewAsset] = useState<AssetFile | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState<AssetFile["type"]>("Other");
  const pageSize = 20;

  // Filter
  const filteredAssets = useMemo(() => {
    if (!search.trim()) return assets;
    const searchLower = search.toLowerCase();
    return assets.filter((asset) =>
      asset.fileName.toLowerCase().includes(searchLower) ||
      asset.type.toLowerCase().includes(searchLower)
    );
  }, [assets, search]);

  // Sort
  const sortedAssets = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredAssets;
    return [...filteredAssets].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";
      if (sortKey === "fileName") {
        aVal = a.fileName.toLowerCase();
        bVal = b.fileName.toLowerCase();
      } else if (sortKey === "uploadedTimestamp") {
        aVal = a.uploadedTimestamp;
        bVal = b.uploadedTimestamp;
      } else if (sortKey === "type") {
        aVal = a.type.toLowerCase();
        bVal = b.type.toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedAssets.length / pageSize);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAssets.slice(start, start + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") { setSortKey(null); setSortDirection(null); }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    if (sortDirection === "asc") return <ArrowUp className="w-4 h-4 ml-1" />;
    return <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const now = Date.now();
    const newAssets = Array.from(files).map((file, index) => ({
      id: `asset-${now}-${index}`,
      fileName: file.name,
      uploadedDate: new Date().toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
        timeZone: "America/Los_Angeles", timeZoneName: "short",
      }),
      uploadedTimestamp: now,
      type: "Other" as const,
      assetType: "file" as const,
    }));
    setAssets([...newAssets, ...assets]);
    setCurrentPage(1);
  };

  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    
    const now = Date.now();
    const newLink: AssetFile = {
      id: `link-${now}`,
      fileName: url,
      uploadedDate: new Date().toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
        timeZone: "America/Los_Angeles", timeZoneName: "short",
      }),
      uploadedTimestamp: now,
      type: linkType,
      assetType: "link",
      url,
    };
    
    setAssets([newLink, ...assets]);
    setLinkUrl("");
    setLinkType("Other");
    setCurrentPage(1);
  };

  const handleTypeChange = (assetId: string, newType: AssetFile["type"]) => {
    setAssets(assets.map((asset) => asset.id === assetId ? { ...asset, type: newType } : asset));
  };

  const handleDelete = (assetId: string) => {
    setAssets(assets.filter((asset) => asset.id !== assetId));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Assets</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* File Upload */}
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Upload brand assets</p>
              <p className="text-xs text-muted-foreground mt-1">Select multiple files to upload</p>
            </div>
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
                <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </Button>
          </div>
        </Card>

        {/* Link Input */}
        <Card className="p-6">
          <div className="grid grid-cols-[1fr_200px_auto] gap-2">
            <Input
              placeholder="Paste a link to a file or folder (Google Drive, Notion, Dropbox, etc.)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
            />
            <Select value={linkType} onValueChange={(value) => setLinkType(value as AssetFile["type"])}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddLink} disabled={!linkUrl.trim()} className="gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search assets..." className="pl-9" />
        </div>

        {/* Assets Table */}
        {paginatedAssets.length > 0 ? (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="grid grid-cols-[1fr_200px_auto] gap-0 bg-muted/50 border-b h-9">
                    <div className="flex items-center px-4 py-2 text-xs font-medium cursor-pointer select-none" onClick={() => handleSort("fileName")}>
                      File{getSortIcon("fileName")}
                    </div>
                    <div className="flex items-center px-4 py-2 text-xs font-medium cursor-pointer select-none" onClick={() => handleSort("type")}>
                      Type{getSortIcon("type")}
                    </div>
                    <div className="flex items-center justify-end px-4 py-2 text-xs font-medium">Actions</div>
                  </div>
                  {paginatedAssets.map((asset) => (
                    <div key={asset.id} className="grid grid-cols-[1fr_200px_auto] gap-0 border-b last:border-0 hover:bg-muted/30">
                      <div className="flex items-center gap-2 px-4 py-2">
                        {asset.assetType === "link" ? (
                          <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="flex flex-col">
                          {asset.assetType === "link" && asset.url ? (
                            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-sm">
                              {asset.fileName}
                            </a>
                          ) : (
                            <span className="text-sm">{asset.fileName}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{asset.uploadedDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center px-4 py-2">
                        <Select value={asset.type} onValueChange={(value) => handleTypeChange(asset.id, value as AssetFile["type"])}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-end px-4 py-2 gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setPreviewAsset(asset)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedAssets.length)} of {sortedAssets.length} results
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next<ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No assets found</div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.fileName}</DialogTitle>
            <DialogDescription className="sr-only">Preview of {previewAsset?.fileName}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Uploaded:</span><span className="ml-2">{previewAsset?.uploadedDate}</span></div>
              <div><span className="text-muted-foreground">Type:</span><span className="ml-2">{previewAsset?.type}</span></div>
            </div>
            <div className="flex items-center justify-center p-12 bg-muted rounded-md">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">File preview not available</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
