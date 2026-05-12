"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Check, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Banknote,
  Search,
} from "lucide-react";

type AffiliateStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface Affiliate {
  id: string;
  code: string;
  commissionRate: number;
  minPayoutAmount: number;
  status: AffiliateStatus;
  stripeOnboarded: boolean;
  totalEarned: number;
  totalPaid: number;
  createdAt: string;
  user: { id: string; name: string; email: string; image: string | null };
  _count: { clicks: number; commissions: number };
}

interface AffiliatesResponse {
  affiliates: Affiliate[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: {
    totalAffiliates: number;
    totalEarned: number;
    totalPaid: number;
    pendingCommissions: number;
  };
}

interface CommissionRow {
  id: string;
  amount: number;
  rate: number;
  status: string;
  createdAt: string;
  order: { id: string; total: number; createdAt: string };
}

const statusLabels: Record<AffiliateStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
};

const statusVariants: Record<AffiliateStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  SUSPENDED: "destructive",
};

export default function AffiliatesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [detailData, setDetailData] = useState<{ commissions: CommissionRow[] } | null>(null);

  // Form state
  const [formUserId, setFormUserId] = useState("");
  const [formUserLabel, setFormUserLabel] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formRate, setFormRate] = useState("10");
  const [formMinPayout, setFormMinPayout] = useState("20");
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const { data: usersData } = useQuery<{ users: { id: string; name: string; email: string; image: string | null }[] }>({
    queryKey: ["admin-users-search", userSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ search: userSearch, limit: "10", page: "1" });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      return res.json();
    },
    enabled: userSearchOpen,
  });

  const { data, isLoading, refetch } = useQuery<AffiliatesResponse>({
    queryKey: ["admin-affiliates", page, search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/affiliates?${params}`);
      if (!res.ok) throw new Error("Erreur chargement");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formUserId,
          code: formCode,
          commissionRate: parseFloat(formRate),
          minPayoutAmount: parseFloat(formMinPayout),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Affilié créé avec succès");
      setIsCreateOpen(false);
      setFormUserId("");
      setFormUserLabel("");
      setFormCode("");
      setFormRate("10");
      setFormMinPayout("20");
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AffiliateStatus }) => {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Statut mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const approveCommissionMutation = useMutation({
    mutationFn: async ({ affiliateId, commissionId }: { affiliateId: string; commissionId: string }) => {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}?action=approve-commission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId }),
      });
      if (!res.ok) throw new Error("Erreur approbation");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Commission approuvée");
      if (selectedAffiliate) loadDetail(selectedAffiliate.id);
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
    },
    onError: () => toast.error("Erreur lors de l'approbation"),
  });

  const payoutMutation = useMutation({
    mutationFn: async (affiliateId: string) => {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}?action=payout`, {
        method: "POST",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: (result) => {
      toast.success(`Virement de ${result.amount.toFixed(2)}€ effectué`);
      queryClient.invalidateQueries({ queryKey: ["admin-affiliates"] });
      if (selectedAffiliate) loadDetail(selectedAffiliate.id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loadDetail = async (id: string) => {
    const res = await fetch(`/api/admin/affiliates/${id}`);
    if (res.ok) {
      const d = await res.json();
      setDetailData(d);
    }
  };

  const openDetail = async (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setIsDetailOpen(true);
    await loadDetail(affiliate.id);
  };

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Affiliés"
        description="Gérez le programme d'affiliation et les commissions"
        breadcrumbs={[
          { label: "Administration", href: "/admin/dashboard" },
          { label: "Affiliés" },
        ]}
        badge={{ text: `${data?.pagination?.total ?? 0} affilié(s)`, variant: "secondary" }}
        actions={
          <AdminHeaderActions
            onRefresh={() => refetch()}
            onAdd={() => setIsCreateOpen(true)}
            addLabel="Nouvel affilié"
            isLoading={isLoading}
          />
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total affiliés"
          value={stats?.totalAffiliates ?? 0}
          icon={Users}
          loading={isLoading}
        />
        <StatsCard
          title="Total gagné"
          value={`${(stats?.totalEarned ?? 0).toFixed(2)}€`}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatsCard
          title="Total versé"
          value={`${(stats?.totalPaid ?? 0).toFixed(2)}€`}
          icon={DollarSign}
          loading={isLoading}
        />
        <StatsCard
          title="Commissions en attente"
          value={stats?.pendingCommissions ?? 0}
          icon={Clock}
          loading={isLoading}
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="ACTIVE">Actif</SelectItem>
            <SelectItem value="INACTIVE">Inactif</SelectItem>
            <SelectItem value="SUSPENDED">Suspendu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Affilié</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Taux</TableHead>
              <TableHead className="text-right">Clics</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Gagné</TableHead>
              <TableHead className="text-right">Versé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Stripe</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (data?.affiliates ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                  Aucun affilié trouvé
                </TableCell>
              </TableRow>
            ) : (
              (data?.affiliates ?? []).map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{affiliate.user.name}</p>
                      <p className="text-xs text-muted-foreground">{affiliate.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {affiliate.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{affiliate.commissionRate}%</TableCell>
                  <TableCell className="text-right">{affiliate._count.clicks}</TableCell>
                  <TableCell className="text-right">{affiliate._count.commissions}</TableCell>
                  <TableCell className="text-right font-medium">
                    {affiliate.totalEarned.toFixed(2)}€
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {affiliate.totalPaid.toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[affiliate.status]}>
                      {statusLabels[affiliate.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {affiliate.stripeOnboarded ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetail(affiliate)}>
                          Voir les commissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {affiliate.status !== "ACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: affiliate.id, status: "ACTIVE" })}
                          >
                            Activer
                          </DropdownMenuItem>
                        )}
                        {affiliate.status !== "INACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => updateStatusMutation.mutate({ id: affiliate.id, status: "INACTIVE" })}
                          >
                            Désactiver
                          </DropdownMenuItem>
                        )}
                        {affiliate.status !== "SUSPENDED" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => updateStatusMutation.mutate({ id: affiliate.id, status: "SUSPENDED" })}
                          >
                            Suspendre
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => payoutMutation.mutate(affiliate.id)}
                          disabled={!affiliate.stripeOnboarded}
                        >
                          <Banknote className="mr-2 h-4 w-4" />
                          Déclencher le paiement
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Dialog création */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open);
        if (!open) {
          setFormUserId("");
          setFormUserLabel("");
          setFormCode("");
          setFormRate("10");
          setFormMinPayout("20");
          setUserSearch("");
          setUserSearchOpen(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel affilié</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Utilisateur</Label>
              <div className="relative">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={formUserId ? formUserLabel : userSearch}
                    className="pl-9 pr-8"
                    onFocus={() => {
                      if (formUserId) {
                        setFormUserId("");
                        setFormUserLabel("");
                      }
                      setUserSearchOpen(true);
                    }}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserSearchOpen(true);
                    }}
                  />
                  {formUserId && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                  )}
                </div>

                {userSearchOpen && !formUserId && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserSearchOpen(false)}
                    />
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    <div
                      className="max-h-[240px] overflow-y-auto overscroll-contain py-1"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {(usersData?.users ?? []).length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          Aucun utilisateur trouvé
                        </p>
                      ) : (
                        (usersData?.users ?? []).map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                              formUserId === user.id && "bg-accent"
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFormUserId(user.id);
                              setFormUserLabel(`${user.name} — ${user.email}`);
                              setUserSearch("");
                              setUserSearchOpen(false);
                            }}
                          >
                            <Avatar className="h-7 w-7 shrink-0">
                              <AvatarImage src={user.image ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            {formUserId === user.id && (
                              <Check className="h-4 w-4 shrink-0 text-primary" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Code affilié</Label>
              <Input
                placeholder="ex: JOHN2024 (4-20 caractères alphanumériques)"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Taux de commission (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Seuil minimum (€)</Label>
                <Input
                  type="number"
                  min={1}
                  value={formMinPayout}
                  onChange={(e) => setFormMinPayout(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !formUserId || !formCode}
            >
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog commissions */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Commissions — {selectedAffiliate?.user.name} ({selectedAffiliate?.code})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAffiliate && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => payoutMutation.mutate(selectedAffiliate.id)}
                  disabled={payoutMutation.isPending || !selectedAffiliate.stripeOnboarded}
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Payer les commissions approuvées
                </Button>
                {!selectedAffiliate.stripeOnboarded && (
                  <p className="text-xs text-muted-foreground self-center">
                    (Stripe non connecté)
                  </p>
                )}
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Commande</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {!detailData ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : detailData.commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune commission
                    </TableCell>
                  </TableRow>
                ) : (
                  detailData.commissions.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm">
                        {format(new Date(c.createdAt), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {c.order.total.toFixed(2)}€
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {c.amount.toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "PENDING"
                              ? "secondary"
                              : c.status === "APPROVED"
                                ? "default"
                                : c.status === "PAID"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {c.status === "PENDING" ? "En attente"
                            : c.status === "APPROVED" ? "Approuvée"
                            : c.status === "PAID" ? "Payée"
                            : "Rejetée"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.status === "PENDING" && selectedAffiliate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() =>
                              approveCommissionMutation.mutate({
                                affiliateId: selectedAffiliate.id,
                                commissionId: c.id,
                              })
                            }
                            disabled={approveCommissionMutation.isPending}
                          >
                            Approuver
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
