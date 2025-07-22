"use client"

import * as React from "react"
import {
  NavigationMenu as NavMenuPrimitive,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu"
import { cn } from "@/lib/utils"

export {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
}

export const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavMenuPrimitive>,
  React.ComponentPropsWithoutRef<typeof NavMenuPrimitive>
>(({ className, ...props }, ref) => (
  <NavMenuPrimitive
    ref={ref}
    className={cn("relative z-50 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  />
))

NavigationMenu.displayName = "NavigationMenu"
