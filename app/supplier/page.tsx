'use client'

import { useEffect, useState, useTransition } from "react"
import { getSuppliers, deleteSupplier } from "@/app/actions/supplier"
import { SupplierForm } from "./form"
import { Supplier } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

export default function SupplierPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [, startTransition] = useTransition()
    const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const fetchSuppliers = async () => {
        const data = await getSuppliers()
        setSuppliers(data as Supplier[])
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchSuppliers()
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
            await deleteSupplier(id)
            setSuppliers(suppliers.filter(supplier => supplier.id !== id))
        })
    }

    return (
        <div className="container mx-auto p-10">
            <h1 className="text-4xl font-bold mb-4">Supplier Management</h1>
            <Button className="mb-4" onClick={() => { setEditSupplier(null); setIsFormOpen(true); }}>
                <Plus />
                Create Supplier
            </Button>
            <SupplierForm
                onSupplierCreatedOrUpdated={fetchSuppliers}
                supplierToEdit={editSupplier}
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
            />
            <DataTable
                data={suppliers}
                columns={[
                    { accessorKey: 'name', header: 'Name' },
                    { accessorKey: 'contact', header: 'Contact' },
                    { accessorKey: 'email', header: 'Email' },
                    { accessorKey: 'phone', header: 'Phone' },
                    {
                        accessorKey: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <div className="flex justify-end space-x-2">
                                <Button variant="ghost" onClick={() => { setEditSupplier(row.original); setIsFormOpen(true); }}>
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