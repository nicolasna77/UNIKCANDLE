"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Ban, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const banUserSchema = z.object({
  reason: z.string().min(10, "La raison doit contenir au moins 10 caractères"),
  expirationDate: z.date().optional(),
});

type BanUserFormData = z.infer<typeof banUserSchema>;

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface BanUserFormProps {
  user: User;
  onSuccess: () => void;
  onBan: (data: BanUserFormData) => void;
}

export function BanUserForm({ user, onSuccess, onBan }: BanUserFormProps) {
  const form = useForm<BanUserFormData>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      expirationDate: undefined,
    },
  });

  const onSubmit = (data: BanUserFormData) => {
    onBan(data);
  };

  return (
    <div className="space-y-6">
      {/* Informations utilisateur */}
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-primary/10">
              {user.name?.charAt(0).toUpperCase() ||
                user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">{user.name || "Nom non défini"}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Avertissement */}
      <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-950/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Attention
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Cette action bannira l&apos;utilisateur et l&apos;empêchera de se
              connecter. Vous pouvez définir une durée limitée ou un
              bannissement permanent.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Raison du bannissement */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Raison du bannissement</h3>
              <p className="text-sm text-muted-foreground">
                Expliquez pourquoi cet utilisateur est banni
              </p>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Motif du bannissement
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Violation des conditions d'utilisation, comportement inapproprié, spam..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Durée du bannissement */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Durée du bannissement</h3>
              <p className="text-sm text-muted-foreground">
                Définissez une date d&apos;expiration ou laissez vide pour un
                bannissement permanent
              </p>
            </div>

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Date d&apos;expiration (optionnel)
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy", { locale: fr })
                          ) : (
                            <span>Sélectionner une date (optionnel)</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive">
              <Ban className="mr-2 h-4 w-4" />
              Bannir l&apos;utilisateur
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
