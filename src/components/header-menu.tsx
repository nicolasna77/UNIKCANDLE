"use client";

import {
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function HeaderMenu({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList>
          {links.map((link) => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink
                href={link.href}
                className={navigationMenuTriggerStyle()}
              >
                {link.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
