"use client";
import { MessageSquareText, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";

interface TextMessageProps {
  productId: string;
  onTextChange?: (text: string | undefined) => void;
}

const MAX_CHARACTERS = 40;

const TextMessage = ({ productId, onTextChange }: TextMessageProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const { updateItemTextMessage, removeItemTextMessage, cart } = useCart();

  // Trouver l'item du panier correspondant au produit
  const cartItem = cart.find((item) => item.id === productId);

  // Initialiser le message depuis le panier si disponible
  useEffect(() => {
    if (cartItem?.textMessage) {
      setMessage(cartItem.textMessage);
      onTextChange?.(cartItem.textMessage);
    }
  }, [cartItem?.textMessage, onTextChange]);

  const handleMessageChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setMessage(value);
      if (value) {
        updateItemTextMessage(productId, value);
      } else {
        removeItemTextMessage(productId);
      }
      onTextChange?.(value || undefined);
    }
  };

  const clearMessage = () => {
    setMessage("");
    removeItemTextMessage(productId);
    onTextChange?.(undefined);
    toast.success("Message supprimé");
  };

  const remainingChars = MAX_CHARACTERS - message.length;

  return (
    <Card
      className={cn(
        "transition-all duration-300 border-2",
        isEnabled
          ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          : "border-border bg-muted/30"
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5" />
              Message personnalisé
              {message && (
                <Badge variant="secondary" className="ml-2">
                  {message.length}/{MAX_CHARACTERS}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Écrivez un message qui sera inséré dans la cire (max {MAX_CHARACTERS} caractères)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isEnabled ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isEnabled ? "Activé" : "Désactivé"}
            </span>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "transition-all duration-300",
          !isEnabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="space-y-4">
          {/* Zone de texte */}
          <div className="space-y-2">
            <Textarea
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              disabled={!isEnabled}
              className="min-h-[120px] resize-none"
              maxLength={MAX_CHARACTERS}
            />
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs font-medium",
                  remainingChars < 10
                    ? "text-orange-500"
                    : "text-muted-foreground"
                )}
              >
                {remainingChars} caractères restants
              </span>
              {message && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessage}
                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Aperçu du message */}
          {message && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Aperçu du message
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                &quot;{message}&quot;
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Conseil :</strong> Votre message sera gravé dans la cire
            </p>
            <p className="text-xs text-muted-foreground">
              Évitez les caractères spéciaux complexes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextMessage;
