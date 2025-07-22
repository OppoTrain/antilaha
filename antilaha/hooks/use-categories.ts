// hooks/use-categories.ts
"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Post {
  id: string
  title: string
  url: string
}

interface Category {
  id: string
  name: string
  order: number
  posts: Post[]
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const categoriesCollectionRef = collection(db, "categories")
        const q = query(categoriesCollectionRef, orderBy("order", "asc"))
        const categorySnapshot = await getDocs(q)

        const fetchedCategories: Category[] = []
        for (const categoryDoc of categorySnapshot.docs) {
          const categoryData = categoryDoc.data()
          const categoryId = categoryDoc.id

          const postsCollectionRef = collection(db, `categories/${categoryId}/posts`)
          const postSnapshot = await getDocs(postsCollectionRef)
          const posts: Post[] = postSnapshot.docs.map((postDoc) => ({
            id: postDoc.id,
            ...postDoc.data(),
          })) as Post[]

          fetchedCategories.push({
            id: categoryId,
            name: categoryData.name,
            order: categoryData.order,
            posts: posts,
          })
        }
        setCategories(fetchedCategories)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to fetch categories. Please check your Firebase configuration and network connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
