"use client";

import { ProductWithDetails } from "@/app/(local)/products/[uid]/types";
import { Scent } from "@/app/(local)/products/[uid]/types";
import { createContext, useContext, useState, useEffect } from "react";

interface CartItem extends ProductWithDetails {
  quantity: number;
  selectedScent: Scent;
}

// Cart context interface
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: ProductWithDetails & { selectedScent: Scent }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

// Creating CartContext with default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Charger le panier depuis les cookies au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sauvegarder le panier dans les cookies à chaque modification
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Function to add items to the cart
  const addToCart = (item: ProductWithDetails & { selectedScent: Scent }) => {
    console.log("Adding item:", item);
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.id === item.id &&
          cartItem.selectedScent.id === item.selectedScent.id
      );

      if (existingItem) {
        console.log("Item already in cart, updating quantity");
        return prevCart.map((cartItem) =>
          cartItem.id === item.id &&
          cartItem.selectedScent.id === item.selectedScent.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      console.log("New item added to cart");
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Function to update quantity of an item in the cart
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  // Function to remove item from the cart
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use Cart context
export const useCart = () => {
  const context = useContext(CartContext);

  // Error handling if useCart is used outside CartProvider
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
