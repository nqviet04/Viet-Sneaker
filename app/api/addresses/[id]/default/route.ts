import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Unset all other defaults for this user
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    })

    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('[ADDRESS_DEFAULT_PATCH]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
