'use client'

import { ProductCard } from '@/components/ui/product-card'
import { Product } from '@prisma/client'

interface LatestProductsProps {
  products: Product[]
}

export function LatestProducts({ products }: LatestProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <section className='container mx-auto px-4 sm:px-6 lg:px-8'>
      <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>Latest Products</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} showBadges />
        ))}
      </div>
    </section>
  )
}
