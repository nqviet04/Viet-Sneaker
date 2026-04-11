import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

/**
 * GET /api/reviews?productId=xxx
 * Returns reviews for a specific product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId parameter' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Reviews GET Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews
 * Creates a new review for a product
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment } = body

    if (!productId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: productId and rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Reviews POST Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
