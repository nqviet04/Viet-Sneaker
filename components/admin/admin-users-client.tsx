'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  ShieldOff,
  UserX,
  Eye,
  ArrowUpDown,
  ShoppingBag,
  Star,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Role } from '@prisma/client'

// ============================================
// TYPES
// ============================================

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: Role
  createdAt: string
  totalSpent: number
  _count: {
    orders: number
    reviews: number
  }
}

// ============================================
// CONSTANTS
// ============================================

const roleConfig: Record<Role, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Shield,
  },
  USER: {
    label: 'Customer',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Users,
  },
}

// ============================================
// USER DETAIL DIALOG
// ============================================

function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!user) return null

  const config = roleConfig[user.role]
  const RoleIcon = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>View customer information and statistics.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Avatar and Name */}
          <div className='flex items-center gap-4'>
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={64}
                height={64}
                className='rounded-full'
              />
            ) : (
              <div className='h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500'>
                {user.name?.[0] || user.email[0]}
              </div>
            )}
            <div>
              <p className='font-semibold text-lg'>{user.name || 'Guest'}</p>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <Badge className={config.color} variant='outline'>
                <RoleIcon className='h-3 w-3 mr-1' />
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-3 gap-3'>
            <div className='rounded-lg border p-3 text-center'>
              <ShoppingBag className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
              <p className='text-xl font-bold'>{user._count.orders}</p>
              <p className='text-xs text-muted-foreground'>Orders</p>
            </div>
            <div className='rounded-lg border p-3 text-center'>
              <Star className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
              <p className='text-xl font-bold'>{user._count.reviews}</p>
              <p className='text-xs text-muted-foreground'>Reviews</p>
            </div>
            <div className='rounded-lg border p-3 text-center'>
              <Calendar className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
              <p className='text-sm font-bold'>
                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className='text-xs text-muted-foreground'>Joined</p>
            </div>
          </div>

          {/* Total Spent */}
          <div className='rounded-lg bg-green-50 border border-green-200 p-4'>
            <p className='text-sm text-green-700 font-medium'>Total Spent</p>
            <p className='text-2xl font-bold text-green-800'>
              {formatCurrency(user.totalSpent)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AdminUsersClient({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 15

  // Dialog
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const wasDetailOpen = useRef(false)

  // Refresh page when detail dialog closes
  useEffect(() => {
    if (wasDetailOpen.current && !detailOpen) {
      window.location.reload()
    }
    wasDetailOpen.current = detailOpen
  }, [detailOpen])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort: sortBy,
      })
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Update user role
  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-role', role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update role')
      }

      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}.`,
      })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      toast({ title: 'User Deleted', description: 'User account has been removed.' })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
    setDeleteUserId(null)
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <>
      <UserDetailDialog
        user={selectedUser}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='space-y-4'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              {total} user{total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className='pt-4'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by name or email...'
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className='pl-9'
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
                <SelectTrigger className='w-[160px]'>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                  <SelectItem value='USER'>Customer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                <SelectTrigger className='w-[160px]'>
                  <ArrowUpDown className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='created_desc'>Newest First</SelectItem>
                  <SelectItem value='created_asc'>Oldest First</SelectItem>
                  <SelectItem value='name_asc'>Name: A to Z</SelectItem>
                  <SelectItem value='email_asc'>Email: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className='w-10'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className='h-8 w-48 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-16 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-8 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-20 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-4 w-24 bg-gray-100 rounded animate-pulse' /></TableCell>
                        <TableCell><div className='h-8 w-8 bg-gray-100 rounded animate-pulse' /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-12'>
                        <Users className='h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50' />
                        <p className='text-muted-foreground'>No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const config = roleConfig[user.role]
                      const RoleIcon = config.icon
                      const isCurrentUser = user.id === currentUserId

                      return (
                        <TableRow key={user.id} className={isCurrentUser ? 'bg-blue-50/50' : ''}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              {user.image ? (
                                <Image
                                  src={user.image}
                                  alt={user.name || 'Người dùng'}
                                  width={36}
                                  height={36}
                                  className='rounded-full'
                                />
                              ) : (
                                <div className='h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500'>
                                  {user.name?.[0] || user.email[0]}
                                </div>
                              )}
                              <div>
                                <div className='font-medium flex items-center gap-2'>
                                  <span>{user.name || 'Khách'}</span>
                                  {isCurrentUser && (
                                    <Badge variant='outline' className='text-xs'>
                                      Bạn
                                    </Badge>
                                  )}
                                </div>
                                <p className='text-xs text-muted-foreground'>{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={config.color} variant='outline'>
                              <RoleIcon className='h-3 w-3 mr-1' />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm'>{user._count.orders}</span>
                          </TableCell>
                          <TableCell>
                            <span className='font-medium'>{formatCurrency(user.totalSpent)}</span>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm'>
                              {new Date(user.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setDetailOpen(true)
                                  }}
                                >
                                  <Eye className='h-4 w-4 mr-2' />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.role === Role.USER ? (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRole(user.id, Role.ADMIN)}
                                  >
                                    <Shield className='h-4 w-4 mr-2' />
                                    Make Admin
                                  </DropdownMenuItem>
                                ) : (
                                  !isCurrentUser && (
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateRole(user.id, Role.USER)}
                                    >
                                      <ShieldOff className='h-4 w-4 mr-2' />
                                      Remove Admin
                                    </DropdownMenuItem>
                                  )
                                )}
                                {!isCurrentUser && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteUserId(user.id)}
                                      className='text-red-600'
                                    >
                                      <UserX className='h-4 w-4 mr-2' />
                                      Delete User
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-4 py-3 border-t'>
                <p className='text-sm text-muted-foreground'>
                  Page {page} of {totalPages} ({total} users)
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
