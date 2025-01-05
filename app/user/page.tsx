'use client'

import { useEffect, useState, useTransition } from "react"
import { getUsers, deleteUser } from "@/app/actions/user"
import { UserForm } from "./form"
import { User } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

export default function UserPage() {
    const [users, setUsers] = useState<User[]>([])
    const [, startTransition] = useTransition()
    const [editUser, setEditUser] = useState<User | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchUsers = async () => {
        const data = await getUsers()
        setUsers(data as User[])
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchUsers()
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return <TableSkeleton />
    }

    const handleDelete = async (id: number) => {
        startTransition(async () => {
            await deleteUser(id)
            setUsers(users.filter(user => user.id !== id))
        })
    }

    return (
        <div className="container mx-auto p-10">
            <h1 className="text-4xl font-bold mb-4">User Management</h1>
            <Button className="mb-4" onClick={() => { setEditUser(null); setIsFormOpen(true); }}>
                <Plus />
                Create User
            </Button>
            <UserForm
                onUserCreatedOrUpdated={fetchUsers}
                userToEdit={editUser}
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
            />
            <DataTable
                data={users}
                columns={[
                    { accessorKey: 'username', header: 'Username' },
                    { accessorKey: 'role.name', header: 'Role' },
                    {
                        accessorKey: 'createdAt',
                        header: 'Created At',
                        cell: ({ row }) => (
                            <span>
                                {new Date(row.original.createdAt).toLocaleDateString('th-TH', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                        )
                    },
                    {
                        accessorKey: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <div className="flex justify-end space-x-2">
                                <Button variant="ghost" onClick={() => { setEditUser(row.original); setIsFormOpen(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" onClick={() => handleDelete(row.original.id)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        )
                    }
                ]}
            />
        </div>
    )
} 