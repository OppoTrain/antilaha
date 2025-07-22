"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ChevronDown, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useCategories } from "@/hooks/use-categories"

// Arabic translations
const translations = {
  ar: {
    search: "بحث",
    searchPlaceholder: "ابحث هنا...",
    close: "إغلاق",
    toggleMenu: "تبديل قائمة التنقل",
    noCategories: "لا توجد فئات",
    loading: "جارٍ التحميل...",
    getStarted: "ابدأ الآن",
  },
}

export default function Navbar() {
  const { categories, loading, error } = useCategories()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = translations.ar

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = e.currentTarget.search.value
    console.log("Search query:", query)
    setIsSearchOpen(false)
  }

  const logoUrl =
    "https://firebasestorage.googleapis.com/v0/b/curlmaker-ae151.firebasestorage.app/o/1%20(1).png?alt=media&token=521a8455-2ed3-4a73-b0a6-1b735a1886da"

  // Split categories into left and right wings
  const midPoint = Math.ceil(categories.length / 2)
  const leftWingCategories = categories.slice(0, midPoint)
  const rightWingCategories = categories.slice(midPoint)

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-2" : "py-6"}`}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Left Wing */}
            <div
              className={`flex items-center space-x-6 transition-all duration-300 ${
                isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <NavigationMenu>
                <NavigationMenuList className="flex space-x-2">
                  {loading && (
                    <NavigationMenuItem className="text-sm text-foreground animate-pulse">
                      {t.loading}
                    </NavigationMenuItem>
                  )}
                  {error && <NavigationMenuItem className="text-sm text-red-500">{error}</NavigationMenuItem>}
                  {!loading && !error && categories.length === 0 && (
                    <NavigationMenuItem className="text-sm text-muted-foreground">{t.noCategories}</NavigationMenuItem>
                  )}
                  {!loading &&
                    !error &&
                    leftWingCategories.map((category) => (
                      <NavigationMenuItem key={category.id}>
                        {category.posts && category.posts.length > 0 ? (
                          <>
                            <NavigationMenuTrigger className="text-foreground hover:text-primary transition-all duration-200 font-medium px-4 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20">
                              {category.name}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                {category.posts.map((post) => (
                                  <ListItem key={post.id} title={post.title} href={post.url}>
                                    {post.title}
                                  </ListItem>
                                ))}
                              </ul>
                            </NavigationMenuContent>
                          </>
                        ) : (
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/category/${category.id}`}
                              className="text-foreground hover:text-primary transition-all duration-200 font-medium px-4 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20 inline-block"
                            >
                              {category.name}
                            </Link>
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Center Logo - Made Much Bigger */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt="Your Company Logo"
                width={isScrolled ? 200 : 300}
                height={isScrolled ? 80 : 120}
                className={cn(
                  "w-auto drop-shadow-lg hover:scale-105 transition-all duration-500 ease-in-out",
                  isScrolled ? "h-16" : "h-24",
                )}
              />
            </Link>

            {/* Right Wing */}
            <div
              className={`flex items-center space-x-6 transition-all duration-300 ${
                isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <NavigationMenu>
                <NavigationMenuList className="flex space-x-2">
                  {!loading &&
                    !error &&
                    rightWingCategories.map((category) => (
                      <NavigationMenuItem key={category.id}>
                        {category.posts && category.posts.length > 0 ? (
                          <>
                            <NavigationMenuTrigger className="text-foreground hover:text-primary transition-all duration-200 font-medium px-4 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20">
                              {category.name}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                {category.posts.map((post) => (
                                  <ListItem key={post.id} title={post.title} href={post.url}>
                                    {post.title}
                                  </ListItem>
                                ))}
                              </ul>
                            </NavigationMenuContent>
                          </>
                        ) : (
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/category/${category.id}`}
                              className="text-foreground hover:text-primary transition-all duration-200 font-medium px-4 py-2 rounded-lg hover:bg-accent/50 hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20 inline-block"
                            >
                              {category.name}
                            </Link>
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
              </NavigationMenu>

           

              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-accent/50 hover:scale-110 transition-all duration-200 border border-transparent hover:border-primary/20"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">{t.search}</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-all duration-300 hover:bg-accent/50 hover:scale-110 border border-transparent hover:border-primary/20 ${
                    isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t.toggleMenu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80" dir="rtl">
                <div className="mt-8 space-y-4">
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-3 text-xl font-bold mb-6 p-4 bg-muted rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Image
                      src={logoUrl || "/placeholder.svg"}
                      alt="Your Logo"
                      width={200}
                      height={60}
                      className="h-14 w-auto"
                    />
                  </Link>

                  {/* Get Started Button - Mobile */}
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary hover:border-primary/70 transition-all duration-200 hover:scale-105 py-3 font-semibold"
                  >
                    <Link
                      href="/get-started"
                      className="flex items-center justify-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.getStarted}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  {loading && <div className="text-sm text-muted-foreground text-center p-4">{t.loading}</div>}
                  {error && <div className="text-sm text-red-500 text-center p-4">{error}</div>}
                  {!loading && !error && categories.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center p-4">{t.noCategories}</div>
                  )}

                  {categories.map((category) => (
                    <div key={category.id} className="border-b border-border pb-4">
                      <Link
                        href={`/category/${category.id}`}
                        className="flex items-center justify-between py-3 px-4 text-lg font-semibold transition-all duration-200 hover:text-primary hover:bg-muted rounded-lg group hover:scale-105 border border-transparent hover:border-primary/20"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{category.name}</span>
                        {category.posts && category.posts.length > 0 && (
                          <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
                        )}
                      </Link>
                      {category.posts && category.posts.length > 0 && (
                        <div className="mt-2 space-y-1 pr-6">
                          {category.posts.map((post) => (
                            <Link
                              key={post.id}
                              href={post.url}
                              className="block py-2 px-4 text-sm text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-muted rounded text-right hover:scale-105 border border-transparent hover:border-primary/10"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {post.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Mobile Search */}
                  <button
                    className="flex items-center space-x-3 text-lg font-medium hover:text-primary transition-all duration-200 w-full text-left py-3 px-4 hover:bg-muted rounded-lg hover:scale-105 border border-transparent hover:border-primary/20"
                    onClick={() => {
                      setIsSearchOpen(true)
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Search className="h-5 w-5" />
                    <span>{t.search}</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Center Logo - Mobile - More Responsive */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt="Your Company Logo"
                width={isScrolled ? 100 : 160}
                height={isScrolled ? 40 : 64}
                className={cn(
                  "w-auto drop-shadow-lg hover:scale-105 transition-all duration-500 ease-in-out",
                  // More responsive sizing for mobile
                  isScrolled
                    ? "h-8 sm:h-10" // Smaller on mobile when scrolled
                    : "h-12 sm:h-16", // Bigger on mobile when not scrolled
                )}
              />
            </Link>

            {/* Placeholder for balance */}
            <div className="w-10"></div>
          </div>
        </div>

        {/* Search Modal */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{t.search}</DialogTitle>
              <DialogDescription>{t.searchPlaceholder}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 mt-4">
              <Input
                name="search"
                placeholder={t.searchPlaceholder}
                className="h-12 w-full text-right text-lg border-2 focus:border-primary transition-colors"
                autoFocus
              />
              <Button
                type="submit"
                className="px-6 py-3 text-base bg-primary hover:bg-primary/90 border-2 border-primary hover:border-primary/70 transition-all duration-200"
              >
                {t.search}
              </Button>
            </form>
            <Button
              variant="outline"
              className="w-full mt-6 py-3 text-base bg-transparent border-2 hover:bg-accent transition-all duration-200"
              onClick={() => setIsSearchOpen(false)}
            >
              {t.close}
            </Button>
          </DialogContent>
        </Dialog>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={`transition-all duration-300 ${isScrolled ? "h-20" : "h-32"}`}></div>
    </>
  )
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:scale-105 hover:shadow-md border border-transparent hover:border-primary/20",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"
