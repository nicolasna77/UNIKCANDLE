"use client";
import { User, ListOrdered } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Profil", href: "/profil", icon: User },
  { label: "Mes commandes", href: "/profil/orders", icon: ListOrdered },
];

const ProfilMenu = () => {
  const pathname = usePathname();

  return (
    <nav
      className="flex w-full justify-center border-b border-border bg-background"
      aria-label="Navigation du profil"
    >
      <div className="flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/profil"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ProfilMenu;
