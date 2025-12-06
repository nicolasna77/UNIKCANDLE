"use client";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";

const CartButton = () => {
  const { cart } = useCart();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <Link href="/cart" className=" hover:text-primary">
        <ShoppingCartIcon className="w-6 h-6" />
        {mounted && totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {totalItems}
          </span>
        )}
      </Link>
    </div>
  );
};

export default CartButton;
