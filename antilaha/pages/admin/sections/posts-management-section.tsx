"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Edit,
  Trash2,
  Search,
  Calendar,
  User,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Clock,
  Save,
  X,
  Plus,
} from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
}

interface EditFormData {
  title: string
  author: string
  mainImage: string
  categories: string[]
  tags: string[]
  status: "draft" | "published"
  content: string
}

export function PostsManagementSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all")

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [postToEdit, setPostToEdit] = useState<Post | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    author: "",
    mainImage: "",
    categories: [],
    tags: [],
    status: "draft",
    content: "",
  })
  const [newTag, setNewTag] = useState("")

  const { toast } = useToast()

  // Fetch posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch posts
        const postsRef = collection(db, "posts")
        const postsQuery = query(postsRef, orderBy("createdAt", "desc"))
        const postsSnapshot = await getDocs(postsQuery)
        const fetchedPosts: Post[] = []
        postsSnapshot.forEach((doc) => {
          const postData = doc.data() as Omit<Post, "id">
          fetchedPosts.push({
            id: doc.id,
            ...postData,
          })
        })

        // Fetch categories
        const categoriesRef = collection(db, "categories")
        const categoriesSnapshot = await getDocs(categoriesRef)
        const fetchedCategories: Category[] = []
        categoriesSnapshot.forEach((doc) => {
          fetchedCategories.push({
            id: doc.id,
            name: doc.data().name,
          })
        })

        setPosts(fetchedPosts)
        setCategories(fetchedCategories)
        setFilteredPosts(fetchedPosts)
        toast({
          title: "تم تحميل المقالات",
          description: `تم تحميل ${fetchedPosts.length} مقال بنجاح`,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل المقالات",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // Filter posts based on search and status
  useEffect(() => {
    let filtered = posts
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter)
    }
    setFilteredPosts(filtered)
  }, [posts, searchTerm, statusFilter])

  const formatDate = (createdAt: any) => {
    if (!createdAt || !createdAt.toDate) return "غير محدد"
    try {
      const date = createdAt.toDate()
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (err) {
      return "غير محدد"
    }
  }

  const calculateReadTime = (content: any[]) => {
    const totalWords = content
      .filter((block) => block.type === "text")
      .reduce((acc, block) => acc + block.content.split(" ").length, 0)
    return Math.max(1, Math.ceil(totalWords / 200))
  }

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map((id) => categories.find((cat) => cat.id === id)?.name)
      .filter(Boolean)
      .join("، ")
  }

  const extractContentText = (content: any[]) => {
    return content
      .filter((block) => block.type === "text")
      .map((block) => block.content)
      .join("\n\n")
  }

  const convertTextToContent = (text: string) => {
    return text
      .split("\n\n")
      .map((paragraph) => ({
        type: "text",
        content: paragraph.trim(),
      }))
      .filter((block) => block.content.length > 0)
  }

  // Handle edit post
  const handleEditPost = (post: Post) => {
    setPostToEdit(post)
    setEditFormData({
      title: post.title,
      author: post.author,
      mainImage: post.mainImage,
      categories: post.categories,
      tags: post.tags,
      status: post.status,
      content: extractContentText(post.content),
    })
    setEditDialogOpen(true)
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!postToEdit) return

    setIsEditing(true)
    try {
      const updatedData = {
        title: editFormData.title,
        author: editFormData.author,
        mainImage: editFormData.mainImage,
        categories: editFormData.categories,
        tags: editFormData.tags,
        status: editFormData.status,
        content: convertTextToContent(editFormData.content),
      }

      await updateDoc(doc(db, "posts", postToEdit.id), updatedData)

      // Update local state
      setPosts((prev) => prev.map((post) => (post.id === postToEdit.id ? { ...post, ...updatedData } : post)))

      toast({
        title: "تم تحديث المقال",
        description: `تم تحديث المقال "${editFormData.title}" بنجاح`,
      })

      setEditDialogOpen(false)
      setPostToEdit(null)
    } catch (error) {
      console.error("Error updating post:", error)
      toast({
        title: "خطأ في تحديث المقال",
        description: "حدث خطأ أثناء تحديث المقال",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  // Handle add tag
  const handleAddTag = () => {
    if (newTag.trim() && !editFormData.tags.includes(newTag.trim())) {
      setEditFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  // Handle remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setEditFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    setEditFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "posts", postToDelete.id))
      setPosts((prev) => prev.filter((post) => post.id !== postToDelete.id))
      toast({
        title: "تم حذف المقال",
        description: `تم حذف المقال "${postToDelete.title}" بنجاح`,
      })
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "خطأ في حذف المقال",
        description: "حدث خطأ أثناء حذف المقال",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (postId: string, newStatus: "draft" | "published") => {
    try {
      await updateDoc(doc(db, "posts", postId), { status: newStatus })
      setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, status: newStatus } : post)))
      toast({
        title: "تم تحديث حالة المقال",
        description: `تم ${newStatus === "published" ? "نشر" : "حفظ كمسودة"} المقال بنجاح`,
      })
    } catch (error) {
      console.error("Error updating post status:", error)
      toast({
        title: "خطأ في تحديث المقال",
        description: "حدث خطأ أثناء تحديث حالة المقال",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-purple-600">جارٍ تحميل المقالات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-800">إدارة المقالات</h2>
          <p className="text-gray-600">
            إجمالي المقالات: {posts.length} • منشور: {posts.filter((p) => p.status === "published").length} • مسودة:{" "}
            {posts.filter((p) => p.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في المقالات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-purple-200 focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-purple-600" : "border-purple-200 text-purple-600"}
              >
                الكل ({posts.length})
              </Button>
              <Button
                variant={statusFilter === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("published")}
                className={statusFilter === "published" ? "bg-green-600" : "border-green-200 text-green-600"}
              >
                منشور ({posts.filter((p) => p.status === "published").length})
              </Button>
              <Button
                variant={statusFilter === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("draft")}
                className={statusFilter === "draft" ? "bg-orange-600" : "border-orange-200 text-orange-600"}
              >
                مسودة ({posts.filter((p) => p.status === "draft").length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="group border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:shadow-lg overflow-hidden"
            >
              {/* Post Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.mainImage || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge
                    className={`${
                      post.status === "published" ? "bg-green-600 text-white" : "bg-orange-600 text-white"
                    }`}
                  >
                    {post.status === "published" ? "منشور" : "مسودة"}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/80 hover:bg-white text-gray-700"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditPost(post)}>
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل المقال
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log("View post:", post.id)}>
                        <Eye className="w-4 h-4 ml-2" />
                        معاينة المقال
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {post.status === "draft" ? (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(post.id, "published")}
                          className="text-green-600"
                        >
                          <FileText className="w-4 h-4 ml-2" />
                          نشر المقال
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(post.id, "draft")}
                          className="text-orange-600"
                        >
                          <FileText className="w-4 h-4 ml-2" />
                          تحويل لمسودة
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setPostToDelete(post)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف المقال
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Post Content */}
              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-purple-800 line-clamp-2 text-lg group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>
                {/* Meta Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(post.content)} دقائق قراءة</span>
                  </div>
                </div>
                {/* Categories */}
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500">الفئات:</span>
                    <span className="text-xs text-purple-600 font-medium">
                      {getCategoryNames(post.categories) || "غير محدد"}
                    </span>
                  </div>
                )}
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-purple-200 text-purple-600">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-purple-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-purple-300 mb-4" />
            <p className="text-gray-500 text-center">
              {searchTerm || statusFilter !== "all" ? "لا توجد مقالات تطابق معايير البحث" : "لا توجد مقالات حتى الآن"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-purple-800">تعديل المقال</DialogTitle>
            <DialogDescription>قم بتعديل تفاصيل المقال أدناه</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                عنوان المقال
              </Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="أدخل عنوان المقال"
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-medium">
                الكاتب
              </Label>
              <Input
                id="author"
                value={editFormData.author}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="اسم الكاتب"
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label htmlFor="mainImage" className="text-sm font-medium">
                رابط الصورة الرئيسية
              </Label>
              <Input
                id="mainImage"
                value={editFormData.mainImage}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, mainImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="border-purple-200 focus:border-purple-500"
              />
              {editFormData.mainImage && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-purple-200">
                  <Image
                    src={editFormData.mainImage || "/placeholder.svg"}
                    alt="معاينة الصورة"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">حالة المقال</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: "draft" | "published") =>
                  setEditFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-purple-200 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">الفئات</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={editFormData.categories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">العلامات</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="أضف علامة جديدة"
                  className="border-purple-200 focus:border-purple-500"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editFormData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                محتوى المقال
              </Label>
              <Textarea
                id="content"
                value={editFormData.content}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="اكتب محتوى المقال هنا..."
                className="min-h-[200px] border-purple-200 focus:border-purple-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isEditing}
              className="border-purple-200 text-purple-600"
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditing} className="bg-purple-600 hover:bg-purple-700">
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المقال</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف المقال "{postToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="border-purple-200 text-purple-600"
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeletePost} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جارٍ الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف المقال
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
