declare module 'vietqr-ts' {
  interface VietQRConfig {
    bankBin: string
    accountNumber?: string
    cardNumber?: string
    serviceCode?: string
    initiationMethod?: string
    amount?: string
    currency?: string
    country?: string
    billNumber?: string
    referenceLabel?: string
    purpose?: string
  }

  interface VietQRResult {
    rawData: string
    crc: string
    fields: unknown[]
  }

  export function generateVietQR(config: VietQRConfig): VietQRResult
}
