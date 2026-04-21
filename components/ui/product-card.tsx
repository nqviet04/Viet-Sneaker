'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/store/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { ColorSelector } from '@/components/products/color-selector'
import { SizeSelector, ALL_SIZES } from '@/components/products/size-selector'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    colorImages?: Record<string, string[]> | null
    brand?: string
    gender?: string
    shoeType?: string
    stock?: number
    originalPrice?: number | null
    sizes?: string[]
    colors?: string[]
    _count?: { reviews: number }
    reviews?: { rating: number }[]
  }
  className?: string
  showBadges?: boolean
  compact?: boolean
  selectedColor?: string
  onColorChange?: (color: string) => void
}

export function ProductCard({
  product,
  className,
  showBadges = false,
  compact = false,
  selectedColor: externalColor,
  onColorChange: externalOnColorChange,
}: ProductCardProps) {
  const cart = useCart()
  const { toast } = useToast()

  const reviews = product.reviews || []
  const reviewCount = product._count?.reviews ?? reviews.length

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
      : 0

  const hasSizes = product.sizes && product.sizes.length > 0
  const hasColors = product.colors && product.colors.length > 0
  const defaultColor = product.colors?.[0] || 'default'
  const isOutOfStock = (product.stock ?? 0) === 0

  const [internalColor, setInternalColor] = React.useState('')
  const [selectedSize, setSelectedSize] = React.useState('')
  const [sizeError, setSizeError] = React.useState(false)
  const [colorError, setColorError] = React.useState(false)
  const activeColor = externalColor !== undefined ? externalColor : internalColor

  const getDisplayImage = (): string => {
    const validImages = product.images.filter(Boolean)
    if (!validImages.length) return ''

    if (activeColor && product.colorImages) {
      const normalized = activeColor.toLowerCase().trim()

      if (product.colorImages[normalized]) {
        return product.colorImages[normalized][0]
      }
      if (product.colorImages[activeColor]) {
        return product.colorImages[activeColor][0]
      }

      for (const [key, images] of Object.entries(product.colorImages)) {
        const keyNorm = key.toLowerCase()
        if (keyNorm === normalized || keyNorm.includes(normalized) || normalized.includes(keyNorm)) {
          return images[0]
        }
      }
    }
    return validImages[0]
  }

  const displayImage = getDisplayImage()

  const handleColorChange = (color: string) => {
    if (externalOnColorChange) {
      externalOnColorChange(color)
    }
    setInternalColor(color)
    setColorError(false)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) {
      toast({
        title: 'Hết hàng',
        description: 'Sản phẩm này hiện không có sẵn.',
        variant: 'destructive',
      })
      return
    }

    const colorMissing = hasColors && !activeColor
    if (colorMissing) {
      setColorError(true)
      toast({
        title: 'Vui lòng chọn màu sắc',
        description: 'Bạn cần chọn màu sắc trước khi thêm vào giỏ hàng.',
        variant: 'destructive',
      })
      return
    }

    if (hasSizes && !selectedSize) {
      setSizeError(true)
      toast({
        title: 'Vui lòng chọn size',
        description: 'Bạn cần chọn size trước khi thêm vào giỏ hàng.',
        variant: 'destructive',
      })
      return
    }

    const imageForColor = getDisplayImage()

    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageForColor,
      quantity: 1,
      selectedSize: selectedSize || (product.sizes?.[0] ?? 'default'),
      selectedColor: activeColor || defaultColor,
    })

    const displaySize = (selectedSize || product.sizes?.[0]) ?? 'default'
    const colorText = activeColor ? `, Màu ${activeColor}` : ''

    toast({
      title: 'Đã thêm vào giỏ hàng',
      description: `${product.name} (Size ${displaySize}${colorText})`,
      action: (
        <ToastAction altText='Xem giỏ hàng' asChild>
          <Link href='/cart'>Xem giỏ hàng</Link>
        </ToastAction>
      ),
    })

    setSelectedSize('')
    setSizeError(false)
    setColorError(false)
  }

  return (
    <Card className={cn('overflow-hidden group flex flex-col h-full', className)}>
      {/* Image + Color swatches (fixed aspect, not stretchy) */}
      <div className='flex flex-col'>
        <Link href={'/products/' + product.id} className='block'>
          <div className='aspect-square overflow-hidden relative'>
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                fill
                sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                quality={90}
                priority
              />
            ) : (
              <div className='absolute inset-0 bg-gray-100 flex items-center justify-center'>
                <span className='text-gray-400 text-sm'>No image</span>
              </div>
            )}

            {showBadges && (
              <div className='absolute top-2 left-2 flex flex-col gap-1'>
                {product.brand && (
                  <Badge variant='secondary' className='text-[10px] px-1.5 py-0 bg-black/70 text-white border-0'>
                    {product.brand.replace('_', ' ')}
                  </Badge>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <Badge variant='destructive' className='text-[10px] px-1.5 py-0'>
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
            )}

            {isOutOfStock && (
              <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                <span className='bg-white text-black text-xs font-bold px-3 py-1 rounded'>
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className='px-3 pt-3 pb-1'>
            <ColorSelector
              availableColors={product.colors}
              selectedColor={activeColor}
              onColorChange={handleColorChange}
              compact
            />
          </div>
        )}
      </div>

      {/* Info */}
      <Link href={'/products/' + product.id} className='block px-3 sm:px-4 pt-2'>
        <CardTitle className='line-clamp-2 text-sm font-semibold'>
          {product.name}
        </CardTitle>
        {!compact && (
          <CardDescription className='line-clamp-2 text-xs mt-1'>
            {product.description}
          </CardDescription>
        )}
      </Link>

      {/* Rating + Price */}
      <div className={cn('px-3 sm:px-4', compact ? 'pt-1' : 'pt-2')}>
        <div className='flex items-center gap-1 mb-1'>
          <div className='flex'>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-3 h-3',
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className='text-xs text-gray-500'>({reviewCount})</span>
        </div>
        <div className='flex items-baseline gap-2'>
          <span className='text-base font-bold'>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className='text-xs text-muted-foreground line-through'>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Spacer so footer aligns across cards */}
      <div className='flex-1' />

      {/* Footer: sizes + add to cart */}
      <CardFooter className={cn('p-3 sm:p-4 pt-2 flex-col gap-2')}>
        {hasSizes && (
          <div className='w-full overflow-hidden'>
            <div className='flex flex-wrap gap-1'>
              {ALL_SIZES.map((size) => {
                if (!product.sizes?.includes(size)) return null
                const isSelected = selectedSize === size
                return (
                  <button
                    key={size}
                    type='button'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedSize(size)
                      setSizeError(false)
                    }}
                    className={cn(
                      'h-7 sm:h-8 min-w-[2rem] sm:min-w-[2.5rem] px-1 rounded border text-[10px] sm:text-xs font-medium transition-all duration-150',
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400',
                      sizeError && !selectedSize && 'border-red-400'
                    )}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {sizeError && !selectedSize && (
              <p className='text-xs text-red-500 mt-1'>Vui lòng chọn size</p>
            )}
            {colorError && !activeColor && hasColors && (
              <p className='text-xs text-red-500 mt-1'>Vui lòng chọn màu sắc</p>
            )}
          </div>
        )}
        <Button
          className='w-full mt-auto'
          size={compact ? 'sm' : 'default'}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
        </Button>
      </CardFooter>
    </Card>
  )
}
