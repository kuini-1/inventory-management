'use client'

import { useState, useTransition, useEffect } from "react"
import { createProduct, updateProduct } from "@/app/actions/product"
import { getCategories } from "@/app/actions/category"
import { getSuppliers } from "@/app/actions/supplier"
import { Product } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFormProps {
  onProductCreatedOrUpdated: () => void
  productToEdit?: Product | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ProductForm({ onProductCreatedOrUpdated, productToEdit, isOpen, setIsOpen }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    categoryId: '',
    supplierId: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getCategories(),
        getSuppliers()
      ]).then(([categoriesData, suppliersData]) => {
        setCategories(categoriesData)
        setSuppliers(suppliersData)
      })

      if (productToEdit) {
        setFormData({
          name: productToEdit.name,
          sku: productToEdit.sku,
          price: productToEdit.price.toString(),
          categoryId: productToEdit.categoryId.toString(),
          supplierId: productToEdit.supplierId?.toString() ?? '',
          description: productToEdit.description || ''
        })
      } else {
        setFormData({
          name: '',
          sku: '',
          price: '',
          categoryId: '',
          supplierId: '',
          description: ''
        })
      }
    }
  }, [isOpen, productToEdit])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      if (productToEdit) {
        await updateProduct(productToEdit.id, {
          name: formData.name,
          sku: formData.sku,
          price: Number(formData.price),
          categoryId: Number(formData.categoryId),
          supplierId: formData.supplierId ? Number(formData.supplierId) : undefined,
          description: formData.description,
        })
      } else {
        await createProduct({
          name: formData.name,
          sku: formData.sku,
          price: Number(formData.price),
          categoryId: Number(formData.categoryId),
          supplierId: formData.supplierId ? Number(formData.supplierId) : undefined,
          description: formData.description,
        })
      }
      onProductCreatedOrUpdated()
      setIsOpen(false)
      setFormData({
        name: '',
        sku: '',
        price: '',
        categoryId: '',
        supplierId: '',
        description: ''
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Edit Product' : 'Create Product'}</DialogTitle>
          <DialogDescription>
            {productToEdit ? 'Update the product details below.' : 'Fill in the details below to add a new product.'}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            name="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Product Name" 
            required 
          />
          <Input 
            name="sku" 
            value={formData.sku} 
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
            placeholder="SKU" 
            required 
          />
          <Input 
            name="price" 
            type="number" 
            value={formData.price} 
            onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
            placeholder="Price" 
            required 
          />
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={formData.supplierId}
            onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input 
            name="description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Description" 
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (productToEdit ? 'Updating...' : 'Creating...') : (productToEdit ? 'Update Product' : 'Create Product')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}