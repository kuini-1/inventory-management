'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getProducts() {
    await verifyAuth()
    return await prisma.product.findMany({
        include: {
            category: true,
            supplier: true,
            transactions: true,
            OrderItem: true
        }
    })
}

export async function getProduct(id: number) {
    await verifyAuth()
    return await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            supplier: true,
            transactions: true,
            OrderItem: true
        }
    })
}

export async function createProduct(data: {
    name: string
    sku: string
    price: number
    categoryId: number
    supplierId?: number
    description?: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            const existingProduct = await prisma.product.findUnique({
                where: { sku: data.sku }
            })

            if (existingProduct) {
                throw new Error(`Product with SKU ${data.sku} already exists`)
            }

            return await prisma.product.create({ data })
        }
    } catch (error) {
        throw new Error(`Failed to create product: ${error}`)
    }
}

export async function updateProduct(id: number, data: {
    name?: string
    sku?: string
    price?: number
    categoryId?: number
    supplierId?: number
    description?: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.product.update({
                where: { id },
                data
            })
        }
    } catch (error) {
        throw new Error(`Failed to update product: ${error}`)
    }
}

export async function deleteProduct(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.product.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete product: ${error}`)
    }
} 