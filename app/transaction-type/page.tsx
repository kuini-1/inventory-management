'use client'

import { useEffect, useState, useTransition } from "react"
import { getTransactionTypes, deleteTransactionType } from "@/app/actions/transaction-type"
import { TransactionTypeForm } from "./form"
import { TransactionType } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"

export default function TransactionTypePage() {
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([])
  const [isPending, startTransition] = useTransition()
  const [editTransactionType, setEditTransactionType] = useState<TransactionType | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchTransactionTypes = async () => {
    const data = await getTransactionTypes()
    setTransactionTypes(data as TransactionType[])
  }

  useEffect(() => {
    fetchTransactionTypes()
  }, [])

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      await deleteTransactionType(id)
      setTransactionTypes(transactionTypes.filter(type => type.id !== id))
    })
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Transaction Types</h1>
      <Button className="mb-4" onClick={() => { setEditTransactionType(null); setIsFormOpen(true); }}>
        <Plus />
        Create Transaction Type
      </Button>
      <TransactionTypeForm 
        onTransactionTypeCreatedOrUpdated={fetchTransactionTypes} 
        transactionTypeToEdit={editTransactionType} 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
      />
      <DataTable 
        data={transactionTypes} 
        columns={[
          { accessorKey: 'type', header: 'Type' },
          { 
            accessorKey: 'actions', 
            header: '', 
            cell: ({ row }) => (
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => { setEditTransactionType(row.original); setIsFormOpen(true); }}>
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