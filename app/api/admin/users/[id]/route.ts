import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function PATCH(
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
    const { action } = body

    if (action === 'update-role') {
      const { role } = body
      if (!role || !Object.values(Role).includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      // Prevent self-demotion
      if (id === session.user.id && role !== Role.ADMIN) {
        return NextResponse.json(
          { error: 'Cannot demote yourself from admin' },
          { status: 400 }
        )
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      return NextResponse.json(user)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Admin User PATCH Error:', error)
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

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // Check if user has orders
    const orderCount = await prisma.order.count({ where: { userId: id } })

    if (orderCount > 0) {
      // Soft delete - just disable the user account instead
      // For now, we'll just return an error
      return NextResponse.json(
        { error: 'User has existing orders. Cannot delete account.' },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Admin User DELETE Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
