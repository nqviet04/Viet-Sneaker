'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PendingOrderChecker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't cancel if on bank transfer page or if pathname is not yet available (hydration)
    if (!pathname || pathname.startsWith('/bank-transfer/')) {
      return
    }

    const pendingOrderId = localStorage.getItem('pending_bank_order')
    if (pendingOrderId) {
      fetch('/api/orders/cancel-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: pendingOrderId }),
      }).catch(() => {}).finally(() => {
        localStorage.removeItem('pending_bank_order')
      })
    }
  }, [pathname])

  return null
}
