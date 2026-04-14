'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'
import { Product } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Build query string from searchParams
        const queryString = searchParams.toString()
        const url = queryString
          ? `/api/products?page=${currentPage}&${queryString}`
          : `/api/products?page=${currentPage}`

        const response = await fetch(url)
        const data = await response.json()

        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
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
        <h1 className='text-2xl font-bold'>Tất Cả Sản Phẩm</h1>
        {!loading && (
          <p className='text-sm text-muted-foreground mt-1'>
            Hiển thị {products.length} trong {total} sản phẩm
          </p>
        )}
      </div>

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
        {/* Sidebar */}
        <aside className='w-full lg:w-64 flex-shrink-0'>
          <ProductSidebar />
        </aside>

        {/* Main Content */}
        <main className='flex-1'>
          <ProductGrid
            products={products}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            selectedColor={selectedColor}
          />
        </main>
      </div>
    </div>
  )
}
