import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

/**
 * Cart item type for shoe store
 * Includes selectedSize and selectedColor for shoe products
 */
export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  selectedSize: string
  selectedColor: string
}

type CartStore = {
  items: CartItem[]
  _hasHydrated: boolean
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string, selectedSize: string, selectedColor: string) => void
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
  setHasHydrated: (state: boolean) => void
  initializeFromStorage: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      /**
       * Add item to cart - uses productId + size + color as unique key
       */
      addItem: (item) => {
        set((state) => {
          // Unique key: productId + size + color
          const key = `${item.productId}:${item.selectedSize}:${item.selectedColor}`
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.selectedSize === item.selectedSize &&
              i.selectedColor === item.selectedColor
          )

          if (existingIndex >= 0) {
            // Update quantity if item already exists
            const newItems = [...state.items]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + item.quantity,
            }
            return { items: newItems }
          }

          // Add new item
          return {
            items: [
              ...state.items,
              { ...item, id: key },
            ],
          }
        })
      },

      /**
       * Remove item from cart by productId + size + color
       */
      removeItem: (productId, selectedSize, selectedColor) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.selectedSize === selectedSize &&
                i.selectedColor === selectedColor
              )
          ),
        }))
      },

      /**
       * Update quantity of a cart item
       */
      updateQuantity: (productId, selectedSize, selectedColor, quantity) => {
        if (quantity < 1) return // Prevent zero or negative quantities

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.selectedSize === selectedSize &&
            i.selectedColor === selectedColor
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      /**
       * Clear all items from cart
       */
      clearCart: () => set({ items: [] }),

      /**
       * Calculate total price
       */
      total: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },

      /**
       * Count total items in cart
       */
      itemCount: () => {
        return get().items.reduce(
          (count, item) => count + item.quantity,
          0
        )
      },

      /**
       * Mark hydration as complete
       */
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      /**
       * Initialize cart from localStorage (client-side only)
       */
      initializeFromStorage: () => {
        if (typeof window === 'undefined') {
          set({ _hasHydrated: true })
          return
        }
        try {
          const savedCart = localStorage.getItem('shopping-cart')
          if (savedCart) {
            const { state } = JSON.parse(savedCart)
            if (state && state.items) {
              useCart.setState({ items: state.items, _hasHydrated: true })
              return
            }
          }
        } catch (error) {
          console.error('Error hydrating cart:', error)
        }
        useCart.setState({ _hasHydrated: true })
      },
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true)
        }
      },
    }
  )
)
