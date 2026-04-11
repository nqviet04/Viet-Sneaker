import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizeStock: true,
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin Product GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      price,
      images,
      brand,
      sizes,
      colors,
      gender,
      shoeType,
      stock,
      originalPrice,
      sizeStock,
    } = body

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(images !== undefined && { images }),
        ...(brand !== undefined && { brand }),
        ...(sizes !== undefined && { sizes }),
        ...(colors !== undefined && { colors }),
        ...(gender !== undefined && { gender }),
        ...(shoeType !== undefined && { shoeType }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(originalPrice !== undefined && {
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        }),
      },
    })

    // Update size stock if provided
    if (sizeStock !== undefined) {
      // Delete existing size stock
      await prisma.sizeStock.deleteMany({ where: { productId: id } })

      // Create new size stock entries
      if (sizeStock.length > 0) {
        await prisma.sizeStock.createMany({
          data: sizeStock.map((s: { size: string; stock: number }) => ({
            productId: id,
            size: s.size,
            stock: parseInt(s.stock) || 0,
          })),
        })
      }

      // Recalculate total stock
      const totalStock = sizeStock.reduce(
        (sum: number, s: { stock: number }) => sum + (parseInt(s.stock) || 0),
        0
      )
      await prisma.product.update({
        where: { id },
        data: { stock: totalStock },
      })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Admin Product PUT Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderCount > 0) {
      // Soft delete - just mark as out of stock instead of actually deleting
      await prisma.product.update({
        where: { id },
        data: { stock: 0 },
      })
      return NextResponse.json({
        message: 'Product has orders. Stock set to 0 instead of deletion.',
        softDeleted: true,
      })
    }

    // Hard delete - product has no orders
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Admin Product DELETE Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
