"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ExternalLink, Pencil, Trash2, FolderOpen, Link2 } from "lucide-react";

interface AssetLink {
  id: string;
  label: string;
  url: string;
  type: string;
}

const INITIAL_ASSETS: AssetLink[] = [
  {
    id: "1",
    label: "Product Photos",
    url: "https://drive.google.com/drive/folders/abc123",
    type: "Google Drive",
  },
  {
    id: "2",
    label: "Brand Assets",
    url: "https://www.dropbox.com/sh/xyz789",
    type: "Dropbox",
  },
];

export default function AssetsSettingsPage() {
  const [assets, setAssets] = useState<AssetLink[]>(INITIAL_ASSETS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", url: "", type: "" });

  const detectType = (url: string): string => {
    if (url.includes("drive.google.com")) return "Google Drive";
    if (url.includes("dropbox.com")) return "Dropbox";
    if (url.includes("box.com")) return "Box";
    if (url.includes("onedrive")) return "OneDrive";
    if (url.includes("sharepoint")) return "SharePoint";
    if (url.includes("wetransfer")) return "WeTransfer";
    if (url.includes("notion")) return "Notion";
    return "Link";
  };

  const handleOpenModal = (asset?: AssetLink) => {
    if (asset) {
      setEditingId(asset.id);
      setForm({ label: asset.label, url: asset.url, type: asset.type });
    } else {
      setEditingId(null);
      setForm({ label: "", url: "", type: "" });
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.url.trim()) return;

    const type = form.type || detectType(form.url);

    if (editingId) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingId ? { ...a, label: form.label, url: form.url, type } : a
        )
      );
    } else {
      setAssets((prev) => [
        ...prev,
        { id: `asset-${Date.now()}`, label: form.label, url: form.url, type },
      ]);
    }

    setModalOpen(false);
    setForm({ label: "", url: "", type: "" });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Asset Links</h1>
      </div>

      <div className="flex flex-col gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">External Asset Locations</CardTitle>
              </div>
              <Button size="sm" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FolderOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-4">No asset links yet</h3>
                <Button variant="outline" size="sm" onClick={() => handleOpenModal()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first link
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.label}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted text-xs">
                          <Link2 className="w-3 h-3" />
                          {asset.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
                        >
                          {asset.url}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleOpenModal(asset)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Asset Link" : "Add Asset Link"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the details for this asset link."
                : "Add a link to an external folder or resource."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                placeholder="e.g. Product Photos, Brand Assets"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://drive.google.com/..."
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={!form.label.trim() || !form.url.trim()}
            >
              {editingId ? "Save Changes" : "Add Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
