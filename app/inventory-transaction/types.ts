export type InventoryTransaction = {
  id: number
  productId: number
  quantity: number
  typeId: number
  createdAt: Date
  product: {
    id: number
    name: string
    sku: string
  }
} 