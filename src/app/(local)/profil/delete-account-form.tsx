import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";

const DeleteAccountForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDeleteAccount = async () => {
    setIsPending(true);
    try {
      await authClient.deleteUser();
      toast.success("Compte supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      toast.error("Erreur lors de la suppression du compte");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Supprimer le compte</CardTitle>
        <CardDescription>
          Supprimer définitivement toutes les données de profil dans toutes les
          organisations auxquelles vous appartenez.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <p className="text-sm">
          <span className="font-bold">Attention :</span> Cette action est
          immédiate et ne peut pas être annulée.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Supprimer le compte</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Êtes-vous sûr de vouloir supprimer votre compte ?
              </DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Toutes vos données seront
                définitivement supprimées.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isPending}
              >
                {isPending ? "Suppression..." : "Confirmer la suppression"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default DeleteAccountForm;
