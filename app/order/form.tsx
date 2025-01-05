'use client'

import { useState, useTransition, useEffect } from "react"
import { createOrder, updateOrder } from "@/app/actions/order"
import { getProducts } from "@/app/actions/product"
import { Order, OrderItem } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash } from "lucide-react"

interface Product {
    id: number
    name: string
    sku: string
    price: number
}

interface OrderFormProps {
    onOrderCreatedOrUpdated: () => void
    orderToEdit?: Order | null
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function OrderForm({ onOrderCreatedOrUpdated, orderToEdit, isOpen, setIsOpen }: OrderFormProps) {
    const [isPending, startTransition] = useTransition()
    const [products, setProducts] = useState<Product[]>([])
    const [formData, setFormData] = useState({
        customerName: '',
        orderItems: [] as Array<{
            productId: string
            quantity: string
            price: string
        }>
    })

    useEffect(() => {
        if (isOpen) {
            getProducts().then((data) => setProducts(data))
        } else {
            setFormData({
                customerName: '',
                orderItems: [] as Array<{
                    productId: string
                    quantity: string
                    price: string
                }>
            })
        }
    }, [isOpen])

    useEffect(() => {
        if (orderToEdit) {
            setFormData({
                customerName: orderToEdit.customerName,
                orderItems: orderToEdit.orderItems.map(item => ({
                    productId: item.productId.toString(),
                    quantity: item.quantity.toString(),
                    price: item.price.toString()
                }))
            })
        }
    }, [orderToEdit])

    const addOrderItem = () => {
        setFormData({
            ...formData,
            orderItems: [...formData.orderItems, { productId: '', quantity: '', price: '' }]
        })
    }

    const removeOrderItem = (index: number) => {
        const newItems = [...formData.orderItems]
        newItems.splice(index, 1)
        setFormData({ ...formData, orderItems: newItems })
    }

    const updateOrderItem = (index: number, field: string, value: string) => {
        const newItems = [...formData.orderItems]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === 'productId') {
            const product = products.find(p => p.id.toString() === value)
            if (product) {
                newItems[index].price = product.price.toString()
            }
        }

        setFormData({ ...formData, orderItems: newItems })
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        startTransition(async () => {
            const orderItems = formData.orderItems.map(item => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                price: Number(item.price)
            }))

            if (orderToEdit) {
                await updateOrder(orderToEdit.id, {
                    customerName: formData.customerName,
                    orderItems
                })
            } else {
                await createOrder({
                    customerName: formData.customerName,
                    orderItems
                })
            }
            onOrderCreatedOrUpdated()
            setIsOpen(false)
            setFormData({
                customerName: '',
                orderItems: []
            })
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{orderToEdit ? 'Edit Order' : 'Create Order'}</DialogTitle>
                    <DialogDescription>
                        {orderToEdit ? 'Update the order details below.' : 'Fill in the details below to add a new order.'}
                    </DialogDescription>
                    <DialogClose />
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Input
                        name="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Customer Name"
                        required
                    />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Order Items</h3>
                            <Button type="button" variant="outline" onClick={addOrderItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        {formData.orderItems.map((item, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <Select
                                    value={item.productId}
                                    onValueChange={(value: string) => updateOrderItem(index, 'productId', value)}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                {product.name} ({product.sku})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    placeholder="Quantity"
                                    value={item.quantity}
                                    onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                                    required
                                />
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => updateOrderItem(index, 'price', e.target.value)}
                                    required
                                />
                                <Button type="button" variant="ghost" onClick={() => removeOrderItem(index)}>
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button type="submit" disabled={isPending}>
                        {isPending ? (orderToEdit ? 'Updating...' : 'Creating...') : (orderToEdit ? 'Update Order' : 'Create Order')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
} 