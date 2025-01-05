'use client'

import { useState, useTransition, useEffect } from "react"
import { createTransactionType, updateTransactionType } from "@/app/actions/transaction-type"
import { TransactionType } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"

interface TransactionTypeFormProps {
  onTransactionTypeCreatedOrUpdated: () => void
  transactionTypeToEdit?: TransactionType | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function TransactionTypeForm({ onTransactionTypeCreatedOrUpdated, transactionTypeToEdit, isOpen, setIsOpen }: TransactionTypeFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    type: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (transactionTypeToEdit) {
        setFormData({
          type: transactionTypeToEdit.type
        })
      } else {
        setFormData({
          type: ''
        })
      }
    }
  }, [isOpen, transactionTypeToEdit])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      if (transactionTypeToEdit) {
        await updateTransactionType(transactionTypeToEdit.id, {
          type: formData.type
        })
      } else {
        await createTransactionType({
          type: formData.type
        })
      }
      onTransactionTypeCreatedOrUpdated()
      setIsOpen(false)
      setFormData({
        type: ''
      })
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transactionTypeToEdit ? 'Edit Transaction Type' : 'Create Transaction Type'}</DialogTitle>
          <DialogDescription>
            {transactionTypeToEdit ? 'Update the transaction type details below.' : 'Fill in the details below to add a new transaction type.'}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input 
            name="type" 
            value={formData.type} 
            onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
            placeholder="Transaction Type" 
            required 
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? (transactionTypeToEdit ? 'Updating...' : 'Creating...') : (transactionTypeToEdit ? 'Update Type' : 'Create Type')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 