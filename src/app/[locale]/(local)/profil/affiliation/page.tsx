"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  IconCopy,
  IconCheck,
  IconBrandWhatsapp,
  IconBrandTwitter,
  IconLink,
  IconCreditCard,
  IconLoader2,
  IconAlertCircle,
  IconTrendingUp,
  IconUsers,
  IconClick,
  IconCoin,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";

type CommissionStatus = "PENDING" | "APPROVED" | "PAID" | "REJECTED";

interface Commission {
  id: string;
  amount: number;
  rate: number;
  status: CommissionStatus;
  createdAt: string;
  paidAt: string | null;
  order: { id: string; total: number; createdAt: string };
}

interface AffiliateStats {
  affiliate: {
    id: string;
    code: string;
    commissionRate: number;
    minPayoutAmount: number;
    status: string;
    stripeOnboarded: boolean;
    totalEarned: number;
    totalPaid: number;
  };
  stats: {
    clicks: number;
    conversions: number;
    conversionRate: string;
    pendingAmount: number;
    approvedAmount: number;
    availableBalance: number;
  };
  commissions: Commission[];
}

const statusConfig: Record<CommissionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  APPROVED: { label: "Approuvée", variant: "default" },
  PAID: { label: "Payée", variant: "outline" },
  REJECTED: { label: "Rejetée", variant: "destructive" },
};

export default function AffiliationPage() {
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();

  const { data, isLoading, error, refetch } = useQuery<AffiliateStats>({
    queryKey: ["affiliate-stats"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/stats");
      if (!res.ok) throw new Error("not_affiliate");
      return res.json();
    },
  });

  useEffect(() => {
    const connect = searchParams.get("connect");
    if (connect === "success") {
      toast.success("Compte Stripe connecté avec succès !");
      refetch();
    } else if (connect === "refresh") {
      toast.info("Veuillez reprendre la connexion Stripe.");
    }
  }, [searchParams, refetch]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const referralLink = data ? `${appUrl}?ref=${data.affiliate.code}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Découvrez UNIKCANDLE ! ${referralLink}`)}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez UNIKCANDLE, des bougies uniques ! ${referralLink}`)}`,
      "_blank"
    );
  };

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/affiliate/connect", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Erreur lors de la connexion Stripe");
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <IconAlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Vous ne faites pas encore partie du programme d&apos;affiliation.
        </p>
        <p className="text-sm text-muted-foreground">
          Contactez-nous pour rejoindre le programme.
        </p>
      </div>
    );
  }

  const { affiliate, stats, commissions } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mon affiliation"
        description={`Taux de commission : ${affiliate.commissionRate}%`}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: IconClick, label: "Clics", value: stats.clicks },
          { icon: IconUsers, label: "Conversions", value: stats.conversions },
          { icon: IconTrendingUp, label: "Taux de conv.", value: `${stats.conversionRate}%` },
          { icon: IconCoin, label: "Total gagné", value: `${affiliate.totalEarned.toFixed(2)}€` },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lien de parrainage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLink className="h-5 w-5" />
            Mon lien de parrainage
          </CardTitle>
          <CardDescription>
            Partagez ce lien pour gagner {affiliate.commissionRate}% sur chaque vente générée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3">
            <code className="flex-1 truncate text-sm text-muted-foreground">{referralLink}</code>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={copyLink}>
                    {copied ? (
                      <IconCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copier le lien</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyLink} className="flex-1">
              {copied ? <IconCheck className="mr-2 h-4 w-4" /> : <IconCopy className="mr-2 h-4 w-4" />}
              Copier
            </Button>
            <Button variant="outline" size="sm" onClick={shareWhatsApp} className="flex-1">
              <IconBrandWhatsapp className="mr-2 h-4 w-4 text-green-500" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareTwitter} className="flex-1">
              <IconBrandTwitter className="mr-2 h-4 w-4" />
              Twitter
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-muted/40 px-4 py-2">
            <span className="text-sm text-muted-foreground">Votre code :</span>
            <Badge variant="secondary" className="font-mono text-base tracking-widest">
              {affiliate.code}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Solde & paiement Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCreditCard className="h-5 w-5" />
            Solde & paiement
          </CardTitle>
          <CardDescription>
            Seuil minimum de versement : {affiliate.minPayoutAmount}€
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">En attente</p>
              <p className="mt-1 text-lg font-semibold">{stats.pendingAmount.toFixed(2)}€</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Disponible</p>
              <p className="mt-1 text-lg font-semibold text-primary">{stats.availableBalance.toFixed(2)}€</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total versé</p>
              <p className="mt-1 text-lg font-semibold">{affiliate.totalPaid.toFixed(2)}€</p>
            </div>
          </div>

          <Separator />

          {!affiliate.stripeOnboarded ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connectez votre compte Stripe pour recevoir vos paiements automatiquement.
              </p>
              <Button onClick={handleStripeConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconCreditCard className="mr-2 h-4 w-4" />
                )}
                Connecter mon compte Stripe
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 dark:bg-green-950/20">
              <IconCheck className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-700 dark:text-green-400">
                Compte Stripe connecté — les paiements sont traités automatiquement par l&apos;administrateur.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des commissions</CardTitle>
          <CardDescription>{commissions.length} commission(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune commission pour le moment. Partagez votre lien pour commencer à gagner !
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant commande</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Taux</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="text-sm">
                      {format(new Date(commission.createdAt), "d MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {commission.order.total.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {commission.amount.toFixed(2)}€
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {commission.rate}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[commission.status].variant}>
                        {statusConfig[commission.status].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
