"use client";

import { Scent, Category } from "@prisma/client";
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
  audioUrl?: string; // URL de l'audio enregistré
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
  updateItemAudio: (id: string, audioUrl: string) => void;
  removeItemAudio: (id: string) => void;
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

  // Helper function to generate unique key for cart items
  const getItemKey = (item: CartItem) => {
    return `${item.id}-${item.selectedScent.id}-${item.audioUrl || "no-audio"}`;
  };

  // Helper function to check if two items are the same (same product + scent + exact audio)
  const isSameItem = (item1: CartItem, item2: CartItem) => {
    return (
      item1.id === item2.id &&
      item1.selectedScent.id === item2.selectedScent.id &&
      // Même audio exact (même URL ou les deux sans audio)
      item1.audioUrl === item2.audioUrl
    );
  };

  // Function to add items to the cart
  const addToCart = (item: CartItem) => {
    console.log("Adding item:", item);
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) =>
        isSameItem(cartItem, item)
      );

      if (existingItem) {
        console.log("Item already in cart, updating quantity");
        return prevCart.map((cartItem) =>
          isSameItem(cartItem, item)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      console.log("New item added to cart");
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Function to update quantity of an item in the cart
  const updateQuantity = (itemKey: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((cartItem) => {
        const cartItemKey = getItemKey(cartItem);
        return cartItemKey === itemKey ? { ...cartItem, quantity } : cartItem;
      })
    );
  };

  // Function to remove item from the cart
  const removeFromCart = (itemKey: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartItem) => getItemKey(cartItem) !== itemKey)
    );
  };

  // Function to update audio URL for a specific item
  const updateItemAudio = (itemKey: string, audioUrl: string) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (cartItem) => getItemKey(cartItem) === itemKey
      );
      if (itemIndex === -1) return prevCart;

      const item = prevCart[itemIndex];
      const updatedItem = { ...item, audioUrl };

      // Créer un nouvel élément avec l'audio
      const newCart = [...prevCart];
      newCart[itemIndex] = updatedItem;

      return newCart;
    });
  };

  // Function to remove audio from a specific item
  const removeItemAudio = (itemKey: string) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (cartItem) => getItemKey(cartItem) === itemKey
      );
      if (itemIndex === -1) return prevCart;

      const item = prevCart[itemIndex];
      const updatedItem = { ...item, audioUrl: undefined };

      // Créer un nouvel élément sans audio
      const newCart = [...prevCart];
      newCart[itemIndex] = updatedItem;

      return newCart;
    });
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
        updateItemAudio,
        removeItemAudio,
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
