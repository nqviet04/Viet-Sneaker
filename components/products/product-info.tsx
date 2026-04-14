'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCart } from '@/store/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import Link from 'next/link'
import { SizeSelector } from './size-selector'
import { ColorSelector } from './color-selector'
import { BrandBadge, GenderBadge, ShoeTypeBadge } from './brand-badge'
import { formatPrice } from '@/lib/utils'

interface SizeStock {
  size: string
  stock: number
}

interface ProductInfoProps {
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
  selectedColor?: string
  onColorChange?: (color: string) => void
}

export function ProductInfo({ product, selectedColor: externalColor, onColorChange: externalOnColorChange }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState('')
  const [internalColor, setInternalColor] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [sizeError, setSizeError] = useState(false)
  const [colorError, setColorError] = useState(false)
  const cart = useCart()
  const { toast } = useToast()

  const selectedColor = externalColor !== undefined ? externalColor : internalColor

  const handleColorChange = (color: string) => {
    if (externalOnColorChange) {
      externalOnColorChange(color)
    } else {
      setInternalColor(color)
      setColorError(false)
    }
  }

  // Calculate average rating
  const averageRating = product.reviews.length
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length
    : 0

  // Build size options with stock info from sizeStock
  const sizeOptions: SizeStock[] = product.sizes
    .map((size) => {
      const found = product.sizeStock.find((s) => s.size === size)
      return found
        ? { size: found.size, stock: found.stock }
        : null
    })
    .filter(Boolean) as SizeStock[]

  // Color validation: require color selection if product has colors
  const requiresColor = product.colors.length > 0

  const handleAddToCart = () => {
    let hasError = false

    if (!selectedSize) {
      setSizeError(true)
      hasError = true
    }

    if (requiresColor && !selectedColor) {
      setColorError(true)
      hasError = true
    }

    if (hasError) {
      toast({
        title: 'Chưa chọn đủ',
        description: requiresColor
          ? 'Vui lòng chọn cả size và màu sắc trước khi thêm vào giỏ hàng.'
          : 'Vui lòng chọn size trước khi thêm vào giỏ hàng.',
        variant: 'destructive',
      })
      return
    }

    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: parseInt(quantity),
      selectedSize,
      selectedColor: selectedColor || 'default',
    })

    toast({
      title: 'Đã thêm vào giỏ hàng',
      description: `${quantity} x ${product.name} (Size ${selectedSize}${selectedColor ? `, ${selectedColor}` : ''})`,
      action: (
        <ToastAction altText='Xem giỏ hàng' asChild>
          <Link href='/cart'>Xem giỏ hàng</Link>
        </ToastAction>
      ),
    })
  }

  return (
    <div className='space-y-6'>
      {/* Header: Badges + Title + Rating */}
      <div>
        {/* Badges Row */}
        <div className='flex flex-wrap items-center gap-2 mb-3'>
          <BrandBadge brand={product.brand} />
          <GenderBadge gender={product.gender} />
          <ShoeTypeBadge shoeType={product.shoeType} />
        </div>

        {/* Product Name */}
        <h1 className='text-3xl font-bold tracking-tight'>{product.name}</h1>

        {/* Rating */}
        <div className='flex items-center gap-2 mt-2'>
          <div className='flex gap-0.5'>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className='text-sm text-muted-foreground'>
            {averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có'} đánh giá
          </span>
          <span className='text-muted-foreground'>|</span>
          <span className='text-sm text-muted-foreground'>
            {product.reviews.length} bình luận
          </span>
        </div>
      </div>

      {/* Price */}
      <div className='flex items-baseline gap-3'>
        <span className='text-3xl font-bold'>
          {formatPrice(product.price)}
        </span>
        {product.originalPrice && product.originalPrice > product.price && (
          <>
            <span className='text-lg text-muted-foreground line-through'>
              {formatPrice(product.originalPrice)}
            </span>
            <span className='text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded'>
              Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <div className='text-muted-foreground leading-relaxed'>
        <p>{product.description}</p>
      </div>

      {/* Selectors */}
      <div className='space-y-5'>
        {/* Color Selector */}
        {product.colors.length > 0 && (
          <ColorSelector
            availableColors={product.colors}
            selectedColor={selectedColor}
            onColorChange={handleColorChange}
            error={colorError}
          />
        )}

        {/* Size Selector */}
        {sizeOptions.length > 0 && (
          <SizeSelector
            availableSizes={sizeOptions}
            selectedSize={selectedSize}
            onSizeChange={(size) => {
              setSelectedSize(size)
              setSizeError(false)
            }}
            error={sizeError}
          />
        )}

        {/* Quantity */}
        <div className='space-y-2'>
          <span className='text-sm font-medium'>Số lượng</span>
          <Select value={quantity} onValueChange={setQuantity}>
            <SelectTrigger className='w-28'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: Math.min(10, product.stock || 1) },
                (_, i) => i + 1
              ).map((n) => (
                <SelectItem key={n} value={n.toString()}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stock Status + CTA */}
      <div className='space-y-3 pt-2'>
        {/* Stock Status */}
        <div className='flex items-center gap-2'>
          {product.stock > 0 ? (
            <>
              <div className='w-2 h-2 rounded-full bg-green-500' />
              <span className='text-sm font-medium text-green-700'>
                Còn hàng
              </span>
              {product.stock <= 10 && (
                <span className='text-xs text-orange-500 font-medium'>
                  Chỉ còn {product.stock} sản phẩm!
                </span>
              )}
            </>
          ) : (
            <>
              <div className='w-2 h-2 rounded-full bg-red-500' />
              <span className='text-sm font-medium text-red-600'>
                Hết hàng
              </span>
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          className='w-full'
          disabled={product.stock === 0}
          size='lg'
        >
          {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
        </Button>

        {/* Quick Info */}
        <p className='text-xs text-center text-muted-foreground'>
          Miễn phí vận chuyển cho đơn từ ₫2.500.000 • Đổi trả trong 30 ngày
        </p>
      </div>
    </div>
  )
}
