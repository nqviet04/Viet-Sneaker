'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'
import { Product } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Camera, Sparkles } from 'lucide-react'
import { useVisualSearchStore } from '@/store/use-visual-search'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'

const SIMILARITY_LABELS: Record<string, string> = {
  NIKE: 'Nike',
  ADIDAS: 'Adidas',
  PUMA: 'Puma',
  NEW_BALANCE: 'New Balance',
  CONVERSE: 'Converse',
  VANS: 'Vans',
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { state: vsState, results: vsResults, mlInfo: vsMlInfo, preview: vsPreview, reset } =
    useVisualSearchStore()

  // Reset page when visual search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [vsResults])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryString = searchParams.toString()
        const url = queryString
          ? `/api/products?page=${currentPage}&${queryString}`
          : `/api/products?page=${currentPage}`

        const response = await fetch(url)
        const data = await response.json()

        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams.toString(), currentPage])

  // Extract active filters from searchParams for display
  const activeFilters: { key: string; label: string; values: string[] }[] = []

  const brands = searchParams.get('brands')
  if (brands) activeFilters.push({ key: 'brands', label: 'Thương hiệu', values: brands.split(',') })

  const sizes = searchParams.get('sizes')
  if (sizes) activeFilters.push({ key: 'sizes', label: 'Size', values: sizes.split(',') })

  const colors = searchParams.get('colors')
  if (colors) activeFilters.push({ key: 'colors', label: 'Màu sắc', values: colors.split(',') })

  // Get first selected color for displaying correct product images
  const selectedColor = colors ? colors.split(',')[0] : undefined

  const gender = searchParams.get('gender')
  if (gender) activeFilters.push({ key: 'gender', label: 'Giới tính', values: [gender === 'MEN' ? 'Nam' : gender === 'WOMEN' ? 'Nữ' : 'Unisex'] })

  const shoeType = searchParams.get('shoeType')
  if (shoeType) activeFilters.push({ key: 'shoeType', label: 'Loại giày', values: [shoeType.replace(/_/g, ' ')] })

  const inStock = searchParams.get('inStock')
  if (inStock) activeFilters.push({ key: 'inStock', label: 'Còn hàng', values: ['Có'] })

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  if (minPrice || maxPrice) {
    const min = minPrice ? parseInt(minPrice).toLocaleString('vi-VN') : '0'
    const max = maxPrice ? parseInt(maxPrice).toLocaleString('vi-VN') : '∞'
    activeFilters.push({
      key: 'price',
      label: 'Price',
      values: [`₫${min} - ₫${max}`],
    })
  }

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && key !== 'price') {
      // Remove single value from multi-select
      const current = params.get(key)?.split(',').filter((v) => v !== value) || []
      if (current.length > 0) {
        params.set(key, current.join(','))
      } else {
        params.delete(key)
      }
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    params.delete('page')
    const sort = searchParams.get('sort')
    const q = searchParams.get('q')
    if (sort) params.set('sort', sort)
    if (q) params.set('q', q)
    router.push(`/products${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Page Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold'>
          {vsState === 'results' && vsResults.length > 0 ? 'Kết Quả Tìm Kiếm Hình Ảnh' : 'Tất Cả Sản Phẩm'}
        </h1>
        {!loading && (
          <p className='text-sm text-muted-foreground mt-1'>
            {vsState === 'results' && vsResults.length > 0
              ? `Tìm thấy ${vsResults.length} sản phẩm tương tự`
              : `Hiển thị ${products.length} sản phẩm`}
          </p>
        )}
      </div>

      {/* Visual Search Banner */}
      {vsState === 'results' && vsResults.length > 0 && (
        <div className='mb-6 flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border'>
          {vsPreview ? (
            <div className='relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border bg-white'>
              <Image src={vsPreview} alt='Search image' fill className='object-contain p-1' unoptimized />
            </div>
          ) : (
            <div className='w-16 h-16 shrink-0 rounded-lg border bg-muted flex items-center justify-center'>
              <Camera className='w-6 h-6 text-muted-foreground' />
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='w-4 h-4 text-primary' />
              <span className='font-semibold text-sm'>Tìm giày bằng hình ảnh</span>
            </div>
            {vsMlInfo && (
              <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
                {vsMlInfo.predictedBrand && (
                  <Badge variant='secondary' className='text-xs'>
                    Thương hiệu: {SIMILARITY_LABELS[vsMlInfo.predictedBrand] || vsMlInfo.predictedBrand.replace(/_/g, ' ')}
                  </Badge>
                )}
                {vsMlInfo.dominantColors.length > 0 && (
                  <div className='flex items-center gap-1'>
                    <span className='text-xs'>Màu:</span>
                    {vsMlInfo.dominantColors.slice(0, 3).map((c) => (
                      <div
                        key={c.hex}
                        className='w-4 h-4 rounded-full border'
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                )}
                <span className='text-xs text-muted-foreground'>
                  Phân tích trong {vsMlInfo.processingTimeMs}ms
                </span>
              </div>
            )}
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => {
              reset()
              router.push('/products')
            }}
            className='gap-1.5 shrink-0'
          >
            <X className='h-4 w-4' />
            Xoá tìm kiếm
          </Button>
        </div>
      )}

      {/* Visual Search Analyzing State */}
      {vsState === 'analyzing' && (
        <div className='mb-6 flex items-center gap-4 p-6 bg-primary/5 rounded-xl border border-primary/20'>
          <div className='w-16 h-16 shrink-0 rounded-lg overflow-hidden border bg-gray-100 relative'>
            {vsPreview ? (
              <Image src={vsPreview} alt='Search image' fill className='object-contain p-1' unoptimized />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <Camera className='w-6 h-6 text-muted-foreground' />
              </div>
            )}
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-1'>
              <Sparkles className='w-4 h-4 text-primary animate-pulse' />
              <span className='font-semibold text-sm'>AI đang phân tích hình ảnh...</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              CLIP đang trích xuất đặc trưng và tìm sản phẩm tương tự trong database
            </p>
          </div>
          <div className='flex gap-2 items-center'>
            {vsMlInfo && vsMlInfo.dominantColors.length > 0 && (
              <div className='flex gap-1 mr-2'>
                {vsMlInfo.dominantColors.slice(0, 3).map((c) => (
                  <div
                    key={c.hex}
                    className='w-4 h-4 rounded-full border'
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
            <div className='animate-spin'>
              <Sparkles className='w-5 h-5 text-primary' />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className='mb-4 flex flex-wrap items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Bộ lọc:</span>
          {activeFilters.map(({ key, label, values }) =>
            values.map((value) => (
              <Badge
                key={`${key}-${value}`}
                variant='secondary'
                className='flex items-center gap-1 pl-2 pr-1'
              >
                <span className='text-xs font-medium'>
                  {label}: {value.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => removeFilter(key, value)}
                  className='ml-1 rounded-full hover:bg-gray-200 p-0.5 transition-colors'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={clearAllFilters}
            className='text-xs h-6 px-2'
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar - hidden during visual search results */}
        {vsState !== 'results' && vsState !== 'analyzing' && (
          <aside className='w-full lg:w-64 flex-shrink-0'>
            <ProductSidebar />
          </aside>
        )}

        {/* Main Content */}
        <main className={vsState !== 'results' && vsState !== 'analyzing' ? 'flex-1' : 'w-full'}>
          {/* Visual Search Loading Skeleton */}
          {vsState === 'analyzing' ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className='space-y-3'>
                  <Skeleton className='aspect-square w-full rounded-lg' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid
              products={products}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedColor={selectedColor}
              visualSearchResults={vsState === 'results' ? vsResults : undefined}
              detectedColors={vsState === 'results' ? vsMlInfo?.dominantColors : undefined}
              onClearVisualSearch={() => {
                reset()
                router.push('/products')
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}
