"use client";
import { User, ListOrdered } from "lucide-react";
import Link from "next/link";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [tab, setTab] = useState(pathname);

  const onTabChange = (value: string) => {
    setTab(value);
  };

  return (
    <div className="flex flex-col m-auto w-full justify-center items-center   bg-muted rounded-lg p-4  gap-4">
      <Tabs defaultValue={tab} onValueChange={onTabChange}>
        <TabsList className="flex gap-4">
          {page.map((item) => (
            <TabsTrigger value={item.href} key={item.href}>
              <Link href={item.href}>
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </div>
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProfilMenu;
