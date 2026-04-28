"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShoppingCart,
  Package,
  Euro,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
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
} from "recharts";

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

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: { label: "En attente", color: "text-amber-600", icon: Clock },
  PROCESSING: {
    label: "En préparation",
    color: "text-blue-600",
    icon: Loader2,
  },
  SHIPPED: { label: "Expédiée", color: "text-violet-600", icon: TrendingUp },
  DELIVERED: { label: "Livrée", color: "text-emerald-600", icon: CheckCircle2 },
  CANCELLED: { label: "Annulée", color: "text-red-600", icon: AlertCircle },
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-violet-50 text-violet-700 border-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

// Use theme CSS variables for chart colors
const CHART_COLORS = [
  "var(--color-primary-700)",
  "var(--color-primary-400)",
  "var(--color-primary-200)",
  "var(--color-base-400)",
  "var(--color-base-600)",
];

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/dashboard");
      if (!response.ok)
        throw new Error("Erreur lors du chargement des statistiques");
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vue d&apos;ensemble des performances de votre boutique
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline ml-1.5">Actualiser</span>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utilisateurs"
          value={isLoading ? "" : stats?.totalUsers ?? 0}
          description="inscrits"
          icon={Users}
          loading={isLoading}
          trend={
            stats?.userGrowth
              ? {
                  value: stats.userGrowth.percentage,
                  label: "vs mois dernier",
                }
              : undefined
          }
        />
        <StatsCard
          title="Commandes"
          value={isLoading ? "" : stats?.totalOrders ?? 0}
          description="au total"
          icon={ShoppingCart}
          loading={isLoading}
        />
        <StatsCard
          title="Produits"
          value={isLoading ? "" : stats?.totalProducts ?? 0}
          description="en catalogue"
          icon={Package}
          loading={isLoading}
        />
        <StatsCard
          title="Chiffre d'affaires"
          value={
            isLoading ? "" : formatCurrency(stats?.totalRevenue ?? 0)
          }
          description={
            stats
              ? `Panier moyen ${formatCurrency(stats.averageOrderValue)}`
              : undefined
          }
          icon={Euro}
          loading={isLoading}
          trend={{ value: 12.5, label: "Croissance mensuelle" }}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Order status pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              Statut des commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[240px] flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.ordersByStatus ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="_count"
                    >
                      {(stats?.ordersByStatus ?? []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        STATUS_CONFIG[name as string]?.label ?? name,
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Top des ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[240px] space-y-3 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Skeleton className="h-6 flex-1" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.topProducts ?? []}
                    layout="vertical"
                    margin={{ left: 0, right: 16 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={90}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="_count"
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue area chart */}
      {(isLoading || (stats?.monthlyRevenue && stats.monthlyRevenue.length > 0)) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Évolution du chiffre d&apos;affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlyRevenue ?? []}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--primary)"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--primary)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}€`}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "CA",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Commandes récentes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <a href="orders">
                Voir tout
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : !stats?.recentOrders?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune commande récente
            </p>
          ) : (
            <div className="space-y-1">
              {stats.recentOrders.map((order) => {
                const config = STATUS_CONFIG[order.status];
                const StatusIcon = config?.icon ?? Clock;
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <StatusIcon className={`h-3.5 w-3.5 ${config?.color ?? "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{order.id.slice(-8)} &middot;{" "}
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">
                        {formatCurrency(order.total)}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status] ?? "bg-muted text-muted-foreground border-border"}`}
                      >
                        {config?.label ?? order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
