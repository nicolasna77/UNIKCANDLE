"use client";
import { User, ListOrdered } from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { useState } from "react";
import { usePathname } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";

const page = [
  {
    label: "Profil",
    href: "/profil",
    icon: <User />,
  },
  {
    label: "Mes commandes",
    href: "/profil/orders",
    icon: <ListOrdered />,
  },
];

const ProfilMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState(pathname);

  const onTabChange = (value: string) => {
    setTab(value);
    router.push(value);
  };

  return (
    <div className="flex flex-col m-auto w-full justify-center items-center border-b border-border   bg-muted rounded-lg py-2  gap-4">
      <Tabs defaultValue={tab} onValueChange={onTabChange}>
        <TabsList className="flex gap-4">
          {page.map((item) => (
            <TabsTrigger
              onClick={() => onTabChange(item.href)}
              value={item.href}
              key={item.href}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProfilMenu;
