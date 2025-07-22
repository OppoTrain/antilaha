// lib/fetchItems.ts
"use client"

import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Define the Post interface to match Firebase data structure
interface Post {
  id: string
  title: string
  mainImage: string
  content: any[]
  createdAt: any
}

// Define the Item interface to match the provided items structure
interface Item {
  image: string
  link: string
  title: string
  description: string
}

// Fallback items
const fallbackItems: Item[] = [
  {
    image: 'https://picsum.photos/300/300?grayscale',
    link: 'https://google.com/',
    title: 'Item 1',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://picsum.photos/400/400?grayscale',
    link: 'https://google.com/',
    title: 'Item 2',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://picsum.photos/500/500?grayscale',
    link: 'https://google.com/',
    title: 'Item 3',
    description: 'This is pretty cool, right?'
  },
  {
    image: 'https://picsum.photos/600/600?grayscale',
    link: 'https://google.com/',
    title: 'Item 4',
    description: 'This is pretty cool, right?'
  }
]

export async function fetchItems(): Promise<Item[]> {
  try {
    const postsRef = collection(db, "posts")
    const q = query(postsRef, orderBy("createdAt", "desc"), limit(5))
    const querySnapshot = await getDocs(q)

    const fetchedPosts: Post[] = []
    querySnapshot.forEach((doc) => {
      const postData = doc.data() as Omit<Post, "id">
      fetchedPosts.push({
        id: doc.id,
        ...postData,
      })
    })

    // Convert posts to Item format
    const items: Item[] = fetchedPosts.map((post) => {
      // Extract first text content as description
      const textContent = post.content.find((block) => block.type === "text" && block.content.trim())
      const description = textContent
        ? textContent.content.substring(0, 150) + (textContent.content.length > 150 ? "..." : "")
        : "اقرأ المقال كاملاً لمعرفة المزيد"

      return {
        image: post.mainImage || "/placeholder.svg?height=400&width=600",
        link: `/posts/${post.id}`, // Assuming a URL structure for posts
        title: post.title,
        description,
      }
    })

    // Return fetched items or fallback if no posts
    return items.length > 0 ? items : fallbackItems
  } catch (err) {
    console.error("Error fetching posts:", err)
    return fallbackItems
  }
}