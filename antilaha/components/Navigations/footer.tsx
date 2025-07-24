"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight, ArrowUp } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function Footer() {
  const { categories, loading, error } = useCategories()
  const [email, setEmail] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { toast } = useToast()
  const [isScrolled, setIsScrolled] = React.useState(false)

  // Scroll detection for back-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "تم الاشتراك بنجاح",
        description: "شكراً لاشتراكك في نشرتنا البريدية",
      })
      setEmail("")
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من تسجيل اشتراكك. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Split categories into columns
  const midPoint = Math.ceil((categories?.length || 0) / 2)
  const leftCategories = categories?.slice(0, midPoint) || []
  const rightCategories = categories?.slice(midPoint) || []

  const logoUrl =
    "https://firebasestorage.googleapis.com/v0/b/curlmaker-ae151.firebasestorage.app/o/1%20(1).png?alt=media&token=521a8455-2ed3-4a73-b0a6-1b735a1886da"

  return (
    <footer className="bg-gradient-to-b from-white to-purple-50 pt-16 border-t border-purple-100" dir="rtl">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
          {/* Logo and About */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt="Your Company Logo"
                width={180}
                height={60}
                className="h-16 w-auto drop-shadow-md hover:scale-105 transition-all duration-300"
              />
            </Link>
            <p className="text-gray-600 leading-relaxed">
              منصة إخبارية متكاملة تقدم أحدث الأخبار والمقالات في مختلف المجالات بمحتوى عربي أصيل وموثوق.
            </p>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="https://www.facebook.com/AntiLaha"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </Link>
           
          
              <Link
                href="https://www.youtube.com/channel/UC961tinJ1frI_ds36zFWJdA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-600 hover:bg-purple-600 hover:text-white transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" />
                <span className="sr-only">Youtube</span>
              </Link>
            </div>
          </div>

          {/* Categories - Left Wing */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-r-4 border-purple-600 pr-3">الفئات</h3>
            <ul className="space-y-3">
              {loading && <li className="text-sm text-gray-500 animate-pulse">جارٍ التحميل...</li>}
              {error && <li className="text-sm text-red-500">حدث خطأ في تحميل الفئات</li>}
              {!loading && !error && leftCategories.length === 0 && (
                <li className="text-sm text-gray-500">لا توجد فئات</li>
              )}
              {!loading &&
                !error &&
                leftCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.id}`}
                      className="text-gray-600 hover:text-purple-700 transition-colors duration-200 flex items-center group"
                    >
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      <span>{category.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Categories - Right Wing */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-r-4 border-purple-600 pr-3">المزيد من الفئات</h3>
            <ul className="space-y-3">
              {!loading && !error && rightCategories.length === 0 && (
                <li className="text-sm text-gray-500">لا توجد فئات إضافية</li>
              )}
              {!loading &&
                !error &&
                rightCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.id}`}
                      className="text-gray-600 hover:text-purple-700 transition-colors duration-200 flex items-center group"
                    >
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      <span>{category.name}</span>
                    </Link>
                  </li>
                ))}
        
          
           
            </ul>
          </div>

          {/* Contact and Newsletter */}
         
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-purple-100 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة | تم التطوير بواسطة{" "}
            <a href="#" className="text-purple-600 hover:underline">
              OppoTrain
            </a>
          </p>
       
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all duration-300 z-50 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="العودة إلى الأعلى"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  )
}
