import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.product.count()
  console.log('Total products in DB:', count)
  
  const products = await prisma.product.findMany({ take: 3 })
  console.log('Sample products:', products.map(p => p.name))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
