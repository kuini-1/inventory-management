'use client'

import { useEffect, useState, useTransition } from "react"
import { getProducts, deleteProduct } from "@/app/actions/product"
import { ProductForm } from "./form"
import { Product } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isPending, startTransition] = useTransition()
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchProducts = async () => {
    const data = await getProducts()
    setProducts(data as Product[])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      await deleteProduct(id)
      if (!isPending) {
        setProducts(products.filter(product => product.id !== id))
      }
    })
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Product Management</h1>
      <Button className="mb-4" onClick={() => { setEditProduct(null); setIsFormOpen(true); }}>
        <Plus />
        Create Product
      </Button>
      <ProductForm onProductCreatedOrUpdated={fetchProducts} productToEdit={editProduct} isOpen={isFormOpen} setIsOpen={setIsFormOpen} />
      <DataTable data={products} columns={[
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'sku', header: 'SKU' },
        { accessorKey: 'price', header: 'Price' },
        { accessorKey: 'category.name', header: 'Category' },
        { accessorKey: 'supplier.name', header: 'Supplier' },
        { accessorKey: 'actions', header: '', cell: ({ row }) => (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => { setEditProduct(row.original); setIsFormOpen(true); }}>
              <Edit />
            </Button>
            <Button variant="ghost" onClick={() => handleDelete(row.original.id)}>
              <Trash />
            </Button>
          </div>
        )}
      ]} />
    </div>
  )
}