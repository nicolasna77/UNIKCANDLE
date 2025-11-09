"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { processRefund } from "@/app/actions/returns";
import { toast } from "sonner";
import type { ReturnItemWithDetails } from "@/services/returns";

const refundSchema = z.object({
  refundAmount: z.coerce
    .number()
    .min(0.01, "Le montant doit être supérieur à 0"),
});

type RefundFormData = z.infer<typeof refundSchema>;

interface RefundDialogProps {
  returnItem: ReturnItemWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({
  returnItem,
  open,
  onOpenChange,
}: RefundDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      refundAmount: returnItem?.orderItem.price || 0,
    },
  });

  // Mettre à jour le montant par défaut quand returnItem change
  if (returnItem && form.getValues("refundAmount") === 0) {
    form.setValue("refundAmount", returnItem.orderItem.price);
  }

  const processRefundMutation = useMutation<
    { message?: string },
    Error,
    { id: string; refundAmount?: number }
  >({
    mutationFn: async ({ id, refundAmount }) => {
      const result = await processRefund(id, refundAmount);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors du remboursement");
      }
      return result.data as { message?: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      toast.success("Remboursement traité avec succès");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: RefundFormData) => {
    if (!returnItem) return;

    await processRefundMutation.mutateAsync({
      id: returnItem.id,
      refundAmount: values.refundAmount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remboursement Stripe</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="refundAmount">Montant du remboursement (€)</Label>
            <Input
              id="refundAmount"
              type="number"
              step="0.01"
              min="0"
              {...form.register("refundAmount")}
            />
            {form.formState.errors.refundAmount && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.refundAmount.message}
              </p>
            )}
            {returnItem && (
              <p className="text-sm text-muted-foreground mt-1">
                Montant original: {returnItem.orderItem.price.toFixed(2)}€
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processRefundMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={processRefundMutation.isPending}>
              {processRefundMutation.isPending
                ? "Traitement..."
                : "Effectuer le remboursement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
