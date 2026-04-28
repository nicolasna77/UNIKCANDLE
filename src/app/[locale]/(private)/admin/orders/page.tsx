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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import type { Order } from "@prisma/client";

import DialogDetailOrder from "./dialog-detail-order";
import DialogCreateOrder from "./dialog-create-order";
import { PaginationComponent } from "@/app/[locale]/(private)/Pagination";
import { AdminHeader, AdminHeaderActions } from "@/components/admin/admin-header";

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
  shippingCost?: number | null;
  shippingMethodId?: number | null;
  sendcloudParcelId?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    engravingText?: string | null;
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

const STATUS_LABELS: Record<string, string> = {
  DELIVERED: "Livrée",
  SHIPPED: "En livraison",
  PROCESSING: "En préparation",
  PENDING: "En attente",
  CANCELLED: "Annulée",
};

const STATUS_CLASSES: Record<string, string> = {
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SHIPPED: "bg-violet-50 text-violet-700 border-violet-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, refetch } = useQuery<PaginatedOrdersResponse>({
    queryKey: ["orders", currentPage, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
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
        headers: { "Content-Type": "application/json" },
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

  const handleStatusUpdate = (orderId: string, status: Order["status"]) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const orders = data?.orders;
  const totalPages = data?.pagination.totalPages || 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Commandes"
        description="Gérez et suivez les commandes clients"
        breadcrumbs={[
          { label: "Administration", href: "/admin/dashboard" },
          { label: "Commandes" },
        ]}
        badge={{
          text: `${total} commande${total !== 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions
            onRefresh={() => refetch()}
            isLoading={isLoading}
            customActions={<DialogCreateOrder />}
          />
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px] h-9">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PROCESSING">En préparation</SelectItem>
            <SelectItem value="SHIPPED">En livraison</SelectItem>
            <SelectItem value="DELIVERED">Livrées</SelectItem>
            <SelectItem value="CANCELLED">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-10 whitespace-nowrap">
                N° Commande
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Client
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell whitespace-nowrap">
                Date
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Montant
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                Statut
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell whitespace-nowrap">
                Détail
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !orders?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8 opacity-20" />
                    <p className="text-sm">Aucune commande trouvée</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs font-medium">
                    #{order.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {order.total.toFixed(2)} €
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <DialogDetailOrder order={order} />
                  </TableCell>
                  <TableCell>
                    {order.status !== "DELIVERED" &&
                      order.status !== "CANCELLED" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              aria-label="Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {order.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "PROCESSING")
                                }
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Mettre en préparation
                              </DropdownMenuItem>
                            )}
                            {order.status === "PROCESSING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "SHIPPED")
                                }
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Marquer expédiée
                              </DropdownMenuItem>
                            )}
                            {order.status === "SHIPPED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(order.id, "DELIVERED")
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Marquer livrée
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(order.id, "CANCELLED")
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Annuler la commande
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    {(order.status === "DELIVERED" ||
                      order.status === "CANCELLED") && (
                      <div className="flex items-center justify-center h-7 w-7">
                        {order.status === "DELIVERED" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {total} commande{total !== 1 ? "s" : ""}
          </p>
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
