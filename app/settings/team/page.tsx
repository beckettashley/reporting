"use client";

import { useState } from "react";
import { useOnboarding } from "@/lib/onboarding-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  status: "active" | "pending";
}

const getRoleBadge = (role: TeamMember["role"]) => {
  switch (role) {
    case "owner":
      return <Badge className="text-xs">Owner</Badge>;
    case "member":
      return <Badge variant="outline" className="text-xs">Member</Badge>;
  }
};

const getStatusBadge = (status: TeamMember["status"]) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
          Pending
        </Badge>
      );
  }
};

export default function TeamSettingsPage() {
  const { state } = useOnboarding();
  const { account } = state;

  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: account?.fullName || "Account Owner", email: account?.email || "owner@example.com", role: "owner", status: "active" },
    { id: "2", name: "Sarah Chen", email: "sarah@example.com", role: "member", status: "active" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", role: "member", status: "active" },
    { id: "4", name: "Emily Davis", email: "emily@example.com", role: "member", status: "pending" },
    { id: "5", name: "Alex Thompson", email: "alex@example.com", role: "member", status: "active" },
    { id: "6", name: "Jordan Lee", email: "jordan@example.com", role: "member", status: "active" },
    { id: "7", name: "Taylor Morgan", email: "taylor@example.com", role: "member", status: "pending" },
  ]);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof TeamMember | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inviteSentModalOpen, setInviteSentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"owner" | "member">("member");

  // Filter, sort, paginate
  const filteredMembers = members.filter((m) => {
    const searchLower = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(searchLower) ||
      m.email.toLowerCase().includes(searchLower) ||
      m.role.toLowerCase().includes(searchLower) ||
      m.status.toLowerCase().includes(searchLower)
    );
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMembers.length / pageSize);
  const paginatedMembers = sortedMembers.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: keyof TeamMember) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormRole(member.role);
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const openInviteModal = () => {
    setSelectedMember(null);
    setFormName("");
    setFormEmail("");
    setFormRole("member");
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const openDeleteModal = (member: TeamMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMember(member);
    setDeleteModalOpen(true);
  };

  const handleSave = () => {
    if (isCreating) {
      const newMember: TeamMember = {
        id: `${Date.now()}`,
        name: formName,
        email: formEmail,
        role: formRole,
        status: "pending",
      };
      setMembers([...members, newMember]);
      setEditModalOpen(false);
      setInviteSentModalOpen(true);
    } else if (selectedMember) {
      setMembers(
        members.map((m) =>
          m.id === selectedMember.id
            ? { ...m, name: formName, email: formEmail, role: formRole }
            : m
        )
      );
      setEditModalOpen(false);
    }
  };

  const handleDelete = () => {
    if (selectedMember) {
      setMembers(members.filter((m) => m.id !== selectedMember.id));
      setDeleteModalOpen(false);
      setEditModalOpen(false);
      setSelectedMember(null);
    }
  };

  const handleResetPassword = () => {
    if (selectedMember) {
      alert(`Password reset email sent to ${selectedMember.email}`);
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof TeamMember }) => {
    if (sortKey !== columnKey) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 inline" />
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Team Members</h1>
        <Button onClick={openInviteModal}>
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="py-0 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("status")}>
                Status<SortIcon columnKey="status" />
              </TableHead>
              <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("name")}>
                Name<SortIcon columnKey="name" />
              </TableHead>
              <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("email")}>
                Email<SortIcon columnKey="email" />
              </TableHead>
              <TableHead className="h-9 text-xs cursor-pointer select-none" onClick={() => handleSort("role")}>
                Role<SortIcon columnKey="role" />
              </TableHead>
              <TableHead className="h-9 text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openEditModal(member)}
                >
                  <TableCell className="py-2">{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="py-2 font-medium">{member.name}</TableCell>
                  <TableCell className="py-2">{member.email}</TableCell>
                  <TableCell className="py-2">{getRoleBadge(member.role)}</TableCell>
                  <TableCell className="py-2 text-right">
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => openDeleteModal(member, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedMembers.length)} of {sortedMembers.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCreating ? "Invite Team Member" : "Edit Team Member"}</DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Send an invitation to join your team."
                : "Update team member details or manage their account."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            {!isCreating && selectedMember?.role !== "owner" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="role">Role</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as "owner" | "member")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isCreating && selectedMember?.role !== "owner" && (
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={handleResetPassword}>
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setEditModalOpen(false);
                    setDeleteModalOpen(true);
                  }}
                >
                  Delete User
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formName || !formEmail}>
              {isCreating ? "Send Invite" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name} from your team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Sent Confirmation Modal */}
      <Dialog open={inviteSentModalOpen} onOpenChange={setInviteSentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation Sent</DialogTitle>
            <DialogDescription>
              An invitation email has been sent to {formEmail}. They will receive instructions to join your team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setInviteSentModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
