'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getOrders() {
    await verifyAuth()
    return await prisma.order.findMany({
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    })
}

export async function getOrder(id: number) {
    await verifyAuth()
    return await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    })
}

export async function createOrder(data: {
    customerName: string
    orderItems: {
        productId: number
        quantity: number
        price: number
    }[]
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.order.create({
                data: {
                    customerName: data.customerName,
                    orderItems: {
                        create: data.orderItems
                    }
                },
                include: {
                    orderItems: true
                }
            })
        }
    } catch (error) {
        throw new Error(`Failed to create order: ${error}`)
    }
}

export async function updateOrder(id: number, data: {
    customerName?: string
    orderItems?: Array<{
        productId: number
        quantity: number
        price: number
    }>
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            await prisma.orderItem.deleteMany({
                where: { orderId: id }
            })
            
            return await prisma.order.update({
                where: { id },
                data: {
                    customerName: data.customerName,
                    orderItems: data.orderItems ? {
                        create: data.orderItems
                    } : undefined
                }
            })
        }
    } catch (error) {
        throw new Error(`Failed to update order: ${error}`)
    }
}

export async function deleteOrder(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            await prisma.orderItem.deleteMany({
                where: { orderId: id }
            })
            return await prisma.order.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete order: ${error}`)
    }
} 