'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ALL_SIZES } from '@/components/products/size-selector'
import { useCart } from '@/store/use-cart'
import { Package } from 'lucide-react'

interface ChangeSizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    productId: string
    name: string
    price: number
    image: string
    quantity: number
    selectedSize: string
    selectedColor: string
  } | null
}

export function ChangeSizeDialog({
  open,
  onOpenChange,
  item,
}: ChangeSizeDialogProps) {
  const cart = useCart()
  const [selectedSize, setSelectedSize] = useState('')

  // Sync selected size when item changes
  if (item && selectedSize !== item.selectedSize) {
    setSelectedSize(item.selectedSize)
  }

  const handleConfirm = () => {
    if (!item || !selectedSize) return
    if (selectedSize === item.selectedSize) {
      onOpenChange(false)
      return
    }

    // Remove old item
    cart.removeItem(item.productId, item.selectedSize, item.selectedColor)
    // Add with new size (same color, price, image)
    cart.addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      selectedSize,
      selectedColor: item.selectedColor,
    })

    onOpenChange(false)
  }

  if (!item) return null

  const hasSizes = item.selectedSize !== 'default' || ALL_SIZES.includes(item.selectedSize)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Đổi Size
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <p className='text-sm text-muted-foreground'>
            Chọn size mới cho <strong className='text-foreground'>{item.name}</strong>
          </p>

          {/* Current selection */}
          <div className='text-xs text-muted-foreground'>
            Hiện tại: <strong className='text-foreground'>{item.selectedSize}</strong>
          </div>

          {/* Size Grid */}
          <div className='flex flex-wrap gap-2'>
            {ALL_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`
                  min-w-[52px] h-10 rounded-md border text-sm font-medium
                  transition-colors
                  ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-400'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Preview */}
          {selectedSize && selectedSize !== item.selectedSize && (
            <p className='text-sm text-center'>
              Size mới: <strong>{selectedSize}</strong>
            </p>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedSize === item.selectedSize}
          >
            Cập nhật Size
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
