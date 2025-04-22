"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { BanForm } from "@/types";

interface BanUserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  banData: {
    userId: string;
    reason: string;
    expirationDate?: Date;
  };
  onBanDataChange: (data: BanForm) => void;
}

export function BanUserForm({
  isOpen,
  onOpenChange,
  onSubmit,
  banData,
  onBanDataChange,
}: BanUserFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bannir un utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="userId" value={banData.userId} />
          <div>
            <Label htmlFor="reason">Raison</Label>
            <Input
              id="reason"
              name="reason"
              value={banData.reason}
              onChange={(e) =>
                onBanDataChange({ ...banData, reason: e.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="expirationDate">Date d&apos;expiration</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="expirationDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !banData.expirationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {banData.expirationDate ? (
                    format(banData.expirationDate, "PPP")
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={banData.expirationDate}
                  onSelect={(date) => {
                    onBanDataChange({ ...banData, expirationDate: date });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit">Bannir l&apos;utilisateur</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
