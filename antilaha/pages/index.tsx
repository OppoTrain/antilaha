"use client"

import { CategoriesShowcase } from "@/components/categories-showcase"
import { HeroSection } from "@/components/hero-section"
import Navbar from "@/components/Navigations/main-nav"

import {Addvi} from "@/components/addvi"
import { Footer } from "@/components/Navigations/footer"
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
          <Navbar />
  
    
    <HeroSection/>
    <Addvi/>
    <CategoriesShowcase/>
    <Footer/>
    </div>
  )
}
