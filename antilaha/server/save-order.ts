import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore"
import type { Product, DiscountCode } from "@/components/types" // Updated import

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface ShippingAddress {
  address: string
  apartment?: string
  city: string
  cityId: string
  country: string
  postalCode?: string
}

interface DiscountData {
  id: string
  code: string
  value: number
  type: "percentage" | "fixed"
}

interface OrderData {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  totalAmount: number
  paymentMethod: string
  notes?: string
  discountData?: DiscountData | null
}

// Utility function to remove undefined values from an object
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefined(item))
  }

  if (typeof obj === "object") {
    const result: any = {}
    for (const key in obj) {
      const value = removeUndefined(obj[key])
      if (value !== undefined) {
        result[key] = value
      } else {
        result[key] = null // Replace undefined with null
      }
    }
    return result
  }

  return obj
}

export async function saveOrder(orderData: OrderData) {
  try {
    console.log("Starting order process with data:", JSON.stringify(orderData, null, 2))

    // Clean up any undefined values
    const cleanOrderData = removeUndefined(orderData)

    // Add default status as pending and timestamps
    const newOrder = {
      ...cleanOrderData,
      status: "pending", // Default status for new orders
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    console.log("Checking stock for items:", newOrder.items.length)

    // First check if all products exist and have enough stock
    for (const item of newOrder.items) {
      if (!item.productId) {
        console.error("Item missing productId:", item)
        return {
          success: false,
          error: `Item missing product ID: ${item.name || "Unknown product"}`,
        }
      }

      // Check if product exists and has enough stock
      const productRef = doc(db, "products", item.productId)
      const productSnap = await getDoc(productRef)

      if (!productSnap.exists()) {
        console.error(`Product ${item.productId} not found`)
        return {
          success: false,
          error: `Product not found: ${item.name || item.productId}`,
        }
      }

      const productData = productSnap.data() as Product | undefined
      const currentStock = productData?.stock || 0

      console.log(
        `Product ${item.productId} (${item.name}): Current stock = ${currentStock}, Requested = ${item.quantity}`,
      )

      if (currentStock < item.quantity) {
        console.error(`Not enough stock for ${item.name}. Available: ${currentStock}, Requested: ${item.quantity}`)
        return {
          success: false,
          error: `Not enough stock for ${item.name}. Available: ${currentStock}, Requested: ${item.quantity}`,
        }
      }
    }

    // Add to Firestore first to get the order ID
    console.log("Creating order document")
    const orderRef = await addDoc(collection(db, "orders"), newOrder)
    const orderId = orderRef.id
    console.log("Order created with ID:", orderId)

    // Now update stock for each item
    console.log("Updating stock for items")
    for (const item of newOrder.items) {
      try {
        const productRef = doc(db, "products", item.productId)
        const productSnap = await getDoc(productRef)
        const productData = productSnap.data() as Product | undefined
        const currentStock = productData?.stock || 0
        const newStock = currentStock - item.quantity

        console.log(`Updating stock for ${item.productId} (${item.name}): ${currentStock} -> ${newStock}`)

        // Update the stock
        await updateDoc(productRef, {
          stock: newStock,
          updatedAt: serverTimestamp(),
        })
      } catch (error) {
        console.error(`Error updating stock for product ${item.productId}:`, error)
        // We don't return here because we want to continue updating other products
        // The order is already created
      }
    }

    // Update discount code usage if one was applied
    if (orderData.discountData) {
      try {
        console.log("Updating discount usage for code:", orderData.discountData.code)
        await updateDiscountUsage(orderData.discountData.id)
      } catch (error) {
        console.error("Error updating discount usage:", error)
        // We don't fail the order if discount update fails
      }
    }

    return {
      success: true,
      orderId: orderId,
    }
  } catch (error) {
    console.error("Error saving order:", error)
    return {
      success: false,
      error: "Failed to save order: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

// Function to update discount code usage
async function updateDiscountUsage(discountId: string) {
  try {
    const discountRef = doc(db, "discountCodes", discountId)
    const discountSnap = await getDoc(discountRef)

    if (!discountSnap.exists()) {
      throw new Error(`Discount code ${discountId} not found`)
    }

    const discountData = discountSnap.data() as DiscountCode
    const currentUsageCount = discountData.usageCount || 0

    await updateDoc(discountRef, {
      usageCount: currentUsageCount + 1,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error updating discount usage:", error)
    return false
  }
}
