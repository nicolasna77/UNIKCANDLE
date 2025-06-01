"use client";

import { Scent, Category } from "@/generated/client";
import { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  selectedScent: Scent;
  category: Category;
  quantity: number;
  description: string;
  subTitle: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Cart context interface
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
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
  const addToCart = (item: CartItem) => {
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
