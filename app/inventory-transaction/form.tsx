'use client'

import { useState, useTransition, useEffect } from "react"
import { createTransaction, updateTransaction } from "@/app/actions/inventory-transaction"
import { InventoryTransaction } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getProducts } from "@/app/actions/product"
import { getTransactionTypes } from "@/app/actions/transaction-type"

interface TransactionFormProps {
    onTransactionCreatedOrUpdated: () => void
    transactionToEdit?: InventoryTransaction | null
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function TransactionForm({ onTransactionCreatedOrUpdated, transactionToEdit, isOpen, setIsOpen }: TransactionFormProps) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        type: ''
    })
    const [products, setProducts] = useState<Array<{ id: number; name: string }>>([])
    const [transactionTypes, setTransactionTypes] = useState<Array<{ id: number; type: string }>>([])

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                getProducts(),
                getTransactionTypes()
            ]).then(([productsData, typesData]) => {
                setProducts(productsData)
                setTransactionTypes(typesData)
            })

            if (transactionToEdit) {
                setFormData({
                    productId: transactionToEdit.productId.toString(),
                    quantity: transactionToEdit.quantity.toString(),
                    type: transactionToEdit.typeId.toString()
                })
            } else {
                setFormData({
                    productId: '',
                    quantity: '',
                    type: ''
                })
            }
        }
    }, [isOpen, transactionToEdit])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        startTransition(async () => {
            if (transactionToEdit) {
                await updateTransaction(transactionToEdit.id, {
                    productId: Number(formData.productId),
                    quantity: Number(formData.quantity),
                    type: Number(formData.type)
                })
            } else {
                await createTransaction({
                    productId: Number(formData.productId),
                    quantity: Number(formData.quantity),
                    type: Number(formData.type)
                })
            }
            onTransactionCreatedOrUpdated()
            setIsOpen(false)
            setFormData({
                productId: '',
                quantity: '',
                type: ''
            })
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{transactionToEdit ? 'Edit Transaction' : 'Create Transaction'}</DialogTitle>
                    <DialogDescription>
                        {transactionToEdit ? 'Update the transaction details below.' : 'Fill in the details below to add a new transaction.'}
                    </DialogDescription>
                    <DialogClose />
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Select
                        value={formData.productId}
                        onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                            {products?.map(product => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="Quantity"
                        required
                    />
                    <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Transaction Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {transactionTypes?.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? (transactionToEdit ? 'Updating...' : 'Creating...') : (transactionToEdit ? 'Update Transaction' : 'Create Transaction')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
} 