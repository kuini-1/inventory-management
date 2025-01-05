'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getProducts } from "@/app/actions/product"
import { getOrders } from "@/app/actions/order"
import { getInventoryTransactions } from "@/app/actions/inventory-transaction"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton"

interface Order {
  id: number
  customerName: string
  orderDate: Date
  orderItems: Array<{
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
}

interface Transaction {
  quantity: number
  createdAt: Date
  product: {
    name: string
  }
}

function formatThaiDate(date: Date) {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<{
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    totalInventory: number
    recentOrders: Order[]
    inventoryMovement: Transaction[]
  }>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalInventory: 0,
    recentOrders: [],
    inventoryMovement: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, orders, transactions] = await Promise.all([
          getProducts(),
          getOrders(),
          getInventoryTransactions()
        ])

        const totalRevenue = orders.reduce((sum: number, order: Order) => 
          sum + order.orderItems.reduce((itemSum: number, item) => 
            itemSum + (item.quantity * item.price), 0), 0
        )

        const totalInventory = transactions.reduce((sum: number, transaction: { quantity: number }) => 
          sum + transaction.quantity, 0
        )

        setMetrics({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          totalInventory,
          recentOrders: orders.slice(-5),
          inventoryMovement: transactions.slice(-10)
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalInventory}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.recentOrders.map((order: Order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {formatThaiDate(order.orderDate)}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${order.orderItems.reduce((sum: number, item: { quantity: number, price: number }) => 
                      sum + (item.quantity * item.price), 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Movement</CardTitle>
            <CardDescription>Recent inventory changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.inventoryMovement}>
                  <defs>
                    <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="stroke-muted" 
                  />
                  <XAxis 
                    dataKey="createdAt" 
                    tickFormatter={formatThaiDate}
                    className="text-sm text-muted-foreground" 
                  />
                  <YAxis 
                    className="text-sm text-muted-foreground"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Date
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {formatThaiDate(payload[0].payload.createdAt)}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Quantity
                                </span>
                                <span className="font-bold">
                                  {payload[0].value}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill="url(#colorQuantity)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 