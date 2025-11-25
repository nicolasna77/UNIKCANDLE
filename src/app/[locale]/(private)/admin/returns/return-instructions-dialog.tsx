"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReturnStatus } from "@/app/actions/returns";
import { toast } from "sonner";
import type { ReturnItemWithDetails } from "@/services/returns";

const returnInstructionsSchema = z.object({
  returnInstructions: z.string().min(1, "Les instructions sont requises"),
  returnAddress: z.string().min(1, "L'adresse de retour est requise"),
  returnDeadline: z.string().min(1, "La date limite est requise"),
});

type ReturnInstructionsFormData = z.infer<typeof returnInstructionsSchema>;

interface ReturnInstructionsDialogProps {
  returnItem: ReturnItemWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReturnInstructionsDialog({
  returnItem,
  open,
  onOpenChange,
}: ReturnInstructionsDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ReturnInstructionsFormData>({
    resolver: zodResolver(returnInstructionsSchema),
    defaultValues: {
      returnInstructions: "",
      returnAddress: "",
      returnDeadline: "",
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (variables: { id: string; data: unknown }) => {
      const result = await updateReturnStatus(variables.id, variables.data);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      toast.success("Instructions de renvoi envoyées");
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: ReturnInstructionsFormData) => {
    if (!returnItem) return;

    await updateStatusMutation.mutateAsync({
      id: returnItem.id,
      data: {
        status: returnItem.status,
        returnInstructions: values.returnInstructions,
        returnAddress: values.returnAddress,
        returnDeadline: values.returnDeadline,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Instructions de renvoi</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="returnInstructions">
              Instructions pour le client
            </Label>
            <Textarea
              id="returnInstructions"
              placeholder="Instructions détaillées pour le renvoi..."
              rows={4}
              {...form.register("returnInstructions")}
            />
            {form.formState.errors.returnInstructions && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.returnInstructions.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="returnAddress">Adresse de retour</Label>
            <Textarea
              id="returnAddress"
              placeholder="Adresse complète pour le renvoi..."
              rows={3}
              {...form.register("returnAddress")}
            />
            {form.formState.errors.returnAddress && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.returnAddress.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="returnDeadline">Date limite de renvoi</Label>
            <Input
              id="returnDeadline"
              type="date"
              {...form.register("returnDeadline")}
            />
            {form.formState.errors.returnDeadline && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.returnDeadline.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateStatusMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending
                ? "Envoi..."
                : "Envoyer les instructions"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
