export type OrderItem = {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  product: {
    id: number
    name: string
    sku: string
  }
}

export type Order = {
  id: number
  customerName: string
  orderDate: Date
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItem[]
} 