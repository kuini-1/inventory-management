'use client'

import { useEffect, useState, useTransition } from "react"
import { getTransactions, deleteTransaction } from "@/app/actions/inventory-transaction"
import { TransactionForm } from "./form"
import { InventoryTransaction } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [isPending, startTransition] = useTransition()
  const [editTransaction, setEditTransaction] = useState<InventoryTransaction | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchTransactions = async () => {
    const data = await getTransactions()
    setTransactions(data as InventoryTransaction[])
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      await deleteTransaction(id)
      setTransactions(transactions.filter(transaction => transaction.id !== id))
    })
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Inventory Transactions</h1>
      <Button className="mb-4" onClick={() => { setEditTransaction(null); setIsFormOpen(true); }}>
        <Plus />
        Create Transaction
      </Button>
      <TransactionForm 
        onTransactionCreatedOrUpdated={fetchTransactions} 
        transactionToEdit={editTransaction} 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
      />
      <DataTable 
        data={transactions} 
        columns={[
          { accessorKey: 'product.name', header: 'Product' },
          { accessorKey: 'quantity', header: 'Quantity' },
          { accessorKey: 'type.type', header: 'Type' },
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
                <Button variant="ghost" onClick={() => { setEditTransaction(row.original); setIsFormOpen(true); }}>
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