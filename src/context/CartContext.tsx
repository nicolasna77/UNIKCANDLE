"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Types sérialisables pour le localStorage (évite les problèmes de types Prisma)
interface CartScent {
  id: string;
  name: string;
  nameEN: string | null;
  color: string | null;
  icon: string | null;
}

interface CartCategory {
  id: string;
  name: string;
  nameEN: string | null;
  icon: string | null;
  color: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  selectedScent: CartScent;
  category: CartCategory;
  quantity: number;
  description: string;
  subTitle: string;
  audioUrl?: string; // URL de l'audio enregistré
  textMessage?: string; // Message texte personnalisé
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
  updateItemTextMessage: (id: string, textMessage: string) => void;
  removeItemTextMessage: (id: string) => void;
}

// Creating CartContext with default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Lazy initialization: read localStorage only once on mount, not on every render
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error(
          "Erreur lors du parsing du panier depuis localStorage:",
          error
        );
        // localStorage corrompu, on le supprime
        localStorage.removeItem("cart");
      }
    }
    return [];
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Marquer comme initialisé après le premier render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    // Ne pas sauvegarder pendant l'initialisation pour éviter d'écraser avec un panier vide
    if (!isInitialized) return;

    if (cart.length === 0) {
      // Supprimer le localStorage si le panier est vide
      localStorage.removeItem("cart");
    } else {
      // Sauvegarder dans localStorage (pas de limite de 4KB comme les cookies)
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // Helper function to generate unique key for cart items
  const getItemKey = (item: CartItem) => {
    return `${item.id}-${item.selectedScent.id}-${item.audioUrl || "no-audio"}-${item.textMessage || "no-text"}`;
  };

  // Helper function to check if two items are the same (same product + scent + exact audio/text)
  const isSameItem = (item1: CartItem, item2: CartItem) => {
    return (
      item1.id === item2.id &&
      item1.selectedScent.id === item2.selectedScent.id &&
      // Même audio exact (même URL ou les deux sans audio)
      item1.audioUrl === item2.audioUrl &&
      // Même message texte exact
      item1.textMessage === item2.textMessage
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

  // Function to update text message for a specific item
  const updateItemTextMessage = (itemKey: string, textMessage: string) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (cartItem) => getItemKey(cartItem) === itemKey
      );
      if (itemIndex === -1) return prevCart;

      const item = prevCart[itemIndex];
      const updatedItem = { ...item, textMessage };

      // Créer un nouvel élément avec le message texte
      const newCart = [...prevCart];
      newCart[itemIndex] = updatedItem;

      return newCart;
    });
  };

  // Function to remove text message from a specific item
  const removeItemTextMessage = (itemKey: string) => {
    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex(
        (cartItem) => getItemKey(cartItem) === itemKey
      );
      if (itemIndex === -1) return prevCart;

      const item = prevCart[itemIndex];
      const updatedItem = { ...item, textMessage: undefined };

      // Créer un nouvel élément sans message texte
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
        updateItemTextMessage,
        removeItemTextMessage,
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
