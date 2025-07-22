"use client"
import { useState, useEffect } from "react"
import  Navbar  from "@/components/Navigations/main-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, User, Clock, FolderOpen, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string
  title: string
  mainImage: string
  author: string
  categories: string[]
  tags: string[]
  content: any[]
  createdAt: string | null
  status: "draft" | "published"
}

interface Category {
  id: string
  name: string
  description: string
  order: number
  image?: string
}

interface CategoryPostsPageProps {
  category: Category | null
  posts: Post[]
  error: string | null
}

export function CategoryPostsPage({ category, posts: initialPosts, error }: CategoryPostsPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setPosts(initialPosts)
    setIsLoading(false)
    if (error) {
      toast({
        title: "خطأ في التحميل",
        description: error,
        variant: "destructive",
      })
    } else if (category) {
      toast({
        title: "تم تحميل الفئة والمقالات",
        description: `تم تحميل فئة "${category.name}" و ${initialPosts.length} مقال بنجاح.`,
      })
    }
  }, [category, initialPosts, error, toast])

  const formatDate = (_createdAt: string | null) => {
    // Hardcode the date to "1-1-2-2025" as requested
    return "1-1-2-2025"
  }

  const calculateReadTime = (content: any[]) => {
    if (!content || !Array.isArray(content)) return 1
    const totalWords = content
      .filter((block) => block?.type === "text" && block.content && typeof block.content === "string")
      .reduce((acc, block) => acc + block.content.split(/\s+/).length, 0)
    return Math.max(1, Math.ceil(totalWords / 200))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16">
          {/* Category Banner Skeleton */}
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-12">
            <Skeleton className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
          {/* Posts Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-2 border-purple-100 overflow-hidden">
                <Skeleton className="relative h-48 w-full" /> {/* Adjusted height for image skeleton */}
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16">
          <div className="text-center py-20">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error || "حدث خطأ غير متوقع"}</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-16">
        {/* Category Banner */}
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg mb-12">
          <Image
            src={category.image || "/placeholder.svg?height=400&width=1200&query=abstract purple background"}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{category.name}</h1>
            <p className="text-lg md:text-xl text-gray-200 mb-4 max-w-2xl">{category.description}</p>
            <Badge className="bg-purple-500 text-white text-base px-4 py-2 rounded-full w-fit">
              {posts.length} {posts.length === 1 ? "مقال" : "مقالات"}
            </Badge>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-purple-100 hover:border-purple-300 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    {" "}
                    {/* Fixed height for image */}
                    <Image
                      src={post.mainImage || "/placeholder.svg?height=192&width=300&query=blog post image"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-purple-800 backdrop-blur-sm">
                        <Clock className="w-3 h-3 ml-1" />
                        {calculateReadTime(post.content)} دقائق
                      </Badge>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h3 className="font-bold text-purple-800 line-clamp-2 group-hover:text-purple-600 transition-colors text-lg">
                        {post.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                              +{post.tags.length - 3}
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
        ) : (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-12 max-w-lg mx-auto">
              <FolderOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">لا توجد مقالات في هذه الفئة</h3>
           
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
