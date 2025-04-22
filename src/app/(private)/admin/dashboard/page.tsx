"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShoppingCart,
  Package,
  Euro,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface OrderStatus {
  status: string;
  _count: number;
}

interface TopProduct {
  productId: string;
  name: string;
  _count: number;
}

interface RecentOrder {
  id: string;
  createdAt: string;
  total: number;
  status: string;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  ordersByStatus: OrderStatus[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des statistiques");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d&apos;affaires
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statut des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.ordersByStatus.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    {status.status === "pending" && (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    {status.status === "processing" && (
                      <Loader2 className="h-4 w-4 text-blue-500" />
                    )}
                    {status.status === "shipped" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {status.status === "delivered" && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {status.status === "cancelled" && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="capitalize">{status.status}</span>
                  </div>
                  <span className="font-medium">{status._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.topProducts.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between"
                >
                  <span>{product.name}</span>
                  <span className="font-medium">{product._count} ventes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Commande #{order.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
