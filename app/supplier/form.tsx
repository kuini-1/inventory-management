'use client'

import { useState, useTransition, useEffect } from "react"
import { createSupplier, updateSupplier } from "@/app/actions/supplier"
import { Supplier } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"

interface SupplierFormProps {
  onSupplierCreatedOrUpdated: () => void
  supplierToEdit?: Supplier | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function SupplierForm({ onSupplierCreatedOrUpdated, supplierToEdit, isOpen, setIsOpen }: SupplierFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setFormData({
          name: supplierToEdit.name,
          contact: supplierToEdit.contact || '',
          email: supplierToEdit.email || '',
          phone: supplierToEdit.phone || ''
        })
      } else {
        setFormData({
          name: '',
          contact: '',
          email: '',
          phone: ''
        })
      }
    }
  }, [isOpen, supplierToEdit])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      if (supplierToEdit) {
        await updateSupplier(supplierToEdit.id, {
          name: formData.name,
          contact: formData.contact || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined
        })
      } else {
        await createSupplier({
          name: formData.name,
          contact: formData.contact || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined
        })
      }
      onSupplierCreatedOrUpdated()
      setIsOpen(false)
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: ''
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplierToEdit ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
          <DialogDescription>
            {supplierToEdit ? 'Update the supplier details below.' : 'Fill in the details below to add a new supplier.'}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            name="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Supplier Name" 
            required 
          />
          <Input 
            name="contact" 
            value={formData.contact} 
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })} 
            placeholder="Contact Person" 
          />
          <Input 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            placeholder="Email" 
          />
          <Input 
            name="phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            placeholder="Phone" 
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (supplierToEdit ? 'Updating...' : 'Creating...') : (supplierToEdit ? 'Update Supplier' : 'Create Supplier')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 