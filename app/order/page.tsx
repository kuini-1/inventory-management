'use client'

import { useEffect, useState, useTransition } from "react"
import { getOrders, deleteOrder } from "@/app/actions/order"
import { OrderForm } from "./form"
import { Order } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isPending, startTransition] = useTransition()
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchOrders = async () => {
    const data = await getOrders()
    setOrders(data as Order[])
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      await deleteOrder(id)
      if (!isPending) {
        setOrders(orders.filter(order => order.id !== id))
      }
    })
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Orders</h1>
      <Button className="mb-4" onClick={() => { setEditOrder(null); setIsFormOpen(true); }}>
        <Plus />
        Create Order
      </Button>
      <OrderForm 
        onOrderCreatedOrUpdated={fetchOrders} 
        orderToEdit={editOrder} 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
      />
      <DataTable 
        data={orders} 
        columns={[
          { accessorKey: 'customerName', header: 'Customer' },
          { 
            accessorKey: 'orderDate', 
            header: 'Order Date',
            cell: ({ row }) => (
              <span>
                {new Date(row.original.orderDate).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            )
          },
          { 
            accessorKey: 'orderItems', 
            header: 'Items', 
            cell: ({ row }) => (
              <span>{row.original.orderItems.length} items</span>
            )
          },
          { 
            id: 'totalAmount',
            header: 'Total Amount',
            cell: ({ row }) => {
              const total = row.original.orderItems.reduce(
                (sum: number, item: { quantity: number, price: number }) => 
                  sum + (item.quantity * item.price), 
                0
              )
              return <span>${total.toFixed(2)}</span>
            }
          },
          { 
            accessorKey: 'actions', 
            header: '', 
            cell: ({ row }) => (
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => { setEditOrder(row.original); setIsFormOpen(true); }}>
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