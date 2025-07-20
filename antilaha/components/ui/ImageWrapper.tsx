"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"

interface ImageWrapperProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
  aspectRatio?: string
  containerClassName?: string
}

export default function ImageWrapper({
  src,
  alt,
  fill,
  sizes,
  priority,
  quality,
  className,
  style,
  fallbackSrc = "/placeholder.svg?key=d8lu8",
  aspectRatio = "aspect-[3/4]",
  containerClassName = "",
  ...props
}: ImageWrapperProps) {
  const [error, setError] = useState(false)

  // Handle image load error
  const handleError = () => {
    setError(true)
  }

  // Default sizes if not provided
  const defaultSizes = fill
    ? "100vw"
    : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"

  return (
    <div
      className={`relative overflow-hidden ${fill ? "" : aspectRatio} ${containerClassName}`}
      style={{ position: fill ? "relative" : "relative" }}
    >
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        fill={fill}
        sizes={sizes || defaultSizes}
        priority={priority}
        quality={quality || 80}
        className={`object-cover ${className || ""}`}
        style={style}
        onError={handleError}
        {...props}
      />
    </div>
  )
}
