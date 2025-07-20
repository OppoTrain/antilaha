"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Product {
  id: string
  name: string
  price: number
  salePrice?: number
  images?: string[]
  quantity?: number
  sale?: {
    originalPrice: number
    salePrice: number
    discountType: string
    discountAmount: number
    startDate: Date
    endDate: Date
  }
}

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart))
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error)
          setCart([])
        }
      }
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart, isInitialized])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id)

      if (existingItemIndex >= 0) {
        // Update quantity if product already exists in cart
        const updatedCart = [...prevCart]
        const newQuantity = (prevCart[existingItemIndex].quantity || 0) + (product.quantity || 1)
        updatedCart[existingItemIndex] = {
          ...prevCart[existingItemIndex],
          quantity: newQuantity,
        }
        return updatedCart
      } else {
        // Add new product to cart
        const price = product.salePrice || product.sale?.salePrice || product.price
        return [
          ...prevCart,
          {
            ...product,
            quantity: product.quantity || 1,
            price: price,
          },
        ]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          return {
            ...item,
            quantity,
          }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  const subtotal = cart.reduce((total, item) => {
    const price = item.salePrice || item.sale?.salePrice || item.price
    return total + price * item.quantity
  }, 0)

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
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
