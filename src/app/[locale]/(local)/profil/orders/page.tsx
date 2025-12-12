"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Package, XCircle } from "lucide-react";
import {
  OrdersHeader,
  OrdersFilters,
  OrdersList,
  EmptyOrdersState,
  OrdersListSkeleton,
  OrdersPageSkeleton,
} from "./components";
import type {
  Order,
  Scent,
  Product,
  OrderItem,
  Image,
  Address,
  QRCode,
} from "@prisma/client";

type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product & {
      images: Image[];
    };
    scent: Scent;
    qrCode: QRCode | null;
  })[];
  shippingAddress: Address;
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined,
    to: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined,
  });

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleReset = () => {
    setDateRange(undefined);
    setActiveTab("all");
  };

  const {
    data: orders,
    isLoading,
    isFetching,
  } = useQuery<OrderWithDetails[]>({
    queryKey: ["orders", dateRange?.from, dateRange?.to, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      if (activeTab !== "all") {
        params.append("status", activeTab.toUpperCase());
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des commandes");
      }
      return response.json();
    },
    enabled: !!session?.user,
    staleTime: 30000, // Les données restent fraîches pendant 30s
    refetchOnWindowFocus: false, // Ne pas refetch quand on revient sur l'onglet
  });

  // Séparer le chargement initial du refetch
  const isRefetching = isFetching && !isLoading;

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Livré",
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-green-50/80 text-green-700 border-green-200/70 font-bold text-xs px-3 py-1 shadow-sm"
            >
              Livré
            </Badge>
          ),
        };
      case "CANCELLED":
        return {
          label: "Annulé",
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: <XCircle className="h-3.5 w-3.5 text-red-600" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-red-50/80 text-red-700 border-red-200/70 font-bold text-xs px-3 py-1 shadow-sm"
            >
              Annulé
            </Badge>
          ),
        };
      case "PROCESSING":
        return {
          label: "En préparation",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          icon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-amber-50/80 text-amber-700 border-amber-200/70 font-bold text-xs px-3 py-1 shadow-sm"
            >
              En préparation
            </Badge>
          ),
        };
      case "SHIPPED":
        return {
          label: "En cours de livraison",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          icon: <Package className="h-3.5 w-3.5 text-blue-600" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-blue-50/80 text-blue-700 border-blue-200/70 font-bold text-xs px-3 py-1 shadow-sm"
            >
              En cours de livraison
            </Badge>
          ),
        };
      case "PENDING":
        return {
          label: "En attente",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-muted/80 text-muted-foreground border-border font-bold text-xs px-3 py-1 shadow-sm"
            >
              En attente
            </Badge>
          ),
        };
      default:
        return {
          label: "Inconnu",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-muted/80 text-muted-foreground border-border font-bold text-xs px-3 py-1 shadow-sm"
            >
              Inconnu
            </Badge>
          ),
        };
    }
  };

  // Afficher le skeleton complet uniquement au premier chargement (pas de données)
  if (isLoading && !orders) {
    return <OrdersPageSkeleton />;
  }

  const hasFilters = Boolean(dateRange?.from || dateRange?.to || activeTab !== "all");

  return (
    <section className="space-y-6">
      <OrdersHeader />

      <OrdersFilters
        activeTab={activeTab}
        dateRange={dateRange}
        isFetching={false}
        onTabChange={handleTabChange}
        onDateChange={handleDateChange}
        onReset={handleReset}
      />

      {/* Affichage des commandes avec état de chargement */}
      {!orders?.length && !isRefetching ? (
        <EmptyOrdersState hasFilters={hasFilters} onReset={handleReset} />
      ) : (
        <div className={isRefetching ? "relative" : ""}>
          {isRefetching && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md z-10 flex items-center justify-center rounded-xl border border-border/50">
              <div className="flex flex-col items-center gap-4 bg-card/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                <p className="text-sm font-bold text-foreground tracking-tight">
                  Chargement des commandes...
                </p>
              </div>
            </div>
          )}
          {orders?.length ? (
            <OrdersList orders={orders} getStatusDetails={getStatusDetails} />
          ) : (
            <OrdersListSkeleton />
          )}
        </div>
      )}
    </section>
  );
}
