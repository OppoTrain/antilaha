import type { Timestamp } from "firebase/firestore"

// Shared types for the admin dashboard
export interface Product {
  packageAttachment: boolean
  featured: boolean
  salePrice: undefined
  productId: string
  id: string
  name: string
  description?: string
  price: number
  stock: number
  size?: string
  categories?: string[]
  images?: string[]
  bestseller?: boolean
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  soldCount?: number
  // New fields for Arabic support
  nameAr?: string
  descriptionAr?: string
  specifications?: {
    title: string
    content: string
    titleAr?: string
    contentAr?: string
  }[]
  // Existing fields
  sale?: {
    originalPrice: number
    salePrice: number
    discountType: "percentage" | "fixed"
    discountAmount: number
    startDate: Date | Timestamp
    endDate: Date | Timestamp
  }
  tags?: any
  barcode?: any
  brand?: any
}

export interface Category {
  id: string
  name: string
  visible: boolean
  image?: string
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  sale?: {
    type: "percentage" | "fixed"
    value: number
    startDate: Timestamp | Date
    endDate: Timestamp | Date
    active: boolean
  }
}

export interface Order {
  id: string
  customerName?: string
  customerAvatar?: string
  customerEmail?: string
  customerPhone?: string
  status?: string
  totalAmount?: number
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
  items?: OrderItem[]
  subtotal?: number
  shipping?: number
  tax?: number
  discount?: number
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  customerId?: string
}

export interface OrderItem {
  productId: string
  name?: string
  quantity: number
  price?: number
}

export interface Customer {
  id: string
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  orderCount?: number
  totalSpent?: number
  lastOrderDate?: Timestamp | Date
  createdAt?: Timestamp | Date
  avatar?: string
}

export interface DiscountCode {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase?: number
  startDate: Timestamp | Date
  endDate: Timestamp | Date
  usageLimit?: number
  usageCount?: number
  active: boolean
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface UploadedImage {
  file?: File
  preview: string
  url?: string
}

export type LanguageKey = "en" | "ar"
