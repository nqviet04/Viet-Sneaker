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

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
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
}

export function ProductCard({
  product,
  className,
  showBadges = false,
  compact = false,
}: ProductCardProps) {
  const cart = useCart()
  const { toast } = useToast()

  const reviews = product.reviews || []
  const reviewCount = product._count?.reviews ?? reviews.length

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
      : 0

  const defaultSize = product.sizes?.[0] || 'default'
  const defaultColor = product.colors?.[0] || 'default'
  const isOutOfStock = (product.stock ?? 0) === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) {
      toast({
        title: 'Out of stock',
        description: 'This product is currently unavailable.',
        variant: 'destructive',
      })
      return
    }

    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
      selectedSize: defaultSize,
      selectedColor: defaultColor,
    })

    toast({
      title: 'Added to cart',
      description: product.name + ' (Size ' + defaultSize + ')',
      action: (
        <ToastAction altText='View cart' asChild>
          <Link href='/cart'>View Cart</Link>
        </ToastAction>
      ),
    })
  }

  return (
    <Card className={cn('overflow-hidden group flex flex-col', className)}>
      <Link href={'/products/' + product.id} className='flex flex-col flex-1'>
        <div className='aspect-square overflow-hidden relative'>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover transition-transform duration-300 group-hover:scale-105'
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

        <CardHeader className={cn('p-3', compact ? 'p-2' : 'p-4')}>
          <CardTitle className='line-clamp-2 text-sm font-semibold'>
            {product.name}
          </CardTitle>
          {!compact && (
            <CardDescription className='line-clamp-2 text-xs'>
              {product.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className={cn('p-3 pt-0 flex-1', compact ? 'p-2 pt-0' : 'p-4 pt-0')}>
          <div className='flex items-center gap-1 mb-2'>
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
        </CardContent>
      </Link>

      <CardFooter className={cn('p-3 pt-0', compact ? 'p-2 pt-0' : 'p-4 pt-0')}>
        <Button
          className='w-full'
          size={compact ? 'sm' : 'default'}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}
