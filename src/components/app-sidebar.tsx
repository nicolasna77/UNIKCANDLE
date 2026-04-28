"use client";

import * as React from "react";
import {
  IconDashboard,
  IconListDetails,
  IconPackage,
  IconUsers,
  IconRefresh,
  IconCategory,
  IconDroplet,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/routing";
import { NavUser } from "./admin/nav-user";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Commandes",
      url: "/admin/orders",
      icon: IconListDetails,
    },
    {
      title: "Retours",
      url: "/admin/returns",
      icon: IconRefresh,
    },
    {
      title: "Produits",
      url: "/admin/products",
      icon: IconPackage,
    },
    {
      title: "Parfums",
      url: "/admin/scents",
      icon: IconDroplet,
    },
    {
      title: "Catégories",
      url: "/admin/categories",
      icon: IconCategory,
    },
    {
      title: "Utilisateurs",
      url: "/admin/users",
      icon: IconUsers,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <span className="text-center m-auto text-primary font-bold tracking-wider text-sm">
                  UNIKCANDLE
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user as User} />
      </SidebarFooter>
    </Sidebar>
  );
}
