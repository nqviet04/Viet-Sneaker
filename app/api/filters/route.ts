/**
 * /api/filters - API endpoint for product filter options
 * Returns available brands, genders, shoe types, and sizes from actual product data
 */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Brand, Gender, ShoeType } from '@prisma/client'

export async function GET() {
  try {
    // Get unique brands from products that have stock
    const brands = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    })

    // Get unique shoe types from products that have stock
    const shoeTypes = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      select: { shoeType: true },
      distinct: ['shoeType'],
    })

    // Get all available sizes from sizeStock (only those with stock > 0)
    const sizes = await prisma.sizeStock.findMany({
      where: { stock: { gt: 0 } },
      select: { size: true },
      distinct: ['size'],
      orderBy: { size: 'asc' },
    })

    // Get all available colors from products
    const productsWithColors = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        colors: { isEmpty: false },
      },
      select: { colors: true },
    })

    // Flatten and dedupe colors
    const colorSet = new Set<string>()
    const excludedColors = ['black-white', 'black_white', 'burgundy', 'checkerboard', 'egret', 'navy']
    productsWithColors.forEach((p) => {
      p.colors.forEach((c) => {
        if (!excludedColors.includes(c.toLowerCase())) {
          colorSet.add(c)
        }
      })
    })
    const colors = Array.from(colorSet).sort()

    return NextResponse.json({
      brands: brands.map((b) => b.brand),
      genders: Object.values(Gender),
      shoeTypes: shoeTypes.map((s) => s.shoeType),
      sizes: sizes.map((s) => s.size),
      colors,
    })
  } catch (error) {
    console.error('Filters API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
