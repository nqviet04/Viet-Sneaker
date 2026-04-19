import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
  selectedSize: string
  selectedColor: string
}

interface ShippingInfo {
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface OrderBody {
  items: CartItem[]
  shippingInfo: ShippingInfo
  total: number
  paymentMethod?: 'cod' | 'bank_transfer'
  subtotal?: number
  shipping?: number
  tax?: number
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: User ID is required' }, { status: 401 })
    }

    const body = await req.json()
    const { items, shippingInfo, total, paymentMethod, subtotal, shipping, tax } = body as OrderBody

    if (!items?.length) {
      return NextResponse.json({ error: 'Bad Request: Cart items are required' }, { status: 400 })
    }

    if (!shippingInfo) {
      return NextResponse.json({ error: 'Bad Request: Shipping information is required' }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Bad Request: Payment method is required' }, { status: 400 })
    }

    // Verify all products exist
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    if (products.length !== items.length) {
      const foundProductIds = products.map((p) => p.id)
      const missingProductIds = productIds.filter(
        (id) => !foundProductIds.includes(id)
      )
      return NextResponse.json(
        { error: 'Products not found: ' + missingProductIds.join(', ') },
        { status: 400 }
      )
    }

    // Check size-specific stock levels
    for (const item of items) {
      const sizeStock = await prisma.sizeStock.findUnique({
        where: {
          productId_size: {
            productId: item.productId,
            size: item.selectedSize,
          },
        },
      })

      if (!sizeStock || sizeStock.stock < item.quantity) {
        return NextResponse.json(
          {
            error:
              'Insufficient stock for size ' +
              item.selectedSize +
              ' of product ' +
              item.productId +
              ' (available: ' +
              (sizeStock?.stock ?? 0) +
              ', requested: ' +
              item.quantity +
              ')',
          },
          { status: 400 }
        )
      }
    }

    // Create shipping address
    const address = await prisma.address.create({
      data: {
        fullName: shippingInfo.fullName,
        email: shippingInfo.email,
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        user: {
          connect: { id: session.user.id },
        },
      },
    })

    // Start a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order with items
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          addressId: address.id,
          subtotal: subtotal ?? 0,
          shipping: shipping ?? 0,
          tax: tax ?? 0,
          total,
          paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              selectedSize: item.selectedSize || 'default',
              selectedColor: item.selectedColor || 'default',
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      })

      // Decrement size-specific stock
      for (const item of items) {
        await tx.sizeStock.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.selectedSize,
            },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        })
      }

      // Recalculate total product stock
      for (const productId of productIds) {
        const sizeStocks = await tx.sizeStock.findMany({
          where: { productId },
          select: { stock: true },
        })
        const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stock, 0)
        await tx.product.update({
          where: { id: productId },
          data: { stock: totalStock },
        })
      }

      // Clear the user's cart if it exists
      await tx.cart
        .delete({
          where: { userId: session.user.id },
        })
        .catch(() => {
          // Ignore if cart doesn't exist
        })

      return newOrder
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('[ORDERS_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
