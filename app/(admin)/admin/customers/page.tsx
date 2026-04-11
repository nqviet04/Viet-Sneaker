import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminUsersClient } from '@/components/admin/admin-users-client'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Khách Hàng</h2>
        <p className='text-muted-foreground'>
          Quản lý khách hàng, xem lịch sử đơn hàng và kiểm soát quyền truy cập admin.
        </p>
      </div>
      <AdminUsersClient currentUserId={session.user.id} />
    </div>
  )
}
