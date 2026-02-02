"use client";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useEffect, useState, useMemo } from "react";

const CartButton = () => {
  const { cart } = useCart();

  // Memoize the total calculation to avoid recomputing on every render
  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <Link href="/cart" className=" hover:text-primary" aria-label={`Shopping cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}>
        <ShoppingCartIcon className="w-6 h-6" aria-hidden="true" />
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
