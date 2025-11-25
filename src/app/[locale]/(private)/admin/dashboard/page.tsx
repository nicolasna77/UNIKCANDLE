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
import { StatsCard } from "@/components/admin/stats-card";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";

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
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  ordersByStatus: OrderStatus[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  // Nouvelles métriques
  averageOrderValue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  userGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des statistiques");
      return response.json();
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "processing":
        return "text-blue-600";
      case "shipped":
        return "text-green-600";
      case "delivered":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Tableau de bord"
          description="Vue d'ensemble des performances de votre boutique"
          breadcrumbs={[
            { label: "Administration", href: "/admin" },
            { label: "Tableau de bord" },
          ]}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatsCard key={i} title="" value="" loading={true} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Tableau de bord"
        description="Vue d'ensemble des performances de votre boutique"
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Tableau de bord" },
        ]}
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            Actualiser
          </Button>
        }
      />

      {/* Cartes de statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utilisateurs"
          value={stats?.totalUsers || 0}
          description="Utilisateurs inscrits"
          icon={Users}
          trend={{
            value: stats?.userGrowth?.percentage || 0,
            label: "Par rapport au mois dernier",
          }}
        />

        <StatsCard
          title="Commandes"
          value={stats?.totalOrders || 0}
          description="Commandes totales"
          icon={ShoppingCart}
          badge={{
            text: "Total",
            variant: "secondary",
          }}
        />

        <StatsCard
          title="Produits"
          value={stats?.totalProducts || 0}
          description="Produits en catalogue"
          icon={Package}
        />

        <StatsCard
          title="Chiffre d'affaires"
          value={formatCurrency(stats?.totalRevenue || 0)}
          description={`Panier moyen: ${formatCurrency(stats?.averageOrderValue || 0)}`}
          icon={Euro}
          trend={{
            value: 12.5,
            label: "Croissance mensuelle",
          }}
        />
      </div>

      {/* Graphiques et analyses */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Statut des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Statut des commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.ordersByStatus || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="_count"
                  >
                    {stats?.ordersByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Produits les plus vendus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.topProducts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="_count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution du chiffre d'affaires */}
      {stats?.monthlyRevenue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution du chiffre d&apos;affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value as number),
                      "Chiffre d&apos;affaires",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Commandes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="font-medium">
                      Commande #{order.id.slice(-8)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.user.name} •{" "}
                      {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(order.total)}
                  </div>
                  <div
                    className={`text-sm capitalize ${getStatusColor(order.status)}`}
                  >
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
