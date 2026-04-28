"use client";

import { StatsCard } from "@/components/admin/stats-card";
import {
  Users,
  Crown,
  UserCheck,
  UserX,
  AlertTriangle,
} from "lucide-react";
import type { UserStats } from "./types";

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
      <StatsCard
        title="Total utilisateurs"
        value={stats.total}
        icon={Users}
      />
      <StatsCard
        title="Administrateurs"
        value={stats.admins}
        icon={Crown}
      />
      <StatsCard
        title="Actifs"
        value={stats.active}
        icon={UserCheck}
      />
      <StatsCard
        title="Bannis"
        value={stats.banned}
        icon={UserX}
      />
      <StatsCard
        title="Email non vérifié"
        value={stats.unverified}
        icon={AlertTriangle}
      />
    </div>
  );
}
