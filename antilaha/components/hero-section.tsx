"use client"

import { ArrowRight, ChevronLeft, ChevronRight, Play, Calendar, User, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"

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

interface FeaturedContent {
  id: string
  title: string
  description: string
  image: string
  type: "article" | "video"
  author: string
  date: string
  readTime?: string
  duration?: string
  category: string
}

const fallbackContent: FeaturedContent[] = [
  {
    id: "fallback-1",
    title: "مرحباً بك في موقعنا",
    description: "ابدأ بإضافة مقالات جديدة لتظهر هنا في القسم الرئيسي",
    image: "/placeholder.svg?height=400&width=600",
    type: "article",
    author: "فريق الموقع",
    date: "اليوم",
    readTime: "دقيقة واحدة",
    category: "welcome",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent[]>(fallbackContent)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredContent.length)
  }, [featuredContent.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredContent.length) % featuredContent.length)
  }, [featuredContent.length])

  useEffect(() => {
    if (featuredContent.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [nextSlide, featuredContent.length, isPaused])

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setIsLoading(true)
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

        setPosts(fetchedPosts)

        if (fetchedPosts.length > 0) {
          const convertedContent: FeaturedContent[] = fetchedPosts.map((post) => {
            const textContent = post.content.find((block) => block.type === "text" && block.content.trim())
            const description = textContent
              ? textContent.content.substring(0, 150) + (textContent.content.length > 150 ? "..." : "")
              : "اقرأ المقال كاملاً لمعرفة المزيد"

            const hasVideo = post.content.some((block) => block.type === "image" && block.content.includes("video"))

            let formattedDate = "منذ قليل"
            if (post.createdAt && post.createdAt.toDate) {
              try {
                const date = post.createdAt.toDate()
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - date.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                if (diffDays === 1) {
                  formattedDate = "منذ يوم واحد"
                } else if (diffDays < 7) {
                  formattedDate = `منذ ${diffDays} أيام`
                } else if (diffDays < 30) {
                  const weeks = Math.floor(diffDays / 7)
                  formattedDate = weeks === 1 ? "منذ أسبوع" : `منذ ${weeks} أسابيع`
                } else {
                  const months = Math.floor(diffDays / 30)
                  formattedDate = months === 1 ? "منذ شهر" : `منذ ${months} أشهر`
                }
              } catch (err) {
                console.error("Error formatting date:", err)
                formattedDate = "منذ قليل"
              }
            }

            const totalWords = post.content
              .filter((block) => block.type === "text")
              .reduce((acc, block) => acc + block.content.split(" ").length, 0)
            const readTime = Math.max(1, Math.ceil(totalWords / 200))

            return {
              id: post.id,
              title: post.title,
              description,
              image: post.mainImage || "/placeholder.svg?height=400&width=600",
              type: hasVideo ? "video" : "article",
              author: post.author,
              date: formattedDate,
              readTime: `${readTime} ${readTime === 1 ? "دقيقة" : "دقائق"}`,
              category: post.categories[0] || "general",
            }
          })

          setFeaturedContent(convertedContent)
        } else {
          setFeaturedContent(fallbackContent)
        }
      } catch (err) {
        console.error("Error fetching posts:", err)
        setError("حدث خطأ في تحميل المقالات")
        setFeaturedContent(fallbackContent)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestPosts()
  }, [])

  const currentContent = featuredContent[currentSlide]

  // Animation variants for slide transitions
  const slideVariants = {
    hidden: { opacity: 0, x: 100, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, x: -100, scale: 0.95, transition: { duration: 0.8, ease: "easeIn" } },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } },
  }

  if (isLoading) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 mt-8 mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 shadow-2xl">
          <div className="flex items-center justify-center py-32">
            <div className="text-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p className="text-lg">جارٍ تحميل أحدث المقالات...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 mt-8 mb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-900 via-red-800 to-red-700 shadow-2xl">
          <div className="flex items-center justify-center py-32">
            <div className="text-center text-white">
              <p className="text-lg mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} className="bg-white text-red-800 hover:bg-red-50">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 mt-8 mb-16">
      <div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 shadow-2xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative">
          <div className="absolute inset-0">
            <motion.div
              key={`bg-${currentSlide}`}
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              className="absolute inset-0"
            >
              <Image
                src={currentContent.image || "/placeholder.svg"}
                alt={currentContent.title}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-800/60 to-purple-700/80"></div>
            </motion.div>
          </div>

          <div className="relative px-6 py-16 md:px-12 md:py-24 lg:px-16 lg:py-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="text-white" dir="rtl">
                  <motion.div variants={textVariants} initial="hidden" animate="visible">
                    <div className="mb-4 inline-flex items-center rounded-full bg-purple-600/30 px-4 py-2 text-sm font-medium text-purple-100 border border-purple-400/30">
                      {currentContent.type === "video" ? (
                        <>
                          <Play className="ml-2 h-4 w-4" />
                          فيديو
                        </>
                      ) : (
                        <>
                          <Calendar className="ml-2 h-4 w-4" />
                          مقال
                        </>
                      )}
                    </div>
                  </motion.div>

                  <motion.h1
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl"
                  >
                    {currentContent.title}
                  </motion.h1>

                  <motion.p
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6 text-lg leading-relaxed text-purple-100 md:text-xl"
                  >
                    {currentContent.description}
                  </motion.p>

                  <motion.div
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-8 flex flex-wrap items-center gap-4 text-sm text-purple-200"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {currentContent.author}
                    </div>
                    {currentContent.readTime && <div className="text-purple-300">{currentContent.readTime}</div>}
                    {currentContent.duration && <div className="text-purple-300">{currentContent.duration}</div>}
                  </motion.div>

                  {posts.length > 0 && (
                    <motion.div variants={textVariants} initial="hidden" animate="visible" className="mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-200 border border-green-400/30">
                        مقال حديث • {posts.length} {posts.length === 1 ? "مقال متاح" : "مقالات متاحة"}
                      </span>
                    </motion.div>
                  )}

                  <motion.div variants={textVariants} initial="hidden" animate="visible">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-purple-800 hover:bg-purple-50 hover:text-purple-900 transition-all duration-200 hover:scale-105 shadow-lg text-lg px-8 py-4 rounded-xl font-semibold"
                    >
                      <Link href={`/post/${currentContent.id}`}>
                        {currentContent.type === "video" ? "مشاهدة الفيديو" : "قراءة المقال"}
                        <ArrowLeft className="mr-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                <div className="relative">
                  <motion.div
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden rounded-2xl shadow-2xl"
                  >
                    <Image
                      src={currentContent.image || "/placeholder.svg"}
                      alt={currentContent.title}
                      width={600}
                      height={500}
                      className="object-cover w-full h-[300px] md:h-[400px] lg:h-[500px]"
                    />
                    {currentContent.type === "video" && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200 cursor-pointer">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {featuredContent.length > 1 && (
            <>
              <motion.button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
              <motion.button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            </>
          )}
        </div>

        {featuredContent.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredContent.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setCurrentSlide(index)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 1000)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
        )}

        {featuredContent.length > 1 && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            />
          </div>
        )}
      </div>

      {posts.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-8">
            <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-800 mb-2">لا توجد مقالات حتى الآن</h3>
            <p className="text-purple-600 mb-4">ابدأ بكتابة أول مقال لك ليظهر هنا في القسم الرئيسي</p>
            <Button
              onClick={() => (window.location.href = "/admin")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              إضافة مقال جديد
            </Button>
          </div>
        </motion.div>
      )}
    </section>
  )
}