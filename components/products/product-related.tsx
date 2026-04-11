'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/ui/product-card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface ProductRelatedProps {
  currentProductId: string
  brand: string
  shoeType: string
}

export function ProductRelated({
  currentProductId,
  brand,
  shoeType,
}: ProductRelatedProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await fetch(
          `/api/products/related?currentProductId=${currentProductId}&brand=${brand}&shoeType=${shoeType}`
        )
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId, brand, shoeType])

  if (loading) {
    return <div>Loading related products...</div>
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold'>Related Products</h2>
      <Carousel className='w-full'>
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className='md:basis-1/2 lg:basis-1/3'
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
