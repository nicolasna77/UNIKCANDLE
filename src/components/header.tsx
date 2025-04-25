"use client";

import Link from "next/link";
import Image from "next/image";
import AuthButton from "./auth-button";
import HeaderMenu from "./header-menu";
import { ShoppingCartIcon } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cart } = useCart();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div>
      <header className="fixed shadow-sm bg-white top-0 inset-x-0 z-50 transition-all duration-300">
        <nav className=" mx-auto max-w-screen-3xl px-4 flex items-center justify-between h-16">
          <Link href="/" className="text-xl    font-bold">
            <Image
              src="/logo/logo-primary-color.png"
              alt="logo"
              width={40}
              height={40}
              quality={100}
            />
          </Link>
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <HeaderMenu />
          </div>
          <div className="flex items-center gap-5">
            <div className="relative ">
              <Link href="/cart">
                <ShoppingCartIcon className="text-primary w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
            <AuthButton />
            <div className="md:hidden">
              <HeaderMenu />
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
