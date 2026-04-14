'use client'

import { useState } from 'react'
import { ProductGallery } from './product-gallery'
import { ProductInfo } from './product-info'

interface SizeStock {
  size: string
  stock: number
}

interface ProductDetailProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    brand: string
    sizes: string[]
    colors: string[]
    gender: string
    shoeType: string
    originalPrice: number | null
    reviews: { rating: number }[]
    sizeStock: SizeStock[]
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState('')

  const getImagesForColor = (color: string): string[] => {
    if (!color || product.colors.length === 0) {
      return product.images
    }

    const colorIndex = product.colors.indexOf(color.toLowerCase())
    if (colorIndex === -1) {
      return product.images
    }

    const imagesPerColor = Math.ceil(product.images.length / product.colors.length)
    const startIndex = colorIndex * imagesPerColor
    const endIndex = Math.min(startIndex + imagesPerColor, product.images.length)
    const colorImages = product.images.slice(startIndex, endIndex)

    return colorImages.length > 0 ? colorImages : product.images
  }

  const displayImages = getImagesForColor(selectedColor)

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16'>
      <ProductGallery images={displayImages} />

      <ProductInfo
        product={product}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
      />
    </div>
  )
}
