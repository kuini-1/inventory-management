'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getTransactions() {
    await verifyAuth()
    return await prisma.inventoryTransaction.findMany({
        include: {
            product: true,
            type: true
        }
    })
}

export async function getTransaction(id: number) {
    await verifyAuth()
    return await prisma.inventoryTransaction.findUnique({
        where: { id },
        include: {
            product: true
        }
    })
}

export async function createTransaction(data: {
    productId: number
    quantity: number
    type: number
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.inventoryTransaction.create({
                data: {
                    quantity: data.quantity,
                    typeId: data.type,
                    productId: data.productId
                }
            })
        }
    } catch (error) {
        throw new Error(`Failed to create transaction: ${error}`)
    }
}

export async function updateTransaction(id: number, data: {
    productId: number
    quantity: number
    type: number
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.inventoryTransaction.update({
                where: { id },
                data: {
                    quantity: data.quantity,
                    typeId: data.type
                }
            })
        }
    } catch (error) {
        throw new Error(`Failed to update transaction: ${error}`)
    }
}

export async function deleteTransaction(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.inventoryTransaction.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete transaction: ${error}`)
    }
}

export async function getInventoryTransactions() {
    await verifyAuth()
    return await prisma.inventoryTransaction.findMany({
        include: {
            product: true,
            type: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
} 