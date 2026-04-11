'use client'

import { useEffect } from 'react'
import { useCart } from '@/store/use-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const initializeFromStorage = useCart((state) => state.initializeFromStorage)

  useEffect(() => {
    initializeFromStorage()
  }, [initializeFromStorage])

  return <>{children}</>
}
