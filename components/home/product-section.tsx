'use client'

import Link from 'next/link'
import { ProductCard } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  brand?: string
  stock?: number
  originalPrice?: number | null
  sizes?: string[]
  colors?: string[]
  _count?: { reviews: number }
  reviews?: { rating: number }[]
}

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  href?: string
  hrefLabel?: string
  viewAllHref?: string
}

export function ProductSection({
  title,
  subtitle,
  products,
  href,
  hrefLabel,
  viewAllHref,
}: ProductSectionProps) {
  if (products.length === 0) return null

  return (
    <section className='py-12'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='flex items-end justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold'>{title}</h2>
            {subtitle && (
              <p className='text-muted-foreground text-sm mt-1'>{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <Button variant='ghost' size='sm' asChild>
              <Link href={viewAllHref} className='flex items-center gap-1'>
                Xem tất cả <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadges
              className='h-full'
            />
          ))}
        </div>

        {/* CTA (optional) */}
        {href && hrefLabel && (
          <div className='mt-8 text-center'>
            <Button asChild>
              <Link href={href}>{hrefLabel}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
