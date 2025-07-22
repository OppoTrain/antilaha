"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Calendar, User, Loader2, Eye, Clock, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"

interface Post {
  id: string
  title: string
  mainImage: string
  author: string
  categories: string[]
  tags: string[]
  content: any[]
  createdAt: any
  status: "draft" | "published"
}

interface Category {
  id: string
  name: string
  description: string
  order: number
  image?: string
  posts: Post[]
  postCount: number
  lastDoc?: any
  hasMore: boolean
}

// Skeleton Components
const PostSkeleton = () => (
  <Card className="flex-shrink-0 w-80 md:w-auto overflow-hidden">
    <div className="bg-gray-200 animate-pulse h-48" />
    <CardContent className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    </CardContent>
  </Card>
)

const CategorySkeleton = () => (
  <div className="space-y-6">
    <div className="text-center space-y-4">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
      <div className="w-24 h-1 bg-purple-200 rounded mx-auto animate-pulse" />
    </div>
    {/* Mobile Skeleton */}
    <div className="md:hidden">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </div>
    {/* Desktop Skeleton */}
    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  </div>
)

export function CategoriesShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCategoriesWithPosts()
  }, [])

  const fetchCategoriesWithPosts = async () => {
    try {
      setIsLoading(true)
      const categoriesRef = collection(db, "categories")
      const categoriesQuery = query(categoriesRef, orderBy("order", "asc"))
      const categoriesSnapshot = await getDocs(categoriesQuery)

      const categoriesWithPosts: Category[] = []

      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = categoryDoc.data()
        const categoryId = categoryDoc.id

        try {
          const allPostsRef = collection(db, "posts")
          const allPostsQuery = query(allPostsRef, where("status", "==", "published"))
          const allPostsSnapshot = await getDocs(allPostsQuery)

          const posts: Post[] = []
          allPostsSnapshot.forEach((postDoc) => {
            const postData = postDoc.data() as Omit<Post, "id">
            const post = { id: postDoc.id, ...postData }

            if (post.categories && post.categories.includes(categoryId)) {
              posts.push(post)
            }
          })

          // Only include categories that have posts
          if (posts.length > 0) {
            posts.sort((a, b) => {
              if (!a.createdAt || !b.createdAt) return 0
              if (!a.createdAt.toDate || !b.createdAt.toDate) return 0
              return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
            })

            const limitedPosts = posts.slice(0, 5)

            categoriesWithPosts.push({
              id: categoryId,
              name: categoryData.name,
              description: categoryData.description,
              order: categoryData.order,
              image: categoryData.image,
              posts: limitedPosts,
              postCount: posts.length,
              hasMore: posts.length > 5,
            })
          }
        } catch (postError) {
          console.error(`Error fetching posts for category ${categoryId}:`, postError)
        }
      }

      setCategories(categoriesWithPosts)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("حدث خطأ في تحميل الفئات والمقالات")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMorePosts = async (categoryId: string) => {
    setLoadingMore((prev) => ({ ...prev, [categoryId]: true }))

    try {
      const allPostsRef = collection(db, "posts")
      const allPostsQuery = query(allPostsRef, where("status", "==", "published"))
      const allPostsSnapshot = await getDocs(allPostsQuery)

      const posts: Post[] = []
      allPostsSnapshot.forEach((postDoc) => {
        const postData = postDoc.data() as Omit<Post, "id">
        const post = { id: postDoc.id, ...postData }

        if (post.categories && post.categories.includes(categoryId)) {
          posts.push(post)
        }
      })

      posts.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        if (!a.createdAt.toDate || !b.createdAt.toDate) return 0
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      })

      const category = categories.find((cat) => cat.id === categoryId)
      const currentPostsCount = category?.posts.length || 0
      const nextPosts = posts.slice(currentPostsCount, currentPostsCount + 5)

      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            const updatedPosts = [...cat.posts, ...nextPosts]
            return {
              ...cat,
              posts: updatedPosts,
              hasMore: updatedPosts.length < posts.length,
            }
          }
          return cat
        }),
      )
    } catch (err) {
      console.error("Error loading more posts:", err)
    } finally {
      setLoadingMore((prev) => ({ ...prev, [categoryId]: false }))
    }
  }

  const formatDate = (createdAt: any) => {
    if (!createdAt || !createdAt.toDate) return "منذ قليل"
    try {
      const date = createdAt.toDate()
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "منذ يوم واحد"
      if (diffDays < 7) return `منذ ${diffDays} أيام`
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return weeks === 1 ? "منذ أسبوع" : `منذ ${weeks} أسابيع`
      }
      const months = Math.floor(diffDays / 30)
      return months === 1 ? "منذ شهر" : `منذ ${months} أشهر`
    } catch (err) {
      return "منذ قليل"
    }
  }

  const calculateReadTime = (content: any[]) => {
    const totalWords = content
      .filter((block) => block.type === "text")
      .reduce((acc, block) => acc + block.content.split(" ").length, 0)
    return Math.max(1, Math.ceil(totalWords / 200))
  }

  if (isLoading) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16" dir="rtl">
        <div className="space-y-16">
          {[1, 2, 3].map((i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16">
        <div className="text-center py-20">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16">
        <div className="text-center py-20">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-12 max-w-lg mx-auto">
            <h3 className="text-2xl font-semibold text-purple-800 mb-3">لا توجد فئات متاحة</h3>
            <p className="text-purple-600 text-lg">سيتم إضافة المحتوى قريباً</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16" dir="rtl">
      <div className="space-y-20">
        {categories.map((category) => (
          <div key={category.id} className="space-y-8">
            {/* Category Title - Centered with Purple Line */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{category.name}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mx-auto"></div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-4 py-1">
                {category.postCount} {category.postCount === 1 ? "مقال" : "مقالات"}
              </Badge>
            </div>

            {/* Posts Grid - Mobile: Horizontal Scroll, Desktop: Grid */}
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {category.posts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="flex-shrink-0">
                    <Card className="w-80 group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-200 hover:border-purple-300 overflow-hidden bg-white">
                      <div className="relative overflow-hidden h-48">
                        <Image
                          src={post.mainImage || "/placeholder.svg"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Reading Time Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white/95 text-purple-800 backdrop-blur-sm shadow-lg">
                            <Clock className="w-3 h-3 ml-1" />
                            {calculateReadTime(post.content)} دقائق
                          </Badge>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30 shadow-xl">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight text-lg">
                            {post.title}
                          </h3>

                          {/* Post Meta */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {post.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                                  +{post.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {category.posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-200 hover:border-purple-300 overflow-hidden bg-white h-full">
                    <div className="relative overflow-hidden h-48">
                      <Image
                        src={post.mainImage || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Reading Time Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/95 text-purple-800 backdrop-blur-sm shadow-lg">
                          <Clock className="w-3 h-3 ml-1" />
                          {calculateReadTime(post.content)} دقائق
                        </Badge>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30 shadow-xl">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="space-y-3 flex-1">
                        <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight text-lg">
                          {post.title}
                        </h3>

                        {/* Post Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium truncate">{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {category.hasMore && (
              <div className="text-center pt-8">
                <Button
                  onClick={() => loadMorePosts(category.id)}
                  disabled={loadingMore[category.id]}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {loadingMore[category.id] ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جارٍ التحميل...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      تحميل المزيد
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Loading More Skeleton */}
            {loadingMore[category.id] && (
              <>
                {/* Mobile Loading Skeleton */}
                <div className="md:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </div>
                </div>
                {/* Desktop Loading Skeleton */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
