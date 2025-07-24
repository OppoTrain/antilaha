"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Navbar from "@/components/Navigations/main-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SplitText from "@/src/TextAnimations/ScrollReveal/ScrollReveal"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  User,
  Clock,
  Share2,
  Heart,
  Bookmark,
  ArrowLeft,
  Facebook,
  Twitter,
  MessageCircle,
  Tag,
  Eye,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BlurText from "@/src/TextAnimations/BlurText/BlurText"
import { motion } from "framer-motion"

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
  likes?: number
}

interface Category {
  id: string
  name: string
}

interface PostPageProps {
  postId: string
}

export function PostPage({ postId }: PostPageProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) {
        console.error("No postId provided")
        setError("معرف المقال مفقود")
        setIsLoading(false)
        return
      }

      if (typeof postId !== "string" || postId.trim() === "") {
        console.error("Invalid postId:", postId)
        setError("معرف المقال غير صحيح")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching post with ID:", postId)

        const postDoc = await getDoc(doc(db, "posts", postId))
        if (!postDoc.exists()) {
          console.log("Post document does not exist")
          setError("المقال غير موجود")
          return
        }

        const postData = { id: postDoc.id, ...postDoc.data() } as Post
        console.log("Raw post data:", postData)

        if (!postData.title || !postData.author) {
          console.error("Post data incomplete:", postData)
          setError("بيانات المقال غير مكتملة")
          return
        }

        setPost(postData)
        setLikesCount(postData.likes || 0)
        console.log("Post loaded successfully:", postData.title)

        const categoriesRef = collection(db, "categories")
        const categoriesSnapshot = await getDocs(categoriesRef)
        const fetchedCategories: Category[] = []
        categoriesSnapshot.forEach((doc) => {
          fetchedCategories.push({
            id: doc.id,
            name: doc.data().name,
          })
        })
        setCategories(fetchedCategories)
        console.log("Categories loaded:", fetchedCategories)

        if (postData.categories && postData.categories.length > 0) {
          try {
            const postsRef = collection(db, "posts")
            const recommendedQuery = query(
              postsRef,
              where("categories", "array-contains-any", postData.categories),
              where("status", "==", "published"),
              orderBy("createdAt", "desc"),
              limit(6),
            )

            const recommendedSnapshot = await getDocs(recommendedQuery)
            const recommended: Post[] = []
            recommendedSnapshot.forEach((doc) => {
              if (doc.id !== postId) {
                recommended.push({ id: doc.id, ...doc.data() } as Post)
              }
            })
            setRecommendedPosts(recommended.slice(0, 4))
            console.log("Recommended posts loaded:", recommended.length)
          } catch (recommendedError) {
            console.error("Error fetching recommended posts:", recommendedError)
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("حدث خطأ في تحميل المقال")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPostData()
  }, [postId])

  const formatDate = (createdAt: any) => {
    if (!createdAt || !createdAt.toDate) return "غير محدد"

    try {
      const date = createdAt.toDate()
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (err) {
      return "غير محدد"
    }
  }

  const calculateReadTime = (content: any[]) => {
    if (!content || !Array.isArray(content)) return 1

    const totalWords = content
      .filter((block) => block && block.type === "text" && block.content)
      .reduce((acc, block) => acc + block.content.split(" ").length, 0)
    return Math.max(1, Math.ceil(totalWords / 200))
  }

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categoryIds || !Array.isArray(categoryIds)) return []
    return categoryIds.map((id) => categories.find((cat) => cat.id === id)?.name).filter(Boolean)
  }

  const shareOnFacebook = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const url = encodeURIComponent(`${baseUrl}/post/${postId}`)
    const title = encodeURIComponent(post?.title || "Check out this article!")
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, "_blank")
  }

  const shareOnTwitter = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const url = encodeURIComponent(`${baseUrl}/post/${postId}`)
    const title = encodeURIComponent(post?.title || "Check out this article!")
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, "_blank")
  }

  const shareOnWhatsApp = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const url = encodeURIComponent(`${baseUrl}/post/${postId}`)
    const title = encodeURIComponent(post?.title || "Check out this article!")
    window.open(`https://wa.me/?text=${title}%20${url}`, "_blank")
  }

  const renderContent = (content: any[]) => {
    if (!content || !Array.isArray(content)) {
      return <p className="text-gray-600">لا يوجد محتوى متاح</p>
    }

    return content.map((block, index) => {
      if (!block) return null

      if (block.type === "text" && block.content) {
        let formattedContent = block.content

        const lines = formattedContent.split("\n")
        const hasNumbering = lines.some((line: string) => /^\d+[-.]/.test(line.trim()))

        if (hasNumbering) {
          const numberedLines = lines
            .map((line: string) => {
              if (/^\d+[-.]/.test(line.trim())) {
                return `<div class="mb-3 flex items-start gap-3"><span class="font-bold text-purple-600 min-w-[24px]">${line.match(/^\d+/)?.[0]}.</span><span>${line.replace(/^\d+[-.]?\s*/, "")}</span></div>`
              }
              return line ? `<div class="mb-2">${line}</div>` : '<div class="mb-2"></div>'
            })
            .join("")

          formattedContent = `<div class="numbered-content">${ numberedLines}</div>`
        } else {
          formattedContent = formattedContent.replace(/\n/g, "<br>")
        }

        formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        formattedContent = formattedContent.replace(/\*(.*?)\*/g, "<em>$1</em>")
        formattedContent = formattedContent.replace(/__(.*?)__/g, "<u>$1</u>")

        const textStyle = {
          textAlign: (block.styles?.align || "right") as "left" | "right" | "center",
          fontWeight: block.styles?.bold ? "bold" : "normal",
          fontStyle: block.styles?.italic ? "italic" : "normal",
          textDecoration: block.styles?.underline ? "underline" : "none",
        }

        return (
          <div
            key={index}
            className="mb-8 text-lg leading-relaxed text-gray-800"
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        )
      } else if (block.type === "image" && block.content) {
        return (
          <div key={index} className="mb-8">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src={block.content || "/placeholder.svg"}
                alt="Post content image"
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )
      }
      return null
    })
  }

  // Animation variants for share buttons
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.4 } },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.9 },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">جارٍ تحميل المقال</h3>
            <p className="text-gray-600 mb-4">يرجى الانتظار قليلاً...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Post ID: {postId}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error || "المقال غير موجود"}</p>
              <p className="text-sm text-gray-500 mb-4">Post ID: {postId}</p>
              <div className="flex gap-2 justify-center">
                <Link href="/">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">العودة للرئيسية</Button>
                </Link>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-purple-200 text-purple-600"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function handleAnimationComplete(): void {
    console.log("Title animation finished")
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <Image src={post.mainImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto text-white">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {getCategoryNames(post.categories || []).map((categoryName) => (
                  <Badge key={categoryName} className="bg-purple-600 text-white hover:bg-purple-700">
                    {categoryName}
                  </Badge>
                ))}
              </div>
              <SplitText
                text={post.title}
                className="text-2xl md:text-5xl font-bold text-center mb-4 leading-tight"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                onLetterAnimationComplete={handleAnimationComplete}
              />

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{calculateReadTime(post.content)} دقائق قراءة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Article Content */}
            <article className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-16">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div dir="rtl" className="flex flex-wrap gap-3 multitudinouse mb-8 font-arabic text-right">
                    <Tag className="w-4 h-4 text-purple-600 mt-1" />
                    {post.tags.map((tag, index) => (
                      <BlurText
                        key={tag}
                        text={tag}
                        delay={index * 150}
                        animateBy="words"
                        direction="top"
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">{renderContent(post.content || [])}</div>

                {/* Social Actions */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsLiked(!isLiked)
                          setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
                        }}
                        className={`${isLiked ? "bg-red-50 border-red-200 text-red-600" : "border-gray-200"}`}
                      >
                        <Heart className={`w-4 h-4 ml-2 ${isLiked ? "fill-current" : ""}`} />
                        إعجاب {likesCount > 0 && `(${likesCount})`}
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`${isBookmarked ? "bg-blue-50 border-blue-200 text-blue-600" : "border-gray-200"}`}
                      >
                        <Bookmark className={`w-4 h-4 ml-2 ${isBookmarked ? "fill-current" : ""}`} />
                        حفظ
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
                  >
                    <span className="text-sm text-gray-500 ml-3">مشاركة:</span>
                    <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareOnFacebook}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                      >
                        <Facebook className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareOnTwitter}
                        className="border-sky-200 text-sky-600 hover:bg-sky-50 bg-transparent"
                      >
                        <Twitter className="w-4 h-4" />
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareOnWhatsApp}
                        className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Author Card */}
                <Card className="border-2 border-purple-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-purple-800 mb-2">{post.author}</h3>
                    <p className="text-gray-600 text-sm">كاتب المقال</p>
                  </CardContent>
                </Card>

                {/* Quick Share */}
                <Card className="border-2 border-purple-200">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      مشاركة سريعة
                    </h3>
                    <div className="space-y-3">
                      <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                        <Button
                          onClick={shareOnFacebook}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Facebook className="w-4 h-4 ml-2" />
                          فيسبوك
                        </Button>
                      </motion.div>
                      <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                        <Button
                          onClick={shareOnTwitter}
                          className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                          size="sm"
                        >
                          <Twitter className="w-4 h-4 ml-2" />
                          تويتر
                        </Button>
                      </motion.div>
                      <motion.div variants={buttonVariants} initial="hidden" animate="visible">
                        <Button
                          onClick={shareOnWhatsApp}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <MessageCircle className="w-4 h-4 ml-2" />
                          واتساب
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Recommended Posts */}
      {recommendedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-purple-800 mb-4">مقالات ذات صلة</h2>
              <p className="text-gray-600">اكتشف المزيد من المحتوى المشابه</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedPosts.map((recommendedPost) => (
                <Link key={recommendedPost.id} href={`/post/${recommendedPost.id}`}>
                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-purple-100 hover:border-purple-300 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={recommendedPost.mainImage || "/placeholder.svg"}
                        alt={recommendedPost.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-purple-800 backdrop-blur-sm">
                          <Clock className="w-3 h-3 ml-1" />
                          {calculateReadTime(recommendedPost.content)} دقائق
                        </Badge>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-purple-800 line-clamp-2 group-hover:text-purple-600 transition-colors mb-2">
                        {recommendedPost.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{recommendedPost.author}</span>
                        <span>{formatDate(recommendedPost.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Top */}
      <div className="fixed bottom-8 left-8">
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 rotate-90" />
        </Button>
      </div>
    </div>
  )
}