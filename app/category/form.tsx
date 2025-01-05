'use client'

import { useState, useTransition, useEffect } from "react"
import { createCategory, updateCategory } from "@/app/actions/category"
import { Category } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"

interface CategoryFormProps {
  onCategoryCreatedOrUpdated: () => void
  categoryToEdit?: Category | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function CategoryForm({ onCategoryCreatedOrUpdated, categoryToEdit, isOpen, setIsOpen }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name,
          description: categoryToEdit.description || ''
        })
      } else {
        setFormData({
          name: '',
          description: ''
        })
      }
    }
  }, [isOpen, categoryToEdit])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, {
          name: formData.name,
          description: formData.description || undefined
        })
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description || undefined
        })
      }
      onCategoryCreatedOrUpdated()
      setIsOpen(false)
      setFormData({
        name: '',
        description: ''
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {categoryToEdit ? 'Update the category details below.' : 'Fill in the details below to add a new category.'}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            name="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Category Name" 
            required 
          />
          <Input 
            name="description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Description" 
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (categoryToEdit ? 'Updating...' : 'Creating...') : (categoryToEdit ? 'Update Category' : 'Create Category')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 