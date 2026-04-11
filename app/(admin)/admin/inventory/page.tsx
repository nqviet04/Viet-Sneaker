import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { InventoryClient } from '@/components/admin/inventory-client'

export default async function AdminInventoryPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return <InventoryClient />
}
