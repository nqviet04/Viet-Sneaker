import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { BankTransferContent } from '@/components/checkout/bank-transfer-content'

type tParams = Promise<{ id: string }>

interface PageProps {
  params: tParams
}

export default async function BankTransferPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/bank-transfer/' + id)
  }

  const order = await prisma.order.findUnique({
    where: {
      id: id,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: true },
          },
        },
      },
      shippingAddress: true,
    },
  })

  if (!order) {
    redirect('/')
  }

  const subtotal = order.subtotal ?? order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = order.shipping ?? (subtotal >= 250 ? 0 : 10)
  const tax = order.tax ?? subtotal * 0.1
  const total = order.total

  return (
    <BankTransferContent
      orderId={id}
      total={total}
      subtotal={subtotal}
      shipping={shipping}
      tax={tax}
      orderItems={order.items}
      shippingAddress={order.shippingAddress}
    />
  )
}
