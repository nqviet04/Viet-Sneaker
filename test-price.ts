import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({ take: 5 })
  console.log('Sample products and prices:')
  products.forEach(p => {
    console.log(`  ${p.name}: price=${p.price} (type: ${typeof p.price})`)
  })
  
  console.log('\nTest price comparisons:')
  console.log('  price >= 0:', await prisma.product.count({ where: { price: { gte: 0 } } }))
  console.log('  price > 0:', await prisma.product.count({ where: { price: { gt: 0 } } }))
  console.log('  price <= 999999:', await prisma.product.count({ where: { price: { lte: 999999 } } }))
  console.log('  price >= 0 AND <= 999999:', await prisma.product.count({ where: { price: { gte: 0, lte: 999999 } } }))
  
  // Check raw
  const raw = await prisma.$queryRaw`SELECT name, price FROM "Product" LIMIT 5`
  console.log('\nRaw query:', raw)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())