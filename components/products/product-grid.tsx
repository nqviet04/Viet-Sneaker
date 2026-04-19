import { Product } from '@prisma/client'
import { ProductCard } from '@/components/ui/product-card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VisualSearchResult } from '@/store/use-visual-search'
import type { DetectedColor } from '@/lib/color-utils'
import { findBestMatchingColor } from '@/lib/color-utils'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  visualSearchResults?: VisualSearchResult[]
  onClearVisualSearch?: () => void
  detectedColors?: DetectedColor[]
}

function SimilarityBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  let color = 'bg-green-100 text-green-800'
  if (pct < 60) color = 'bg-yellow-100 text-yellow-800'
  if (pct < 40) color = 'bg-gray-100 text-gray-600'

  return (
    <Badge className={cn('text-[10px] font-mono', color)}>
      {pct}% match
    </Badge>
  )
}

export function ProductGrid({
  products,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  visualSearchResults,
  onClearVisualSearch,
  detectedColors,
}: ProductGridProps) {
  const isVisualSearch = visualSearchResults !== undefined

  // When showing visual search results, pick the best-matching color for each product
  const getVisualSearchColor = (productColors: string[]): string | undefined => {
    if (!detectedColors?.length) return undefined
    return findBestMatchingColor(detectedColors, productColors)
  }

  if (loading && !isVisualSearch) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <Skeleton className='aspect-square w-full rounded-lg' />
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ))}
      </div>
    )
  }

  if (isVisualSearch) {
    if (visualSearchResults.length === 0) {
      return (
        <div className='text-center py-16'>
          <h3 className='text-lg font-semibold mb-2'>Không tìm thấy sản phẩm phù hợp</h3>
          <p className='text-muted-foreground mb-4'>
            Thử hình ảnh giày rõ ràng hơn hoặc chụp từ góc khác
          </p>
          <Button variant='outline' onClick={onClearVisualSearch} className='gap-2'>
            <X className='h-4 w-4' />
            Tìm kiếm khác
          </Button>
        </div>
      )
    }

    return (
      <div className='space-y-8'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
          {visualSearchResults.map((product) => {
            const matchedColor = getVisualSearchColor(product.colors)
            return (
              <div key={product.id} className='relative'>
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    description: '',
                    price: product.price,
                    images: product.images,
                    colorImages: product.colorImages,
                    brand: product.brand,
                    gender: product.gender,
                    shoeType: product.shoeType,
                    stock: product.stock,
                    originalPrice: product.originalPrice,
                    colors: product.colors,
                  }}
                  showBadges
                  selectedColor={matchedColor}
                />
                <div className='absolute top-3 right-3 z-10'>
                  <SimilarityBadge score={product.similarityScore} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-semibold'>No products found</h3>
        <p className='text-muted-foreground'>
          Try adjusting your search or filter criteria
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className='flex justify-center'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
