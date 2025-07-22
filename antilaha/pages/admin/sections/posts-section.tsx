"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Bold,
  Italic,
  Underline,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Save,
  Eye,
  X,
  Upload,
  Tag,
  Calendar,
  User,
  Link,
  Loader2,
  List,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ContentBlock {
  id: string
  type: "text" | "image"
  content: string
  styles?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    align?: "left" | "center" | "right"
  }
}

interface Category {
  id: string
  name: string
  description: string
  order: number
  image?: string
}

interface Post {
  title: string
  mainImage: string
  author: string
  categories: string[]
  tags: string[]
  content: ContentBlock[]
  createdAt: any
  status: "draft" | "published"
}

export function PostsSection() {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [mainImage, setMainImage] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: "1", type: "text", content: "", styles: {} },
  ])
  const [imageUrl, setImageUrl] = useState("")
  const [showImageModal, setShowImageModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const textAreaRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({})
  const { toast } = useToast()

  // Fetch categories from Firebase
  const fetchCategories = async () => {
    setIsCategoriesLoading(true)
    try {
      const categoriesRef = collection(db, "categories")
      const q = query(categoriesRef, orderBy("order", "asc"))
      const querySnapshot = await getDocs(q)

      const fetchedCategories: Category[] = []
      querySnapshot.forEach((doc) => {
        fetchedCategories.push({
          id: doc.id,
          ...doc.data(),
        } as Category)
      })

      setCategories(fetchedCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "خطأ في تحميل الفئات",
        description: "حدث خطأ أثناء تحميل الفئات من قاعدة البيانات",
        variant: "destructive",
      })
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const addTextBlock = () => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: "text",
      content: "",
      styles: {},
    }
    setContentBlocks((prev) => [...prev, newBlock])
  }

  const addImageBlock = () => {
    fileInputRef.current?.click()
  }

  const addImageByUrl = () => {
    if (imageUrl.trim()) {
      const newBlock: ContentBlock = {
        id: Date.now().toString(),
        type: "image",
        content: imageUrl.trim(),
      }
      setContentBlocks((prev) => [...prev, newBlock])
      setImageUrl("")
      setShowImageModal(false)
      toast({
        title: "تم إضافة الصورة",
        description: "تم إضافة الصورة بنجاح من الرابط",
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ في الصورة",
          description: "حجم الصورة كبير جداً. يجب أن يكون أقل من 5 ميجابايت",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newBlock: ContentBlock = {
          id: Date.now().toString(),
          type: "image",
          content: e.target?.result as string,
        }
        setContentBlocks((prev) => [...prev, newBlock])
        toast({
          title: "تم رفع الصورة",
          description: "تم رفع الصورة بنجاح",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "خطأ في الصورة",
          description: "حجم الصورة كبير جداً. يجب أن يكون أقل من 5 ميجابايت",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setMainImage(e.target?.result as string)
        toast({
          title: "تم رفع الصورة الرئيسية",
          description: "تم رفع الصورة الرئيسية بنجاح",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const updateBlockContent = (id: string, content: string) => {
    setContentBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const applyStyleToSelection = (blockId: string, styleKey: string) => {
    const textArea = textAreaRefs.current[blockId]
    if (!textArea) return

    const start = textArea.selectionStart
    const end = textArea.selectionEnd
    const selectedText = textArea.value.substring(start, end)

    if (selectedText.length === 0) {
      toast({
        title: "لم يتم تحديد نص",
        description: "يرجى تحديد النص الذي تريد تنسيقه",
        variant: "destructive",
      })
      return
    }

    const beforeText = textArea.value.substring(0, start)
    const afterText = textArea.value.substring(end)

    let styledText = selectedText

    // Apply markdown-style formatting
    switch (styleKey) {
      case "bold":
        styledText = `**${selectedText}**`
        break
      case "italic":
        styledText = `*${selectedText}*`
        break
      case "underline":
        styledText = `__${selectedText}__`
        break
    }

    const newContent = beforeText + styledText + afterText
    updateBlockContent(blockId, newContent)

    // Set cursor position after the styled text
    setTimeout(() => {
      const newCursorPos = start + styledText.length
      textArea.setSelectionRange(newCursorPos, newCursorPos)
      textArea.focus()
    }, 0)

    toast({
      title: "تم تطبيق التنسيق",
      description: `تم تطبيق ${styleKey === "bold" ? "الخط العريض" : styleKey === "italic" ? "المائل" : "التسطير"} على النص المحدد`,
    })
  }

  const addNumbering = (blockId: string) => {
    const textArea = textAreaRefs.current[blockId]
    if (!textArea) return

    const lines = textArea.value.split("\n")
    const numberedLines = lines.map((line, index) => {
      if (line.trim() === "") return line
      // Check if line already has numbering
      if (/^\d+[-.]/.test(line.trim())) return line
      return `${index + 1}- ${line}`
    })

    const newContent = numberedLines.join("\n")
    updateBlockContent(blockId, newContent)

    toast({
      title: "تم إضافة الترقيم",
      description: "تم إضافة نظام الترقيم للفقرات",
    })
  }

  const updateBlockStyle = (id: string, styleKey: string, value: any) => {
    setContentBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              styles: {
                ...block.styles,
                [styleKey]: value,
              },
            }
          : block,
      ),
    )
  }

  const deleteBlock = (id: string) => {
    if (contentBlocks.length > 1) {
      setContentBlocks((prev) => prev.filter((block) => block.id !== id))
      toast({
        title: "تم حذف البلوك",
        description: "تم حذف بلوك المحتوى بنجاح",
      })
    }
  }

  const getTextStyle = (styles: any) => {
    return {
      fontWeight: styles?.bold ? "bold" : "normal",
      fontStyle: styles?.italic ? "italic" : "normal",
      textDecoration: styles?.underline ? "underline" : "none",
      textAlign: styles?.align || "right",
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
      toast({
        title: "تم إضافة العلامة",
        description: `تم إضافة العلامة "${newTag.trim()}" بنجاح`,
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
    toast({
      title: "تم حذف العلامة",
      description: `تم حذف العلامة "${tagToRemove}" بنجاح`,
    })
  }

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال عنوان المقال",
        variant: "destructive",
      })
      return false
    }

    if (!author.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال اسم الكاتب",
        variant: "destructive",
      })
      return false
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى اختيار فئة واحدة على الأقل",
        variant: "destructive",
      })
      return false
    }

    if (contentBlocks.every((block) => !block.content.trim())) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إضافة محتوى للمقال",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSavePost = async (status: "draft" | "published" = "draft") => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const post: Post = {
        title: title.trim(),
        mainImage,
        author: author.trim(),
        categories: selectedCategories,
        tags,
        content: contentBlocks.filter((block) => block.content.trim()),
        createdAt: serverTimestamp(),
        status,
      }

      const docRef = await addDoc(collection(db, "posts"), post)

      toast({
        title: "تم حفظ المقال بنجاح!",
        description: `تم حفظ المقال "${title}" ${status === "published" ? "ونشره" : "كمسودة"}`,
      })

      // Reset form
      setTitle("")
      setAuthor("")
      setMainImage("")
      setSelectedCategories([])
      setTags([])
      setContentBlocks([{ id: "1", type: "text", content: "", styles: {} }])
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "خطأ في حفظ المقال",
        description: "حدث خطأ أثناء حفظ المقال. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-800">كتابة مقال جديد</h2>
        <div className="flex gap-3">
          <Button variant="outline" className="border-purple-200 text-purple-600 bg-transparent">
            <Eye className="w-4 h-4 ml-2" />
            معاينة
          </Button>
          <Button
            onClick={() => handleSavePost("draft")}
            disabled={isLoading}
            variant="outline"
            className="border-purple-200 text-purple-600 bg-transparent"
          >
            {isLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ كمسودة
          </Button>
          <Button
            onClick={() => handleSavePost("published")}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
            نشر المقال
          </Button>
        </div>
      </div>

      {/* Post Details */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800">تفاصيل المقال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title and Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                عنوان المقال *
              </Label>
              <Textarea
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المقال الرئيسي هنا..."
                className="border-purple-200 focus:border-purple-500 text-lg font-semibold resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="author" className="text-gray-700 font-medium flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                الكاتب *
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="اسم الكاتب"
                className="border-purple-200 focus:border-purple-500 text-base"
              />
            </div>
          </div>

          {/* Main Image */}
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4" />
              الصورة الرئيسية للمقال
            </Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mainImageInputRef.current?.click()}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Upload className="w-4 h-4 ml-2" />
                  رفع صورة
                </Button>
                <span className="text-gray-500">أو</span>
                <Input
                  placeholder="أدخل رابط الصورة"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>
              {mainImage && (
                <div className="relative inline-block">
                  <img
                    src={mainImage || "/placeholder.svg"}
                    alt="Main post image"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setMainImage("")}
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageUpload}
              className="hidden"
            />
          </div>

          {/* Categories */}
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4" />
              الفئات *
            </Label>
            {isCategoriesLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-purple-600">جارٍ تحميل الفئات...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category.id)}
                    className={`${
                      selectedCategories.includes(category.id)
                        ? "bg-purple-600 text-white"
                        : "border-purple-200 text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    {category.image && (
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-4 h-4 object-cover rounded mr-2"
                      />
                    )}
                    {category.name}
                  </Button>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-500 text-sm">لا توجد فئات متاحة. يرجى إضافة فئات أولاً.</p>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4" />
              العلامات (Tags)
            </Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 mr-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="أضف علامة جديدة"
                className="border-purple-200 focus:border-purple-500"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button type="button" onClick={addTag} className="bg-purple-600 hover:bg-purple-700 text-white">
                إضافة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Editor */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex justify-between items-center">
            محرر المحتوى
            <div className="flex gap-2">
              <Button size="sm" onClick={addTextBlock} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 ml-1" />
                نص
              </Button>
              <Button
                size="sm"
                onClick={() => setShowImageModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ImageIcon className="w-4 h-4 ml-1" />
                صورة
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentBlocks.map((block, index) => (
            <div
              key={block.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              {block.type === "text" && (
                <div className="space-y-3">
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={block.styles?.bold ? "default" : "outline"}
                        onClick={() => applyStyleToSelection(block.id, "bold")}
                        className="w-8 h-8 p-0"
                        title="حدد النص ثم اضغط للتطبيق"
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={block.styles?.italic ? "default" : "outline"}
                        onClick={() => applyStyleToSelection(block.id, "italic")}
                        className="w-8 h-8 p-0"
                        title="حدد النص ثم اضغط للتطبيق"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={block.styles?.underline ? "default" : "outline"}
                        onClick={() => applyStyleToSelection(block.id, "underline")}
                        className="w-8 h-8 p-0"
                        title="حدد النص ثم اضغط للتطبيق"
                      >
                        <Underline className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={block.styles?.align === "right" ? "default" : "outline"}
                        onClick={() => updateBlockStyle(block.id, "align", "right")}
                        className="w-8 h-8 p-0"
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={block.styles?.align === "center" ? "default" : "outline"}
                        onClick={() => updateBlockStyle(block.id, "align", "center")}
                        className="w-8 h-8 p-0"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={block.styles?.align === "left" ? "default" : "outline"}
                        onClick={() => updateBlockStyle(block.id, "align", "left")}
                        className="w-8 h-8 p-0"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNumbering(block.id)}
                      className="px-3 h-8"
                      title="إضافة ترقيم للفقرات"
                    >
                      <List className="w-4 h-4 ml-1" />
                      ترقيم
                    </Button>

                    <div className="flex-1"></div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBlock(block.id)}
                      className="w-8 h-8 p-0"
                      disabled={contentBlocks.length === 1}
                    >
                      ×
                    </Button>
                  </div>

                  {/* Text Area */}
                  <Textarea
                    ref={(el) => {
                      if (el) textAreaRefs.current[block.id] = el
                    }}
                    value={block.content}
                    onChange={(e) => updateBlockContent(block.id, e.target.value)}
                    placeholder="اكتب محتوى الفقرة هنا... 
• حدد النص واضغط على أزرار التنسيق
• استخدم زر الترقيم لإضافة أرقام للفقرات
• اكتب كل فقرة في سطر منفصل"
                    className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg resize-y focus:border-purple-500 focus:outline-none text-base leading-relaxed"
                    style={getTextStyle(block.styles)}
                  />
                </div>
              )}

              {block.type === "image" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">صورة</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBlock(block.id)}
                      className="w-8 h-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="relative">
                    <img
                      src={block.content || "/placeholder.svg"}
                      alt="Uploaded content"
                      className="max-w-full h-auto rounded-lg border max-h-96 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                        toast({
                          title: "خطأ في تحميل الصورة",
                          description: "لا يمكن تحميل الصورة من الرابط المحدد",
                          variant: "destructive",
                        })
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة صورة</DialogTitle>
            <DialogDescription>اختر طريقة إضافة الصورة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addImageBlock}
                className="flex-1 border-purple-200 text-purple-600 bg-transparent"
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع من الجهاز
              </Button>
              <Button variant="outline" className="flex-1 border-purple-200 text-purple-600 bg-transparent">
                <Link className="w-4 h-4 ml-2" />
                من رابط
              </Button>
            </div>
            <Input
              placeholder="أدخل رابط الصورة"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="border-purple-200 focus:border-purple-500"
            />
            <div className="flex gap-2">
              <Button
                onClick={addImageByUrl}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!imageUrl.trim()}
              >
                إضافة الصورة
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageModal(false)
                  setImageUrl("")
                }}
                className="border-purple-200 text-purple-600"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
