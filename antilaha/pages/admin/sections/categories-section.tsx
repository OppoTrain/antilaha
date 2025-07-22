"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Plus, Edit, Trash2, FolderPlus, Upload, X, Loader2, ImageIcon } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  order: number
  image?: string
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    image: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch categories from Firebase
  const fetchCategories = async () => {
    setIsLoading(true)
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
      toast({
        title: "تم تحميل الفئات",
        description: `تم تحميل ${fetchedCategories.length} فئة بنجاح`,
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "خطأ في تحميل الفئات",
        description: "حدث خطأ أثناء تحميل الفئات من قاعدة البيانات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

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
        setFormData((prev) => ({ ...prev, image: e.target?.result as string }))
        toast({
          title: "تم رفع الصورة",
          description: "تم رفع صورة الفئة بنجاح",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)

    try {
      if (editingId) {
        // Update existing category
        const categoryRef = doc(db, "categories", editingId)
        await updateDoc(categoryRef, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          order: formData.order,
          image: formData.image,
        })

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId
              ? { ...cat, ...formData, name: formData.name.trim(), description: formData.description.trim() }
              : cat,
          ),
        )

        toast({
          title: "تم تحديث الفئة",
          description: `تم تحديث الفئة "${formData.name}" بنجاح`,
        })
        setEditingId(null)
      } else {
        // Add new category
        const docRef = await addDoc(collection(db, "categories"), {
          name: formData.name.trim(),
          description: formData.description.trim(),
          order: formData.order,
          image: formData.image,
        })

        const newCategory: Category = {
          id: docRef.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          order: formData.order,
          image: formData.image,
        }

        setCategories((prev) => [...prev, newCategory].sort((a, b) => a.order - b.order))

        toast({
          title: "تم إضافة الفئة",
          description: `تم إضافة الفئة "${formData.name}" بنجاح`,
        })
      }

      setFormData({ name: "", description: "", order: 0, image: "" })
      setIsAdding(false)
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "خطأ في حفظ الفئة",
        description: "حدث خطأ أثناء حفظ الفئة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      order: category.order,
      image: category.image || "",
    })
    setEditingId(category.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الفئة "${name}"؟`)) return

    try {
      await deleteDoc(doc(db, "categories", id))
      setCategories((prev) => prev.filter((cat) => cat.id !== id))

      toast({
        title: "تم حذف الفئة",
        description: `تم حذف الفئة "${name}" بنجاح`,
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "خطأ في حذف الفئة",
        description: "حدث خطأ أثناء حذف الفئة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: "", description: "", order: 0, image: "" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="mr-2 text-purple-600">جارٍ تحميل الفئات...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-800">إدارة الفئات</h2>
        <Button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 ml-2" />
          إضافة فئة جديدة
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">{editingId ? "تعديل الفئة" : "إضافة فئة جديدة"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">
                    اسم الفئة *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسم الفئة"
                    className="mt-1 border-purple-200 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="order" className="text-gray-700 font-medium">
                    ترتيب الفئة
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number.parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="mt-1 border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  وصف الفئة
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="أدخل وصف الفئة"
                  className="mt-1 border-purple-200 focus:border-purple-500"
                  rows={3}
                />
              </div>

              {/* Category Image */}
              <div>
                <Label className="text-gray-700 font-medium flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4" />
                  صورة الفئة
                </Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Upload className="w-4 h-4 ml-2" />
                      رفع صورة
                    </Button>
                    <span className="text-gray-500">أو</span>
                    <Input
                      placeholder="أدخل رابط الصورة"
                      value={formData.image}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  {formData.image && (
                    <div className="relative inline-block">
                      <img
                        src={formData.image || "/placeholder.svg"}
                        alt="Category image"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-purple-200"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      {editingId ? "جارٍ التحديث..." : "جارٍ الإضافة..."}
                    </>
                  ) : (
                    <>{editingId ? "تحديث" : "إضافة"}</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                  disabled={isSaving}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader>
              <CardTitle className="text-purple-800 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {category.image && (
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-12 h-12 object-cover rounded-lg border border-purple-200"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  )}
                  <span>{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id, category.name)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              <p className="text-xs text-purple-600">ترتيب: {category.order}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && !isAdding && (
        <Card className="border-2 border-dashed border-purple-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderPlus className="w-12 h-12 text-purple-300 mb-4" />
            <p className="text-gray-500 text-center">لا توجد فئات حتى الآن. ابدأ بإضافة فئة جديدة.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
