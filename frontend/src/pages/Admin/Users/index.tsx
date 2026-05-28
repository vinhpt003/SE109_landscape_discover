import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AdminSideNav from '../../../components/layouts/AdminSideNav'
import AdminTopBar from '../../../components/layouts/AdminTopBar'
import { usersService } from '../../../services/users.service'
import type { User, Role } from '../../../types'

const ROLE_STYLE: Record<Role, string> = {
  Admin:           'bg-error-container text-on-error-container',
  Editor:          'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  RegisteredUser:  'bg-surface-variant text-on-surface-variant',
}

const ROLE_LABEL: Record<Role, string> = {
  Admin:           'Admin',
  Editor:          'Editor',
  RegisteredUser:  'Thành viên',
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${ROLE_STYLE[role]}`}>
      {ROLE_LABEL[role]}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const LIMIT = 20

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => usersService.fetchAll({ page, limit: LIMIT }),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'RegisteredUser' | 'Editor' }) =>
      usersService.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const allUsers = usersResponse?.data ?? []
  const total = usersResponse?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)

  const filtered = allUsers.filter(u => {
    const matchSearch = !search || u.userName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  const handleRoleChange = (user: User, newRole: 'RegisteredUser' | 'Editor') => {
    if (user.role === 'Admin') return
    if (!window.confirm(`Đổi quyền của "${user.userName}" thành ${ROLE_LABEL[newRole]}?`)) return
    updateRoleMutation.mutate({ userId: user.userId, role: newRole })
  }

  return (
    <div className="bg-surface min-h-screen flex">
      <AdminSideNav />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminTopBar />

        <main className="flex-1 pt-24 px-margin-desktop pb-margin-desktop bg-background overflow-y-auto">
          <div className="max-w-container-max mx-auto">

            {/* Page header */}
            <div className="mb-8">
              <h1 className="font-display text-headline-lg text-on-surface">Quản lý người dùng</h1>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">
                Xem danh sách và nâng/hạ quyền thành viên.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {(['Admin', 'Editor', 'RegisteredUser'] as Role[]).map(role => (
                <div key={role} className="bg-surface-bright rounded-xl border border-outline-variant p-4 text-center">
                  <p className="font-display text-headline-md text-on-surface">
                    {allUsers.filter(u => u.role === role).length}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">{ROLE_LABEL[role]}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-surface-bright p-4 rounded-xl border border-outline-variant mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:border-secondary focus:outline-none transition-all"
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as Role | '')}
                className="bg-surface-container-low border border-outline-variant rounded-lg py-2.5 px-4 text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
              >
                <option value="">Tất cả role</option>
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="RegisteredUser">Thành viên</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-surface-bright rounded-xl border border-outline-variant overflow-hidden card-shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead className="bg-surface-container border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                    <tr>
                      <th className="py-4 px-6">Avatar</th>
                      <th className="py-4 px-6">Tên đăng nhập</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Ngày tạo</th>
                      <th className="py-4 px-6 text-right">Đổi quyền</th>
                    </tr>
                  </thead>

                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-variant">
                    {isLoading && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <div className="w-8 h-8 rounded-full border-4 border-primary-fixed border-t-primary animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}

                    {!isLoading && filtered.map(user => (
                      <tr key={user.userId} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-4 px-6">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0">
                            {user.avatar
                              ? <img src={user.avatar} alt={user.userName} className="w-full h-full object-cover" />
                              : <span className="text-on-primary font-bold uppercase text-sm">{user.userName[0]}</span>
                            }
                          </div>
                        </td>
                        <td className="py-4 px-6 font-label-md text-label-md">{user.userName}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{user.email}</td>
                        <td className="py-4 px-6"><RoleBadge role={user.role} /></td>
                        <td className="py-4 px-6 text-on-surface-variant">
                          {user.createdAt ? formatDate(user.createdAt) : '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {user.role === 'Admin' ? (
                            <span className="text-outline font-caption text-caption italic">Không thể đổi</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRoleChange(user, 'Editor')}
                                disabled={user.role === 'Editor' || updateRoleMutation.isPending}
                                className="px-3 py-1.5 rounded-lg font-label-md text-label-md border border-tertiary text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Editor
                              </button>
                              <button
                                onClick={() => handleRoleChange(user, 'RegisteredUser')}
                                disabled={user.role === 'RegisteredUser' || updateRoleMutation.isPending}
                                className="px-3 py-1.5 rounded-lg font-label-md text-label-md border border-outline text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Thành viên
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {!isLoading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-on-surface-variant font-body-md text-body-md">
                          <span className="material-symbols-outlined text-[48px] block mb-3 opacity-40">person_off</span>
                          Không tìm thấy người dùng nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-surface-bright border-t border-outline-variant py-3 px-6 flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Tổng {total} người dùng
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="font-label-md text-label-md text-on-surface px-2">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
