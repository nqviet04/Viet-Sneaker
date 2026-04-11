import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import { auth } from '@/auth'
import { SessionProvider } from '@/components/providers/session-provider'
import { CartProvider } from '@/components/providers/cart-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Viet Sneaker',
  description: 'Cửa hàng giày thể thao chính hãng',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
