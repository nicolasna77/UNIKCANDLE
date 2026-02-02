"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { BanUserForm } from "@/components/admin/BanUserForm";
import type { User } from "./types";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <CreateUserForm
          onSuccess={() => {
            onOpenChange(false);
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onBan: (data: { userId: string; reason: string; expiresIn?: number }) => void;
}

export function BanUserDialog({
  open,
  onOpenChange,
  user,
  onBan,
}: BanUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bannir l&apos;utilisateur</DialogTitle>
        </DialogHeader>
        <BanUserForm
          user={user}
          onSuccess={() => onOpenChange(false)}
          onBan={(banData) =>
            onBan({
              userId: user.id,
              reason: banData.reason,
              expiresIn: banData.expirationDate
                ? Math.floor(
                    (banData.expirationDate.getTime() - new Date().getTime()) /
                      1000
                  )
                : undefined,
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
