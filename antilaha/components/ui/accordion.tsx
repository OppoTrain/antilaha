"use client"

import React, { forwardRef } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive: boolean
}

const AccordionTrigger = forwardRef<HTMLDivElement, AccordionTriggerProps>(
  ({ className, children, isActive, ...props }, ref) => (
    <div className="flex p-4 cursor-pointer" {...props} ref={ref}>
      <div
        className={cn("flex-1 items-center justify-between py-4 font-medium transition-all hover:underline", className)}
      >
        {children}
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{ transform: isActive ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
    </div>
  ),
)

AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive: boolean
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, isActive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isActive ? "max-h-[1000px]" : "max-h-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

AccordionContent.displayName = "AccordionContent"

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Accordion = ({ children, ...props }: AccordionProps) => {
  const [isActive, setIsActive] = React.useState(false)

  return (
    <div {...props}>
      <AccordionTrigger isActive={isActive} onClick={() => setIsActive(!isActive)}>
        {children}
      </AccordionTrigger>
      <AccordionContent isActive={isActive}>{children}</AccordionContent>
    </div>
  )
}

export default Accordion

