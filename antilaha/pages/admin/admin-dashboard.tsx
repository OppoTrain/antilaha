"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderPlus, FileText, Settings, LogOut, Plus } from "lucide-react"

// Import sections
import { CategoriesSection } from "./sections/categories-section"
import { PostsSection } from "./sections/posts-section"
import { DashboardSection } from "./sections/dashboard-section"
import { SettingsSection } from "./sections/settings-section"
import { PostsManagementSection } from "./sections/posts-management-section"

const menuItems = [
  {
    id: "dashboard",
    title: "لوحة التحكم",
    icon: LayoutDashboard,
    component: DashboardSection,
  },
  {
    id: "posts-management",
    title: "إدارة المقالات",
    icon: FileText,
    component: PostsManagementSection,
  },
  {
    id: "categories",
    title: "إدارة الفئات",
    icon: FolderPlus,
    component: CategoriesSection,
  },
  {
    id: "posts",
    title: "كتابة مقال جديد",
    icon: Plus,
    component: PostsSection,
  },
  {
    id: "settings",
    title: "الإعدادات",
    icon: Settings,
    component: SettingsSection,
  },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")

  const ActiveComponent = menuItems.find((item) => item.id === activeSection)?.component || DashboardSection

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <SidebarProvider>
        <Sidebar side="right" collapsible="icon" className="border-l border-purple-200">
          <SidebarHeader className="border-b border-purple-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <h2 className="text-lg font-bold text-purple-800">لوحة الإدارة</h2>
                <p className="text-sm text-gray-600">إدارة المحتوى</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-purple-700 font-semibold mb-4 group-data-[collapsible=icon]:hidden">
                القوائم الرئيسية
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        tooltip={item.title}
                        className={`w-full justify-start gap-3 p-3 rounded-xl transition-all duration-200 ${
                          activeSection === item.id
                            ? "bg-purple-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-200 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span className="group-data-[collapsible=icon]:hidden">تسجيل الخروج</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-purple-200 px-6 bg-white">
            <SidebarTrigger className="text-purple-600 hover:bg-purple-50" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-purple-800">
                {menuItems.find((item) => item.id === activeSection)?.title}
              </h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <ActiveComponent />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
