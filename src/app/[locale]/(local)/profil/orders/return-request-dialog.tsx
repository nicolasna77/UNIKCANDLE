"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Info, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReturn } from "@/app/actions/returns";
import { toast } from "sonner";

interface ReturnRequestDialogProps {
  orderItem: {
    id: string;
    product: {
      name: string;
    };
    scent: {
      name: string;
    };
  };
  order: {
    id: string;
  };
}

const returnSchema = z.object({
  reason: z.string().min(1, "Veuillez sélectionner une raison"),
  description: z.string().optional(),
});

const returnReasons = [
  { value: "defective", label: "Produit défectueux" },
  { value: "wrong_item", label: "Mauvais article reçu" },
  { value: "not_as_described", label: "Ne correspond pas à la description" },
  { value: "changed_mind", label: "Changement d'avis" },
  { value: "other", label: "Autre raison" },
];

export default function ReturnRequestDialog({
  orderItem,
}: ReturnRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createReturnMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const result = await createReturn(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Demande de retour créée avec succès");
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du retour");
    },
  });

  const form = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      reason: "",
      description: "",
    },
  });

  const onSubmit = async (values: { reason: string; description?: string }) => {
    await createReturnMutation.mutateAsync({
      orderItemId: orderItem.id,
      reason: values.reason,
      description: values.description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" />
          Demander un retour
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Demande de retour</DialogTitle>
        </DialogHeader>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Instructions importantes :</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Le produit doit être dans son état d&apos;origine</li>
              <li>• L&apos;emballage doit être intact</li>
              <li>• Vous recevrez les instructions de renvoi par email</li>
              <li>• Le remboursement sera effectué après réception</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produit concerné
              </h4>
              <p className="text-sm text-muted-foreground">
                {orderItem.product.name} - {orderItem.scent.name}
              </p>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison du retour *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une raison" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {returnReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez le problème en détail..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createReturnMutation.isPending}>
                {createReturnMutation.isPending ? "Envoi..." : "Envoyer la demande"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
