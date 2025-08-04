"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Mot de passe mis à jour", {
        description: "Votre mot de passe a été modifié avec succès",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour du mot de passe:", error);
      toast.error("Erreur", {
        description:
          "Une erreur est survenue lors de la mise à jour du mot de passe",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mot de passe</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe pour sécuriser votre compte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-base font-medium"
              >
                Mot de passe actuel
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isPasswordLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base font-medium">
                Nouveau mot de passe
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isPasswordLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-base font-medium"
              >
                Confirmer le nouveau mot de passe
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPasswordLoading}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPasswordLoading}
            className="w-full sm:w-auto"
          >
            {isPasswordLoading
              ? "Mise à jour..."
              : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
