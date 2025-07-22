"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, FolderPlus, Users } from 'lucide-react'

export function DashboardSection() {
  const stats = [
    {
      title: "إجمالي المقالات",
      value: "0",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "إجمالي الفئات",
      value: "0",
      icon: FolderPlus,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "الزوار",
      value: "0",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "المشاهدات",
      value: "0",
      icon: BarChart3,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-purple-800">مرحباً بك في لوحة الإدارة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed">
            يمكنك من هنا إدارة جميع محتويات موقعك، إضافة فئات جديدة، كتابة مقالات، وإدارة الإعدادات.
            ابدأ بإضافة فئة جديدة ثم قم بكتابة أول مقال لك.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
