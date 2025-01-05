'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getSuppliers() {
    await verifyAuth()
    return await prisma.supplier.findMany()
}

export async function getSupplier(id: number) {
    await verifyAuth()
    return await prisma.supplier.findUnique({
        where: { id }
    })
}

export async function createSupplier(data: {
    name: string
    contact?: string
    email?: string
    phone?: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.supplier.create({ data })
        }
    } catch (error) {
        throw new Error(`Failed to create supplier: ${error}`)
    }
}

export async function updateSupplier(id: number, data: {
    name?: string
    contact?: string
    email?: string
    phone?: string
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.supplier.update({
                where: { id },
                data
            })
        }
    } catch (error) {
        throw new Error(`Failed to update supplier: ${error}`)
    }
}

export async function deleteSupplier(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.supplier.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete supplier: ${error}`)
    }
} 