"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "@/i18n/routing";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Tableau de bord",
  orders: "Commandes",
  products: "Produits",
  returns: "Retours",
  users: "Utilisateurs",
  scents: "Parfums",
  categories: "Catégories",
};

export function SiteHeader() {
  const pathname = usePathname();
  const segment = pathname.split("/").pop() ?? "";
  const title = PAGE_TITLES[segment] ?? segment;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-medium text-foreground">{title}</h1>
      </div>
    </header>
  );
}
