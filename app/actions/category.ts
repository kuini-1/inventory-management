'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getCategories() {
    await verifyAuth()
    return await prisma.category.findMany({
        include: {
            products: true
        }
    })
}

export async function getCategory(id: number) {
    await verifyAuth()
    return await prisma.category.findUnique({
        where: { id },
        include: {
            products: true
        }
    })
}

export async function createCategory(data: {
    name: string
    description?: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.category.create({ data })
        }
    } catch (error) {
        throw new Error(`Failed to create category: ${error}`)
    }
}

export async function updateCategory(id: number, data: {
    name?: string
    description?: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.category.update({
                where: { id },
                data
            })
        }
    } catch (error) {
        throw new Error(`Failed to update category: ${error}`)
    }
}

export async function deleteCategory(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.category.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete category: ${error}`)
    }
} 