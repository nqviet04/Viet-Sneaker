import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { ChangePasswordDialog } from '@/components/dashboard/change-password-dialog'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Cài Đặt Hồ Sơ</h2>
        <p className='text-muted-foreground'>
          Quản lý cài đặt và tùy chỉnh tài khoản
        </p>
      </div>
      <div className='grid gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Thông Tin Cá Nhân</CardTitle>
            <ChangePasswordDialog />
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
