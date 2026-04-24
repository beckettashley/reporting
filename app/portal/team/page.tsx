"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "Owner" | "Member";
  status: "Active" | "Invited" | "Inactive";
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: "John Smith", email: "owner@company.com", role: "Owner", status: "Active" },
  { id: 2, name: "Alice Johnson", email: "alice@company.com", role: "Member", status: "Active" },
  { id: 3, name: "", email: "pending@company.com", role: "Member", status: "Invited" },
];

export default function TeamPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [newEmail, setNewEmail] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize edit form when member selected
  useEffect(() => {
    if (selectedMember) {
      setEditName(selectedMember.name);
      setEditEmail(selectedMember.email);
      setHasChanges(false);
    }
  }, [selectedMember]);

  // Check for changes
  useEffect(() => {
    if (selectedMember) {
      const changed = 
        editName !== selectedMember.name ||
        editEmail !== selectedMember.email;
      setHasChanges(changed);
    }
  }, [editName, editEmail, selectedMember]);

  const handleInviteMember = () => {
    if (newEmail) {
      setMembers([
        ...members,
        {
          id: Math.max(...members.map(m => m.id), 0) + 1,
          name: "",
          email: newEmail,
          role: "Member",
          status: "Invited",
        },
      ]);
      toast({
        title: "Invite sent",
        description: `Invitation sent to ${newEmail}`,
      });
      setNewEmail("");
    }
  };

  const handleUpdateMember = () => {
    if (selectedMember) {
      setMembers(members.map(m => 
        m.id === selectedMember.id 
          ? { ...m, name: editName, email: editEmail }
          : m
      ));
      setSelectedMember(null);
    }
  };

  const handleResendInvite = () => {
    toast({
      title: "Invite resent",
      description: `Invitation resent to ${selectedMember?.email}`,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "Invited":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      case "Inactive":
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Team</h1>
      </div>

      <div className="space-y-6">
        {/* Invite Member Section */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Invite Team Member</h3>
          
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="user@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
              />
            </div>
            <Button onClick={handleInviteMember} className="gap-2">
              <Send className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </Card>

        {/* Team Members Table */}
        <Card className="py-0 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-muted/50">
                <TableHead className="h-9 text-xs w-24">Status</TableHead>
                <TableHead className="h-9 text-xs flex-1">Email</TableHead>
                <TableHead className="h-9 text-xs">Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow 
                  key={member.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedMember(member)}
                >
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeColor(member.status)}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {member.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* User Edit Modal */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription className="sr-only">Edit team member details and permissions</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="flex-1"
                  />
                  {selectedMember.status === "Invited" && (
                    <Button variant="outline" onClick={handleResendInvite} className="gap-2">
                      <Send className="w-4 h-4" />
                      Resend
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setSelectedMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMember} disabled={!hasChanges}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
