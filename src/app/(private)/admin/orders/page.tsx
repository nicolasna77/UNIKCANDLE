"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Loading from "@/components/loading";

interface Order {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
    scent: {
      name: string;
    };
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: Order["status"];
    }) => {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Statut mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-orange-100 text-orange-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "Livrée";
      case "SHIPPED":
        return "En cours de livraison";
      case "PROCESSING":
        return "En préparation";
      case "PENDING":
        return "En attente";
      case "CANCELLED":
        return "Annulée";
      default:
        return status;
    }
  };

  const handleStatusUpdate = (orderId: string, status: Order["status"]) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const filteredOrders = orders?.filter((order) =>
    order.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des commandes</h1>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Rechercher une commande..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-sm text-gray-500">
                      {order.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "PPP", { locale: fr })}
                </TableCell>
                <TableCell>{order.total.toFixed(2)}€</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {order.items.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        )}{" "}
                        articles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          Détails de la commande #{order.id.slice(0, 8)}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">Articles commandés</h3>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between border-b pb-2"
                              >
                                <div>
                                  <p className="font-medium">
                                    {item.product.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Senteur: {item.scent.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {item.quantity} x {item.price.toFixed(2)}€
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Total:{" "}
                                    {(item.quantity * item.price).toFixed(2)}€
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">Adresse de livraison</h3>
                          {order.shippingAddress ? (
                            <div className="text-sm">
                              <p>{order.shippingAddress.street}</p>
                              <p>
                                {order.shippingAddress.zipCode}{" "}
                                {order.shippingAddress.city}
                              </p>
                              <p>
                                {order.shippingAddress.state},{" "}
                                {order.shippingAddress.country}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Aucune adresse de livraison fournie
                            </p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {order.status !== "DELIVERED" &&
                        order.status !== "CANCELLED" && (
                          <>
                            {order.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "PROCESSING")
                                }
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Marquer comme en préparation
                              </DropdownMenuItem>
                            )}
                            {order.status === "PROCESSING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "SHIPPED")
                                }
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Marquer comme en cours de livraison
                              </DropdownMenuItem>
                            )}
                            {order.status === "SHIPPED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "DELIVERED")
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marquer comme livrée
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      {order.status !== "CANCELLED" &&
                        order.status !== "DELIVERED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(order.id, "CANCELLED")
                            }
                            className="text-red-600"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler la commande
                          </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
