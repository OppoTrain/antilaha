"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value: number[]
  defaultValue?: number[]
  max?: number
  min?: number
  step?: number
  onValueChange?: (value: number[]) => void
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    { className, value, defaultValue = [0], max = 100, min = 0, step = 1, onValueChange, disabled = false, ...props },
    ref,
  ) => {
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const thumbRef = React.useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)
    const [localValue, setLocalValue] = React.useState(value || defaultValue)

    // Update local value when prop value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value)
      }
    }, [value])

    // Calculate percentage for positioning
    const getPercentage = React.useCallback(
      (val: number) => {
        return ((val - min) / (max - min)) * 100
      },
      [min, max],
    )

    // Calculate value from percentage
    const getValueFromPosition = React.useCallback(
      (percentage: number) => {
        const rawValue = (percentage / 100) * (max - min) + min
        const steppedValue = Math.round(rawValue / step) * step
        return Math.max(min, Math.min(max, steppedValue))
      },
      [max, min, step],
    )

    // Handle mouse/touch events
    const handleInteractionStart = React.useCallback(
      (clientX: number) => {
        if (disabled) return

        const slider = sliderRef.current
        if (!slider) return

        const rect = slider.getBoundingClientRect()
        const percentage = ((clientX - rect.left) / rect.width) * 100
        const newValue = [getValueFromPosition(percentage)]

        setLocalValue(newValue)
        if (onValueChange) onValueChange(newValue)
        setIsDragging(true)
      },
      [disabled, getValueFromPosition, onValueChange],
    )

    const handleInteractionMove = React.useCallback(
      (clientX: number) => {
        if (!isDragging || disabled) return

        const slider = sliderRef.current
        if (!slider) return

        const rect = slider.getBoundingClientRect()
        const percentage = ((clientX - rect.left) / rect.width) * 100
        const newValue = [getValueFromPosition(percentage)]

        setLocalValue(newValue)
        if (onValueChange) onValueChange(newValue)
      },
      [isDragging, disabled, getValueFromPosition, onValueChange],
    )

    const handleInteractionEnd = React.useCallback(() => {
      setIsDragging(false)
    }, [])

    // Mouse event handlers
    const handleMouseDown = React.useCallback(
      (e: React.MouseEvent) => {
        handleInteractionStart(e.clientX)
      },
      [handleInteractionStart],
    )

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        handleInteractionMove(e.clientX)
      },
      [handleInteractionMove],
    )

    const handleMouseUp = React.useCallback(() => {
      handleInteractionEnd()
    }, [handleInteractionEnd])

    // Touch event handlers
    const handleTouchStart = React.useCallback(
      (e: React.TouchEvent) => {
        handleInteractionStart(e.touches[0].clientX)
      },
      [handleInteractionStart],
    )

    const handleTouchMove = React.useCallback(
      (e: TouchEvent) => {
        handleInteractionMove(e.touches[0].clientX)
      },
      [handleInteractionMove],
    )

    const handleTouchEnd = React.useCallback(() => {
      handleInteractionEnd()
    }, [handleInteractionEnd])

    // Add and remove event listeners
    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        document.addEventListener("touchmove", handleTouchMove)
        document.addEventListener("touchend", handleTouchEnd)
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

    // Keyboard navigation
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return

        const newValue = [...localValue]

        switch (e.key) {
          case "ArrowRight":
          case "ArrowUp":
            newValue[0] = Math.min(max, newValue[0] + step)
            break
          case "ArrowLeft":
          case "ArrowDown":
            newValue[0] = Math.max(min, newValue[0] - step)
            break
          case "Home":
            newValue[0] = min
            break
          case "End":
            newValue[0] = max
            break
          default:
            return
        }

        e.preventDefault()
        setLocalValue(newValue)
        if (onValueChange) onValueChange(newValue)
      },
      [disabled, localValue, max, min, step, onValueChange],
    )

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute h-full bg-primary" style={{ width: `${getPercentage(localValue[0])}%` }} />
        </div>
        <div
          ref={thumbRef}
          className={cn(
            "absolute h-5 w-5 rounded-full border-2 border-primary bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isDragging && "ring-2 ring-ring ring-offset-2",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
          style={{ left: `calc(${getPercentage(localValue[0])}% - 10px)` }}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue[0]}
          onKeyDown={handleKeyDown}
        />
      </div>
    )
  },
)
Slider.displayName = "Slider"

export { Slider }

