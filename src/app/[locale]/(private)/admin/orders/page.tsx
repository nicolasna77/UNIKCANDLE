"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { Order } from "@prisma/client";

import Loading from "@/components/loading";
import DialogDetailOrder from "./dialog-detail-order";
import DialogCreateOrder from "./dialog-create-order";
import { PaginationComponent } from "@/app/[locale]/(private)/Pagination";

// Types for paginated API response
type OrderListItem = {
  id: string;
  total: number;
  status: Order["status"];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: { url: string }[];
    };
    scent: {
      id: string;
      name: string;
    };
    qrCode: {
      id: string;
      code: string;
    } | null;
  }[];
  shippingAddress: {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
};

type PaginatedOrdersResponse = {
  orders: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading } = useQuery<PaginatedOrdersResponse>({
    queryKey: ["orders", currentPage, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const response = await fetch(`/api/admin/orders?${params}`);
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

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const orders = data?.orders;
  const totalPages = data?.pagination.totalPages || 1;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des commandes</h1>
        <DialogCreateOrder />
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
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
              <TableHead></TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
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
                  <DialogDetailOrder order={order} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <PaginationComponent
            table={{
              getPageCount: () => totalPages,
              getCanPreviousPage: () => currentPage > 1,
              getCanNextPage: () => currentPage < totalPages,
            }}
            currentPage={currentPage}
            updatePageInURL={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
