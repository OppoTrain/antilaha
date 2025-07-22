"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-800">إعدادات الموقع</h2>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Save className="w-4 h-4 ml-2" />
          حفظ الإعدادات
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">إعدادات عامة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName" className="text-gray-700 font-medium">
                اسم الموقع
              </Label>
              <Input id="siteName" placeholder="اسم موقعك" className="mt-1 border-purple-200 focus:border-purple-500" />
            </div>
            <div>
              <Label htmlFor="siteDescription" className="text-gray-700 font-medium">
                وصف الموقع
              </Label>
              <Textarea
                id="siteDescription"
                placeholder="وصف موقعك"
                className="mt-1 border-purple-200 focus:border-purple-500"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">إعدادات Firebase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-gray-700 font-medium">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Firebase API Key"
                className="mt-1 border-purple-200 focus:border-purple-500"
              />
            </div>
            <div>
              <Label htmlFor="projectId" className="text-gray-700 font-medium">
                Project ID
              </Label>
              <Input
                id="projectId"
                placeholder="Firebase Project ID"
                className="mt-1 border-purple-200 focus:border-purple-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
