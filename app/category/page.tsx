'use client'

import { useEffect, useState, useTransition } from "react"
import { getCategories, deleteCategory } from "@/app/actions/category"
import { CategoryForm } from "./form"
import { Category } from "./types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isPending, startTransition] = useTransition()
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const fetchCategories = async () => {
    const data = await getCategories()
    setCategories(data as Category[])
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      await deleteCategory(id)
      setCategories(categories.filter(category => category.id !== id))
    })
  }

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-4xl font-bold mb-4">Category Management</h1>
      <Button className="mb-4" onClick={() => { setEditCategory(null); setIsFormOpen(true); }}>
        <Plus className="mr-2" />
        Create Category
      </Button>
      <CategoryForm 
        onCategoryCreatedOrUpdated={fetchCategories} 
        categoryToEdit={editCategory} 
        isOpen={isFormOpen} 
        setIsOpen={setIsFormOpen} 
      />
      <DataTable 
        data={categories} 
        columns={[
          { accessorKey: 'name', header: 'Name' },
          { accessorKey: 'description', header: 'Description' },
          { 
            accessorKey: 'actions', 
            header: '', 
            cell: ({ row }) => (
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => { setEditCategory(row.original); setIsFormOpen(true); }}>
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