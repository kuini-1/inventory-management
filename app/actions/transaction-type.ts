'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getTransactionTypes() {
    await verifyAuth()
    return await prisma.inventoryTransactionType.findMany()
}

export async function getTransactionType(id: number) {
    await verifyAuth()
    return await prisma.inventoryTransactionType.findUnique({
        where: { id }
    })
}

export async function createTransactionType(data: {
    type: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.inventoryTransactionType.create({ data })
        }
    } catch (error) {
        throw new Error(`Failed to create transaction type: ${error}`)
    }
}

export async function updateTransactionType(id: number, data: {
    type: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.inventoryTransactionType.update({
                where: { id },
                data
            })
        }
    } catch (error) {
        throw new Error(`Failed to update transaction type: ${error}`)
    }
}

export async function deleteTransactionType(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.inventoryTransactionType.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete transaction type: ${error}`)
    }
} 