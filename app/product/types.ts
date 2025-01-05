export type Category = {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type Supplier = {
    id: number;
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  
  export type InventoryTransaction = {
    id: number;
    productId: number;
    quantity: number;
    typeId: number;
    createdAt: Date;
  };
  
  export type OrderItem = {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
  };
  
  export type Product = {
    id: number;                
    name: string;
    sku: string;                
    description?: string;
    price: number;                  
    categoryId: number;
    supplierId?: number;
    category: Category;
    supplier?: Supplier;
    transactions: InventoryTransaction[];
    OrderItem: OrderItem[];
  }