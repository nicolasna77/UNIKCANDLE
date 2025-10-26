"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { User, Product, Scent, Image as ImageType } from "@prisma/client";
import { useAdminProducts } from "@/hooks/useProducts";
import { useScents } from "@/hooks/useScents";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface ProductWithDetails extends Product {
  images: ImageType[];
  scent: Scent;
}

interface OrderItem {
  productId: string;
  scentId: string;
  quantity: number;
  price: number;
  audioUrl?: string;
}

interface OrderForm {
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function DialogCreateOrder() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [audioFiles, setAudioFiles] = useState<{ [key: number]: File | null }>(
    {}
  );
  const [uploadingAudio, setUploadingAudio] = useState<{
    [key: number]: boolean;
  }>({});

  const [formData, setFormData] = useState<OrderForm>({
    userId: "",
    items: [],
    shippingAddress: {
      name: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "France",
    },
  });

  // Récupérer les utilisateurs
  const { data: users } = useQuery<User[]>({
    queryKey: ["users-all"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      return response.json();
    },
  });

  // Récupérer les produits
  const { data: products } = useAdminProducts();

  // Récupérer les senteurs
  const { data: scents } = useScents();

  // Mutation pour créer la commande
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const response = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Commande créée avec succès");
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      userId: "",
      items: [],
      shippingAddress: {
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "France",
      },
    });
    setAudioFiles({});
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: "",
          scentId: "",
          quantity: 1,
          price: 0,
          audioUrl: undefined,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    // Nettoyer le fichier audio associé
    const newAudioFiles = { ...audioFiles };
    delete newAudioFiles[index];
    setAudioFiles(newAudioFiles);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Si on change le produit, mettre à jour le prix automatiquement
    if (field === "productId") {
      const product = products?.find((p) => p.id === value);
      if (product) {
        newItems[index].price = product.price;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleAudioUpload = async (index: number, file: File) => {
    setUploadingAudio({ ...uploadingAudio, [index]: true });

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch("/api/upload/audio", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const { url } = await response.json();
      updateItem(index, "audioUrl", url);
      toast.success("Audio téléchargé avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'audio");
      console.error(error);
    } finally {
      setUploadingAudio({ ...uploadingAudio, [index]: false });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.userId) {
      toast.error("Veuillez sélectionner un utilisateur");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    for (const item of formData.items) {
      if (!item.productId || !item.scentId || item.quantity <= 0) {
        toast.error("Veuillez remplir tous les champs des articles");
        return;
      }
    }

    if (
      !formData.shippingAddress.name ||
      !formData.shippingAddress.street ||
      !formData.shippingAddress.city ||
      !formData.shippingAddress.zipCode
    ) {
      toast.error("Veuillez remplir l'adresse de livraison");
      return;
    }

    createOrderMutation.mutate(formData);
  };

  const getTotalAmount = () => {
    return formData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const getProductById = (productId: string) => {
    return products?.find((p) => p.id === productId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Créer une commande
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une commande manuellement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection de l'utilisateur */}
          <div className="space-y-2">
            <Label>Client *</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) =>
                setFormData({ ...formData, userId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Articles</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article
              </Button>
            </div>

            {formData.items.map((item, index) => {
              const product = getProductById(item.productId);
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">Article {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Produit */}
                        <div className="space-y-2">
                          <Label>Produit *</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) =>
                              updateItem(index, "productId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un produit" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {product.price.toFixed(2)}€
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Senteur */}
                        <div className="space-y-2">
                          <Label>Senteur *</Label>
                          <Select
                            value={item.scentId}
                            onValueChange={(value) =>
                              updateItem(index, "scentId", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une senteur" />
                            </SelectTrigger>
                            <SelectContent>
                              {scents?.map((scent) => (
                                <SelectItem key={scent.id} value={scent.id}>
                                  {scent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantité */}
                        <div className="space-y-2">
                          <Label>Quantité *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>

                        {/* Prix unitaire */}
                        <div className="space-y-2">
                          <Label>Prix unitaire (€) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Aperçu du produit */}
                      {product && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          {product.images[0] && (
                            <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Total: {(item.price * item.quantity).toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Upload audio */}
                      <div className="space-y-2">
                        <Label>Audio personnalisé (optionnel)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setAudioFiles({ ...audioFiles, [index]: file });
                                handleAudioUpload(index, file);
                              }
                            }}
                            disabled={uploadingAudio[index]}
                          />
                          {item.audioUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateItem(index, "audioUrl", undefined)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {uploadingAudio[index] && (
                          <p className="text-sm text-muted-foreground">
                            Téléchargement en cours...
                          </p>
                        )}
                        {item.audioUrl && !uploadingAudio[index] && (
                          <p className="text-sm text-green-600">Audio ajouté ✓</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun article ajouté. Cliquez sur "Ajouter un article" pour
                commencer.
              </div>
            )}
          </div>

          <Separator />

          {/* Adresse de livraison */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Adresse de livraison</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Nom complet *</Label>
                <Input
                  value={formData.shippingAddress.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        name: e.target.value,
                      },
                    })
                  }
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Rue *</Label>
                <Input
                  value={formData.shippingAddress.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        street: e.target.value,
                      },
                    })
                  }
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div className="space-y-2">
                <Label>Code postal *</Label>
                <Input
                  value={formData.shippingAddress.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        zipCode: e.target.value,
                      },
                    })
                  }
                  placeholder="75001"
                />
              </div>

              <div className="space-y-2">
                <Label>Ville *</Label>
                <Input
                  value={formData.shippingAddress.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        city: e.target.value,
                      },
                    })
                  }
                  placeholder="Paris"
                />
              </div>

              <div className="space-y-2">
                <Label>Région / État</Label>
                <Input
                  value={formData.shippingAddress.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        state: e.target.value,
                      },
                    })
                  }
                  placeholder="Île-de-France"
                />
              </div>

              <div className="space-y-2">
                <Label>Pays *</Label>
                <Input
                  value={formData.shippingAddress.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        country: e.target.value,
                      },
                    })
                  }
                  placeholder="France"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total de la commande</span>
            <span className="text-primary">{getTotalAmount().toFixed(2)}€</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createOrderMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending
                ? "Création en cours..."
                : "Créer la commande"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
