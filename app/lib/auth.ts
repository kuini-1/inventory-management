'use server'

import { cookies, headers as getHeaders } from 'next/headers'
import { jwtVerify } from 'jose'
import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'

function getPrismaClient() {
    return new PrismaClient()
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '')

export interface AuthUser {
    id: number
    username: string
    role: string
}

export async function verifyAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    const requestHeaders = await getHeaders()
    const referer = requestHeaders.get("referer") || ""
    const isAuthPage = referer.includes('/login') || referer.includes('/register')

    if (!token && !isAuthPage) {
        redirect('/login')
    }

    if (isAuthPage && token) {
        redirect('/')
    }

    if (!token) {
        return null
    }

    try {
        const { payload } = await jwtVerify(token, SECRET)

        const exp = payload.exp
        if (!exp || Date.now() >= exp * 1000) {
            cookieStore.delete('token')
            redirect('/login')
        }

        if (typeof payload.id !== 'number' || typeof payload.username !== 'string') {
            cookieStore.delete('token')
            redirect('/login')
        }

        return { id: payload.id, username: payload.username, role: payload.role } as AuthUser
    } catch (error) {
        console.error(error)
        cookieStore.delete('token')
        redirect('/login')
    }
}

export async function hasPermission(permission: string) {
    const prisma = getPrismaClient()
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return false;
        }

        const auth = await verifyAuth()
        if (!auth) return false

        const user = await prisma.user.findUnique({
            where: { id: auth.id },
            select: { role: true }
        })
        return user?.role?.name === permission
    } finally {
        await prisma.$disconnect()
    }
}