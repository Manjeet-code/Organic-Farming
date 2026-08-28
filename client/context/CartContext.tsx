"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProductType {
  _id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  dailyStockCeiling: number;
  isAvailableToday: boolean;
  substituteProductId?: any;
  image: string;
  description: string;
  isSubscriptionEligible: boolean;
  subscriptionDiscount: number;
  isActive: boolean;
}

export interface CartItem {
  product: ProductType;
  quantity: number;
  isSubscriptionItem?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductType, quantity?: number, isSubscriptionItem?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("farmfresh_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem("farmfresh_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = (product: ProductType, quantity = 1, isSubscriptionItem = false) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty > product.dailyStockCeiling ? product.dailyStockCeiling : newQty,
          isSubscriptionItem,
        };
        return updated;
      }
      return [...prevCart, { product, quantity, isSubscriptionItem }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product._id === productId) {
          const clampedQty = quantity > item.product.dailyStockCeiling ? item.product.dailyStockCeiling : quantity;
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.isSubscriptionItem
      ? item.product.price * (1 - (item.product.subscriptionDiscount || 5) / 100)
      : item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
