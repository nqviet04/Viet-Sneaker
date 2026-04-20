'use client'

import { useEffect } from 'react'

interface BankTransferPageWrapperProps {
  orderId: string
  children: React.ReactNode
}

export function BankTransferPageWrapper({ orderId, children }: BankTransferPageWrapperProps) {
  useEffect(() => {
    localStorage.setItem('pending_bank_order', orderId)
  }, [orderId])

  return <>{children}</>
}
