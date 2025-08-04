"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DateRange } from "react-day-picker";

// UI Components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { Package, XCircle, CheckCircle2, Clock } from "lucide-react";
import OrderItemCard from "./order-item-card";
import DatePickerWithRange from "@/components/ui/date-range-picker";
import { PageHeader } from "@/components/page-header";
import {
  Order,
  Scent,
  Product,
  OrderItem,
  Image,
  Address,
  QRCode,
} from "@/generated/client";

export default function OrdersPage() {
  const router = useRouter();
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
    const params = new URLSearchParams(searchParams.toString());
    if (newDateRange?.from) {
      params.set("startDate", newDateRange.from.toISOString());
    } else {
      params.delete("startDate");
    }
    if (newDateRange?.to) {
      params.set("endDate", newDateRange.to.toISOString());
    } else {
      params.delete("endDate");
    }
    router.push(`?${params.toString()}`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") {
      params.set("status", value.toUpperCase());
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  const { data: orders, isLoading } = useQuery<Order[]>({
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
  });

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Livré",
          color: "text-green-500",
          bgColor: "bg-green-50",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-600 border-green-200"
            >
              Livré
            </Badge>
          ),
        };
      case "CANCELLED":
        return {
          label: "Annulé",
          color: "text-red-500",
          bgColor: "bg-red-50",
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200"
            >
              Annulé
            </Badge>
          ),
        };
      case "PROCESSING":
        return {
          label: "En préparation",
          color: "text-amber-500",
          bgColor: "bg-amber-50",
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-600 border-amber-200"
            >
              En préparation
            </Badge>
          ),
        };
      case "SHIPPED":
        return {
          label: "En cours de livraison",
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          icon: <Package className="h-4 w-4 text-blue-500" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200"
            >
              En cours de livraison
            </Badge>
          ),
        };
      case "PENDING":
        return {
          label: "En attente",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-600 border-gray-200"
            >
              En attente
            </Badge>
          ),
        };
      default:
        return {
          label: "Inconnu",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          icon: <Clock className="h-4 w-4 text-gray-500" />,
          badge: (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-600 border-gray-200"
            >
              Inconnu
            </Badge>
          ),
        };
    }
  };

  if (isLoading) {
    return <OrdersPageSkeleton />;
  }

  return (
    <section className="">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <PageHeader
          title="Historique des commandes"
          description="Voir les commandes passées."
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
          >
            <Package className="mr-2 h-4 w-4" />
            Découvrir nos produits
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full lg:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full lg:w-auto">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="PROCESSING">En cours</TabsTrigger>
                <TabsTrigger value="DELIVERED">Livrées</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <DatePickerWithRange
                className="w-full sm:w-auto"
                date={dateRange}
                onDateChange={handleDateChange}
              />
              {(dateRange?.from || dateRange?.to || activeTab !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateRange(undefined);
                    setActiveTab("all");
                    router.push("?");
                  }}
                  className="w-full sm:w-auto"
                >
                  Effacer les filtres
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Composant de test pour le système de retours */}

      {!orders?.length ? (
        <EmptyOrdersState />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderItemCard
              key={order.id}
              order={
                order as Order & {
                  items: (OrderItem & {
                    product: Product & {
                      images: Image[];
                    };
                    scent: Scent;
                    qrCode: QRCode | null;
                  })[];
                  shippingAddress: Address;
                }
              }
              getStatusDetails={getStatusDetails}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyOrdersState() {
  return (
    <Card className="text-center p-8 md:p-12">
      <div className="mx-auto max-w-md">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucune commande trouvée</h3>
        <p className="text-muted-foreground mb-6">
          Vous n&apos;avez pas encore passé de commande ou aucune commande ne
          correspond à vos critères de recherche.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button>Découvrir nos produits</Button>
          <Button variant="outline">Effacer les filtres</Button>
        </div>
      </div>
    </Card>
  );
}

function OrdersPageSkeleton() {
  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gray-50/50">
      <div className="container max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>

        <Skeleton className="h-20 w-full mb-8" />

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}
