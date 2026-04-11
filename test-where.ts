import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Test 1: Count all products')
  const count = await prisma.product.count()
  console.log('Total:', count)
  
  console.log('Test 2: Find products without where')
  const products1 = await prisma.product.findMany({ take: 3 })
  console.log('Products without where:', products1.map(p => p.name))
  
  console.log('Test 3: Find products with empty where')
  const products2 = await prisma.product.findMany({ where: {}, take: 3 })
  console.log('Products with empty where:', products2.map(p => p.name))
  
  console.log('Test 4: Find products with price where')
  const products3 = await prisma.product.findMany({ 
    where: { price: { gte: 0, lte: 999999 } }, 
    take: 3 
  })
  console.log('Products with price where:', products3.map(p => p.name))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())