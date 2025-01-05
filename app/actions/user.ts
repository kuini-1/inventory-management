'use server'

import { PrismaClient } from '@prisma/client'
import { hasPermission, verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getUsers() {
    await verifyAuth()
    const data = await prisma.user.findMany({
        include: {
            role: true
        }
    })
    return data
}

export async function getUser(id: number) {
    await verifyAuth()
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true
        }
    })
}

export async function updateUser(id: number, data: {
    username?: string
    roleId?: number
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.user.update({
                where: { id },
                data
            })
        }
    } catch (error) {
        throw new Error(`Failed to update user: ${error}`)
    }
}

export async function deleteUser(id: number) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.user.delete({
                where: { id }
            })
        }
    } catch (error) {
        throw new Error(`Failed to delete user: ${error}`)
    }
}

export async function createUser(data: {
    username: string
    password: string
    roleId: number
}) {
    try {
        const permission = await hasPermission('admin')
        if (permission) {
            return await prisma.user.create({ data })
        }
    } catch (error) {
        throw new Error(`Failed to create user: ${error}`)
    }
} 