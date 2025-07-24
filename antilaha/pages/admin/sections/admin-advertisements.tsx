"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, Save, Loader2, ImageIcon, BarChart3, RefreshCw } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Advertisement {
  id: string;
  title: string;
  image: string;
  link: string;
  description?: string;
  isActive: boolean;
  createdAt: Date | string;
  clickCount: number;
  position: number;
}

interface AdFormData {
  title: string;
  image: string;
  link: string;
  description: string;
  isActive: boolean;
  position: number;
}

export function AdminAdvertisements() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<Advertisement | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AdFormData>({
    title: "",
    image: "",
    link: "",
    description: "",
    isActive: true,
    position: 1,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchAdvertisements().catch((error) => {
      console.error("Initial fetch failed:", error);
      toast({
        title: "خطأ في التحميل",
        description: "فشل تحميل الإعلانات عند البدء",
        variant: "destructive",
      });
    });
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching advertisements from Firestore...");
      const adsRef = collection(db, "advertisements");
      const q = query(adsRef, orderBy("createdAt", "desc")); // Simplified to single orderBy
      const querySnapshot = await getDocs(q);

      const fetchedAds: Advertisement[] = [];
      querySnapshot.forEach((doc) => {
        const adData = doc.data();
        console.log("Document data:", doc.id, adData); // Debug each document
        fetchedAds.push({
          id: doc.id,
          title: adData.title || "",
          image: adData.image || "",
          link: adData.link || "",
          description: adData.description || "",
          isActive: adData.isActive ?? true,
          createdAt: adData.createdAt
            ? adData.createdAt instanceof Timestamp
              ? adData.createdAt.toDate()
              : new Date(adData.createdAt)
            : new Date(),
          clickCount: typeof adData.clickCount === "number" ? adData.clickCount : 0,
          position: typeof adData.position === "number" ? adData.position : 1,
        });
      });

      console.log("All fetched ads:", fetchedAds); // Debug all ads
      setAdvertisements([...fetchedAds]); // Ensure new array reference
    } catch (error: any) {
      console.error("Error fetching advertisements:", error.message, error.code, error.stack);
      toast({
        title: "خطأ في تحميل الإعلانات",
        description: `حدث خطأ أثناء تحميل الإعلانات: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال عنوان الإعلان",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.image.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال رابط الصورة",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.link.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال رابط الإعلان",
        variant: "destructive",
      });
      return false;
    }

    if (!/^\d+$/.test(formData.position.toString()) || formData.position < 1) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى إدخال ترتيب إعلان صالح (رقم أكبر من 0)",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const adData = {
        title: formData.title.trim(),
        image: formData.image.trim(),
        link: formData.link.trim(),
        description: formData.description.trim() || "",
        isActive: formData.isActive,
        position: Number(formData.position),
        createdAt: serverTimestamp(),
        clickCount: editingAd?.clickCount || 0,
      };

      if (editingAd) {
        await updateDoc(doc(db, "advertisements", editingAd.id), adData);
        toast({
          title: "تم تحديث الإعلان بنجاح!",
          description: `تم تحديث الإعلان "${formData.title}"`,
        });
      } else {
        const docRef = await addDoc(collection(db, "advertisements"), adData);
        console.log("Added advertisement with ID:", docRef.id);
        toast({
          title: "تم إضافة الإعلان بنجاح!",
          description: `تم إضافة الإعلان "${formData.title}"`,
        });
      }

      setFormDialogOpen(false);
      setEditingAd(null);
      resetForm();
      await fetchAdvertisements();
    } catch (error: any) {
      console.error("Error saving advertisement:", error.message, error.code, error.stack);
      toast({
        title: "خطأ في حفظ الإعلان",
        description: `حدث خطأ أثناء حفظ الإعلان: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!adToDelete) return;

    try {
      await deleteDoc(doc(db, "advertisements", adToDelete.id));
      toast({
        title: "تم حذف الإعلان بنجاح!",
        description: `تم حذف الإعلان "${adToDelete.title}"`,
      });
      setDeleteDialogOpen(false);
      setAdToDelete(null);
      await fetchAdvertisements();
    } catch (error: any) {
      console.error("Error deleting advertisement:", error.message, error.code, error.stack);
      toast({
        title: "خطأ في حذف الإعلان",
        description: `حدث خطأ أثناء حذف الإعلان: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleAdStatus = async (ad: Advertisement) => {
    try {
      await updateDoc(doc(db, "advertisements", ad.id), {
        isActive: !ad.isActive,
      });
      toast({
        title: "تم تحديث حالة الإعلان بنجاح!",
        description: `تم ${!ad.isActive ? "تفعيل" : "إلغاء تفعيل"} الإعلان "${ad.title}"`,
      });
      await fetchAdvertisements();
    } catch (error: any) {
      console.error("Error updating ad status:", error.message, error.code, error.stack);
      toast({
        title: "خطأ في تحديث الإعلان",
        description: `حدث خطأ أثناء تحديث حالة الإعلان: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      link: "",
      description: "",
      isActive: true,
      position: advertisements.length + 1,
    });
  };

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image: ad.image,
      link: ad.link,
      description: ad.description || "",
      isActive: ad.isActive,
      position: ad.position,
    });
    setFormDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingAd(null);
    resetForm();
    setFormDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-purple-600">جارٍ تحميل الإعلانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-800">إدارة الإعلانات</h2>
          <p className="text-gray-600">
            إجمالي الإعلانات: {advertisements.length} • نشط: {advertisements.filter((ad) => ad.isActive).length} • غير
            نشط: {advertisements.filter((ad) => !ad.isActive).length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAdvertisements} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
            <RefreshCw className="w-5 h-5 ml-2" />
            إعادة تحميل
          </Button>
          <Button onClick={openAddDialog} className="bg-purple-600 hover:bg-purple-700 text-white" size="lg">
            <Plus className="w-5 h-5 ml-2" />
            إضافة إعلان جديد
          </Button>
        </div>
      </div>

      {/* Advertisements Grid */}
      {advertisements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((ad) => (
            <Card
              key={ad.id}
              className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:shadow-lg overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={ad.image || "/placeholder.svg"}
                  alt={ad.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                    toast({
                      title: "خطأ في تحميل الصورة",
                      description: `لا يمكن تحميل صورة الإعلان "${ad.title}"`,
                      variant: "destructive",
                    });
                  }}
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge className={ad.isActive ? "bg-green-600 text-white" : "bg-gray-600 text-white"}>
                    {ad.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80">
                    #{ad.position}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-purple-800 line-clamp-2">{ad.title}</h3>
                {ad.description && <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {ad.clickCount || 0} نقرة
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline truncate max-w-20"
                    >
                      رابط
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAdStatus(ad)}
                      className="text-gray-600 hover:text-purple-600"
                    >
                      {ad.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(ad)}
                      className="text-gray-600 hover:text-purple-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAdToDelete(ad);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-purple-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-purple-300 mb-4" />
            <p className="text-gray-500 text-center mb-4">لا توجد إعلانات حتى الآن</p>
            <Button onClick={openAddDialog} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول إعلان
            </Button>
          </CardContent>
        </Card>
      )}

    

      {/* Add/Edit Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingAd ? "تعديل الإعلان" : "إضافة إعلان جديد"}</DialogTitle>
            <DialogDescription>
              {editingAd ? "قم بتعديل تفاصيل الإعلان أدناه" : "أدخل تفاصيل الإعلان الجديد"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الإعلان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل عنوان الإعلان"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">ترتيب الإعلان *</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position: Number.parseInt(e.target.value) || 1 }))}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">رابط الصورة *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                required
              />
              {formData.image && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={formData.image || "/placeholder.svg"}
                    alt="معاينة"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                      toast({
                        title: "خطأ في تحميل الصورة",
                        description: "لا يمكن تحميل الصورة من الرابط المحدد",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">رابط الإعلان *</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف الإعلان</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="وصف مختصر للإعلان (اختياري)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">تفعيل الإعلان</Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="border-purple-200 text-purple-600"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جارٍ الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    {editingAd ? "تحديث الإعلان" : "إضافة الإعلان"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد حذف الإعلان</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الإعلان "{adToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-purple-200 text-purple-600"
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 ml-2" />
              حذف الإعلان
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}