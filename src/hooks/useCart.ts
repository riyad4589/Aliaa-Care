import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedFlavors?: string[];
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedFlavors?: string[]) => void;
  updateQuantity: (productId: string, quantity: number, selectedFlavors?: string[]) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1, selectedFlavors = []) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, 10);
            // Append new flavors up to the new quantity
            const combinedFlavors = [...(existingItem.selectedFlavors || []), ...selectedFlavors].slice(0, newQuantity);
            
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { 
                      ...item, 
                      quantity: newQuantity,
                      selectedFlavors: combinedFlavors.length > 0 ? combinedFlavors : undefined
                    }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity, selectedFlavors: selectedFlavors.length > 0 ? selectedFlavors : undefined }],
          };
        });
      },

      updateQuantity: (productId: string, quantity: number, selectedFlavors?: string[]) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id === productId) {
              const newQty = Math.min(quantity, 10);
              let newFlavors = selectedFlavors || item.selectedFlavors || [];
              
              // Adjust flavors array to match new quantity
              if (newFlavors.length > 0) {
                if (newFlavors.length > newQty) {
                  newFlavors = newFlavors.slice(0, newQty);
                } else {
                  // If we need more flavors than we have, pad with the last one or first one
                  const padValue = newFlavors[newFlavors.length - 1] || "";
                  while (newFlavors.length < newQty) {
                    newFlavors.push(padValue);
                  }
                }
              }

              return { 
                ...item, 
                quantity: newQty,
                selectedFlavors: newFlavors.length > 0 ? newFlavors : undefined
              };
            }
            return item;
          }),
        }));
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "maison-cart",
    }
  )
);
