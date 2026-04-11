'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Check } from 'lucide-react'

interface SizeOption {
  size: string
  stock: number
}

interface SizeSelectorProps {
  availableSizes: SizeOption[]
  selectedSize: string
  onSizeChange: (size: string) => void
  error?: boolean
}

// Common EU shoe sizes for display
export const ALL_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']

export function SizeSelector({
  availableSizes,
  selectedSize,
  onSizeChange,
  error,
}: SizeSelectorProps) {
  // Build a map of size -> stock for quick lookup
  const stockMap = new Map(availableSizes.map((s) => [s.size, s.stock]))

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label className={error ? 'text-red-500' : ''}>
          Size
          {error && <span className='text-xs text-red-500 ml-2'>Vui lòng chọn size</span>}
        </Label>
        <span className='text-xs text-muted-foreground'>Size EU</span>
      </div>

      {/* Size Grid */}
      <div className='flex flex-wrap gap-2'>
        {ALL_SIZES.map((size) => {
          const stock = stockMap.get(size) ?? 0
          const inStock = stock > 0
          const isSelected = selectedSize === size
          const isLowStock = inStock && stock <= 3

          if (!inStock) {
            // Out of stock - show crossed out
            return (
              <TooltipProvider key={size} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type='button'
                      disabled
                      className={`
                        relative w-12 h-10 rounded-md border text-sm font-medium
                        border-gray-200 text-gray-300 cursor-not-allowed
                        line-through opacity-50
                      `}
                    >
                      {size}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='text-xs'>Hết hàng</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }

          // In stock - interactive
          return (
            <TooltipProvider key={size} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    onClick={() => onSizeChange(size)}
                    className={`
                      relative w-12 h-10 rounded-md border text-sm font-medium
                      transition-all duration-150
                      ${isSelected
                        ? 'border-black bg-black text-white shadow-md scale-105'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:scale-105'
                      }
                    `}
                  >
                    {isSelected && (
                      <Check className='absolute top-1 right-1 h-3 w-3 text-white' />
                    )}
                    {size}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isLowStock ? (
                    <p className='text-xs'>Chỉ còn {stock} đôi</p>
                  ) : (
                    <p className='text-xs'>{stock} có sẵn</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Selected size info */}
      {selectedSize && (
        <p className='text-sm text-muted-foreground'>
          Đã chọn: EU {selectedSize}
          {(() => {
            const stock = stockMap.get(selectedSize)
            if (stock && stock <= 3) {
              return (
                <span className='text-orange-500 ml-2 font-medium'>
                  Chỉ còn {stock} đôi trong kho!
                </span>
              )
            }
            return null
          })()}
        </p>
      )}
    </div>
  )
}
