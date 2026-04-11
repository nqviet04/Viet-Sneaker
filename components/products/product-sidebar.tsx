'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brand, Gender, ShoeType } from '@prisma/client'

const GENDER_LABELS: Record<Gender, string> = {
  MEN: 'Nam',
  WOMEN: 'Nữ',
  UNISEX: 'Unisex',
}

const SHOE_TYPE_LABELS: Record<ShoeType, string> = {
  RUNNING: 'Chạy bộ',
  CASUAL: 'Thường ngày',
  BOOTS: 'Boots',
  FORMAL: 'Lịch lãm',
  SLIPPERS: 'Dép',
  BASKETBALL: 'Bóng rổ',
  SKATEBOARDING: 'Trượt ván',
  TRAINING: 'Tập gym',
  HIKING: 'Đi bộ đường dài',
}

const BRAND_LABELS: Record<Brand, string> = {
  NIKE: 'Nike',
  ADIDAS: 'Adidas',
  PUMA: 'Puma',
  NEW_BALANCE: 'New Balance',
  CONVERSE: 'Converse',
  VANS: 'Vans',
}

const COLOR_SWATCHES: Record<string, string> = {
  black: '#171717',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  gray: '#6b7280',
  grey: '#9ca3af',
  brown: '#92400e',
  pink: '#f472b6',
  yellow: '#facc15',
  orange: '#f97316',
  purple: '#a855f7',
  navy: '#1e3a8a',
  cream: '#fef3c7',
  beige: '#d6d3d1',
}

export function ProductSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000000])

  const parseMultiSelect = (param: string | null): string[] => {
    if (!param) return []
    return param.split(',').filter(Boolean)
  }

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    parseMultiSelect(searchParams.get('brands'))
  )
  const [selectedGender, setSelectedGender] = useState(
    searchParams.get('gender') || ''
  )
  const [selectedShoeType, setSelectedShoeType] = useState(
    searchParams.get('shoeType') || ''
  )
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    parseMultiSelect(searchParams.get('sizes'))
  )
  const [selectedColors, setSelectedColors] = useState<string[]>(
    parseMultiSelect(searchParams.get('colors'))
  )
  const [selectedInStock, setSelectedInStock] = useState(
    searchParams.get('inStock') === 'true'
  )
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get('sort') || 'created_desc'
  )

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('/api/filters')
        const data = await response.json()
        setBrands(data.brands || [])
        setSizes(data.sizes || [])
        setColors(data.colors || [])
      } catch (error) {
        console.error('Error fetching filters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilters()
  }, [])

  const activeFilterCount =
    selectedBrands.length +
    selectedSizes.length +
    selectedColors.length +
    (selectedGender ? 1 : 0) +
    (selectedShoeType ? 1 : 0) +
    (selectedInStock ? 1 : 0)

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams()

    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','))
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','))
    if (selectedColors.length > 0) params.set('colors', selectedColors.join(','))
    if (selectedGender) params.set('gender', selectedGender)
    if (selectedShoeType) params.set('shoeType', selectedShoeType)
    if (selectedInStock) params.set('inStock', 'true')
    if (selectedSort !== 'created_desc') params.set('sort', selectedSort)
    params.set('minPrice', priceRange[0].toString())
    params.set('maxPrice', priceRange[1].toString())

    router.push(`/products?${params.toString()}`)
  }, [router, selectedBrands, selectedSizes, selectedColors, selectedGender, selectedShoeType, selectedInStock, selectedSort, priceRange])

  const handleReset = () => {
    setSelectedBrands([])
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedGender('')
    setSelectedShoeType('')
    setSelectedInStock(false)
    setSelectedSort('created_desc')
    setPriceRange([0, 10000000])
    router.push('/products')
  }

  const toggleMultiSelect = (
    value: string,
    selected: string[],
    setSelected: (v: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value))
    } else {
      setSelected([...selected, value])
    }
  }

  if (loading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-6 w-20' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-6 w-20' />
        <Skeleton className='h-16 w-full' />
        <Skeleton className='h-6 w-20' />
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-9 w-full' />
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-semibold'>Bộ lọc</span>
        {activeFilterCount > 0 && (
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {activeFilterCount} đang chọn
            </Badge>
            <button
              onClick={handleReset}
              className='text-xs text-muted-foreground hover:text-foreground underline'
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      <Separator />

      {brands.length > 0 && (
        <div className='space-y-3'>
          <Label className='text-sm font-semibold text-foreground'>Thương hiệu</Label>
          <div className='space-y-2'>
            {brands.map((brand) => (
              <label
                key={brand}
                className='flex items-center gap-2.5 cursor-pointer group'
              >
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() =>
                    toggleMultiSelect(brand, selectedBrands, setSelectedBrands)
                  }
                />
                <span className='text-sm group-hover:text-foreground transition-colors'>
                  {BRAND_LABELS[brand] || brand.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className='space-y-3'>
        <Label className='text-sm font-semibold text-foreground'>Giới tính</Label>
        <div className='space-y-2'>
          {Object.entries(GENDER_LABELS).map(([key, label]) => (
            <label
              key={key}
              className='flex items-center gap-2.5 cursor-pointer group'
            >
              <Checkbox
                id={`gender-${key}`}
                checked={selectedGender === key}
                onCheckedChange={() =>
                  setSelectedGender(selectedGender === key ? '' : key)
                }
              />
              <span className='text-sm group-hover:text-foreground transition-colors'>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <Label className='text-sm font-semibold text-foreground'>Loại giày</Label>
        <div className='space-y-2'>
          {Object.entries(SHOE_TYPE_LABELS).map(([key, label]) => (
            <label
              key={key}
              className='flex items-center gap-2.5 cursor-pointer group'
            >
              <Checkbox
                id={`shoeType-${key}`}
                checked={selectedShoeType === key}
                onCheckedChange={() =>
                  setSelectedShoeType(selectedShoeType === key ? '' : key)
                }
              />
              <span className='text-sm group-hover:text-foreground transition-colors'>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {sizes.length > 0 && (
        <div className='space-y-3'>
          <Label className='text-sm font-semibold text-foreground'>Size (EU)</Label>
          <div className='flex flex-wrap gap-2'>
            {sizes.map((size) => (
              <button
                key={size}
                type='button'
                onClick={() =>
                  toggleMultiSelect(size, selectedSizes, setSelectedSizes)
                }
                className={`min-w-[40px] h-9 px-2 rounded-md border text-xs font-medium transition-all duration-150 ${
                  selectedSizes.includes(size)
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className='space-y-3'>
          <Label className='text-sm font-semibold text-foreground'>Màu sắc</Label>
          <div className='flex flex-wrap gap-2'>
            {colors.map((color) => {
              const hex = COLOR_SWATCHES[color.toLowerCase()] || '#9ca3af'
              const isLight = ['white', 'cream', 'beige', 'ivory', 'yellow'].includes(color.toLowerCase())
              const isSelected = selectedColors.includes(color.toLowerCase())

              return (
                <button
                  key={color}
                  type='button'
                  onClick={() =>
                    toggleMultiSelect(color.toLowerCase(), selectedColors, setSelectedColors)
                  }
                  className={`relative w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110 ${
                    isSelected
                      ? 'ring-2 ring-offset-2 ring-black scale-110'
                      : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={color}
                  aria-label={`Color: ${color}`}
                >
                  {isSelected && (
                    <span className={`absolute inset-0 flex items-center justify-center text-xs ${isLight ? 'text-black' : 'text-white'}`}>
                      &#10003;
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className='space-y-3'>
        <Label className='text-sm font-semibold text-foreground'>Giá</Label>
        <div className='space-y-2 pt-1'>
          <Slider
            value={priceRange}
            min={0}
            max={10000000}
            step={100000}
            onValueChange={setPriceRange}
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>&#8363;{priceRange[0].toLocaleString()}</span>
            <span>&#8363;{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <Label className='text-sm font-semibold text-foreground'>Tình trạng</Label>
        <label className='flex items-center gap-2.5 cursor-pointer'>
          <Checkbox
            id='inStock'
            checked={selectedInStock}
            onCheckedChange={(checked) => setSelectedInStock(checked === true)}
          />
          <span className='text-sm'>Chỉ còn hàng</span>
        </label>
      </div>

      <div className='space-y-3'>
        <Label className='text-sm font-semibold text-foreground'>Sắp xếp theo</Label>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className='w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring'
        >
          <option value='created_desc'>Mới nhất</option>
          <option value='price_asc'>Giá: Thấp đến cao</option>
          <option value='price_desc'>Giá: Cao đến thấp</option>
          <option value='name_asc'>Tên: A đến Z</option>
          <option value='name_desc'>Tên: Z đến A</option>
          <option value='stock_desc'>Tồn kho nhiều nhất</option>
        </select>
      </div>

      <Button onClick={handleFilter} className='w-full'>
        Áp dụng bộ lọc
        {activeFilterCount > 0 && (
          <Badge variant='secondary' className='ml-2 text-xs'>
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </div>
  )
}
