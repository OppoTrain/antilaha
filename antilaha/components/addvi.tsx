"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { collection, getDocs, query, orderBy, where, doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Megaphone, Plus, Eye, Calendar, ExternalLink, Loader2, Edit, Save, X, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Advertisement {
  id: string
  title: string
  image: string
  link: string
  description?: string
  isActive: boolean
  createdAt: Date | any
  position: number
}

interface DefaultMessage {
  title: string
  description: string
  buttonText: string
  isEnabled: boolean
}

export function Addvi() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [defaultMessage, setDefaultMessage] = useState<DefaultMessage>({
    title: "أعلن معنا هنا",
    description:
      "احجز مساحتك الإعلانية الآن ووصل إلى آلاف الزوار يومياً. نقدم حلول إعلانية مبتكرة ومخصصة لتحقيق أهدافك التسويقية بأفضل الأسعار.",
    buttonText: "ابدأ الإعلان الآن",
    isEnabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMessageOpen, setEditMessageOpen] = useState(false)
  const [tempMessage, setTempMessage] = useState<DefaultMessage>(defaultMessage)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData().catch((error) => {
      console.error("Initial fetch failed:", error)
      setError("حدث خطأ في تحميل البيانات عند البدء")
    })
  }, [])

  useEffect(() => {
    if (advertisements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => 
        prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [advertisements.length])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("Fetching advertisements from Firestore...")

      const adsRef = collection(db, "advertisements")
      const q = query(adsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const fetchedAds: Advertisement[] = []
      querySnapshot.forEach((doc) => {
        const adData = doc.data()
        console.log("Document data:", doc.id, adData)
        fetchedAds.push({
          id: doc.id,
          title: adData.title || "",
          image: adData.image || "",
          link: adData.link || "",
          description: adData.description || "",
          isActive: adData.isActive ?? true,
          createdAt: adData.createdAt instanceof Date ? adData.createdAt : adData.createdAt?.toDate() || new Date(),
          position: typeof adData.position === "number" ? adData.position : 1,
        })
      })

      console.log("All fetched ads:", fetchedAds)
      setAdvertisements([...fetchedAds])

      try {
        const messageDoc = await getDoc(doc(db, "settings", "defaultMessage"))
        if (messageDoc.exists()) {
          const messageData = messageDoc.data() as DefaultMessage
          setDefaultMessage(messageData)
          setTempMessage(messageData)
        } else {
          console.log("No default message found, using defaults")
        }
      } catch (messageError) {
        console.error("Error fetching default message:", messageError)
        console.log("Using default message settings")
      }
    } catch (err: any) {
      console.error("Error fetching data:", err.message, err.code, err.stack)
      setError(`حدث خطأ في تحميل البيانات: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdClick = async (ad: Advertisement) => {
    try {
      console.log("Ad clicked:", ad.id)
      if (ad.link) {
        window.open(ad.link, "_blank", "noopener,noreferrer")
      }
    } catch (error) {
      console.error("Error tracking ad click:", error)
    }
  }

  const saveDefaultMessage = async () => {
    try {
      setIsSaving(true)
      await setDoc(doc(db, "settings", "defaultMessage"), tempMessage)
      setDefaultMessage(tempMessage)
      setEditMessageOpen(false)
      toast({
        title: "تم حفظ الرسالة",
        description: "تم حفظ الرسالة الافتراضية بنجاح",
      })
    } catch (error) {
      console.error("Error saving default message:", error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الرسالة",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-8" dir="rtl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-purple-600">جارٍ تحميل الإعلانات...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-8" dir="rtl">
        <div className="text-center py-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} className="bg-red-600 hover:bg-red-700 text-white">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (advertisements.length === 0 && !defaultMessage.isEnabled) {
    return null
  }

  if (advertisements.length === 0) {
    return (
      <section className="mx-4 md:mx-8 lg:mx-16 xl:mx-24 py-8" dir="rtl">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "مساحة إعلانية متاحة",
                value: "أعلن هنا",
                icon: Megaphone,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                title: "وصول واسع",
                value: "50K+",
                icon: Eye,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "جمهور مستهدف",
                value: "متنوع",
                icon: Plus,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                title: "نتائج مضمونة",
                value: "فعال",
                icon: Calendar,
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="border-2 border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                onClick={() => {
                  const contactSection = document.querySelector('[data-section="contact-ad"]')
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-800 group-hover:text-purple-600 transition-colors">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 left-4 z-10 opacity-70 hover:opacity-100"
              onClick={() => setEditMessageOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>

            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">{defaultMessage.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 leading-relaxed text-lg">{defaultMessage.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  onClick={() => {
                    const contactSection = document.querySelector('[data-section="contact-ad"]')
                    if (contactSection) {
                      contactSection.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                >
                  <Megaphone className="w-5 h-5 ml-2" />
                  {defaultMessage.buttonText}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
                  asChild
                >
                  <Link href="/admin">
                    <Plus className="w-5 h-5 ml-2" />
                    إدارة الإعلانات
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-sm">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-800 mb-1">وصول واسع</div>
                  <div className="text-purple-600">أكثر من 50,000 زائر شهرياً</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-800 mb-1">جمهور مستهدف</div>
                  <div className="text-purple-600">محتوى عالي الجودة</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="font-semibold text-purple-800 mb-1">أسعار تنافسية</div>
                  <div className="text-purple-600">باقات مرنة ومناسبة</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={editMessageOpen} onOpenChange={setEditMessageOpen}>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>تعديل الرسالة الافتراضية</DialogTitle>
                <DialogDescription>قم بتعديل الرسالة التي تظهر عندما لا توجد إعلانات نشطة</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان الرئيسي</Label>
                  <Input
                    id="title"
                    value={tempMessage.title}
                    onChange={(e) => setTempMessage((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="أعلن معنا هنا"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={tempMessage.description}
                    onChange={(e) => setTempMessage((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف الخدمة الإعلانية"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonText">نص الزر</Label>
                  <Input
                    id="buttonText"
                    value={tempMessage.buttonText}
                    onChange={(e) => setTempMessage((prev) => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="ابدأ الإعلان الآن"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    checked={tempMessage.isEnabled}
                    onChange={(e) => setTempMessage((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                    className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="isEnabled">إظهار الرسالة عند عدم وجود إعلانات</Label>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempMessage(defaultMessage)
                    setEditMessageOpen(false)
                  }}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button onClick={saveDefaultMessage} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-4 md:mx-8 lg:mx-12 xl:mx-16 py-6" dir="rtl">
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">الإعلانات</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full mx-auto"></div>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}
          >
            {advertisements.map((ad) => (
              <div
                key={ad.id}
                className="w-full flex-shrink-0 relative h-[300px] md:h-[350px] lg:h-[400px]"
                onClick={() => handleAdClick(ad)}
              >
                <Image
                  src={ad.image || "/placeholder.svg"}
                  alt={ad.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 animate-slide-up">{ad.title}</h3>
                  {ad.description && (
                    <p className="text-sm md:text-base opacity-90 mb-3 animate-slide-up delay-100">
                      {ad.description}
                    </p>
                  )}
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-3 py-1 text-sm md:text-base"
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    زيارة الإعلان
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {advertisements.length > 1 && (
            <>
              <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-1.5 hover:bg-white/30 transition-all"
                onClick={() => setCurrentAdIndex((prev) => (prev === 0 ? advertisements.length - 1 : prev - 1))}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-1.5 hover:bg-white/30 transition-all"
                onClick={() => setCurrentAdIndex((prev) => (prev === advertisements.length - 1 ? 0 : prev + 1))}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                {advertisements.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentAdIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                    onClick={() => setCurrentAdIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}