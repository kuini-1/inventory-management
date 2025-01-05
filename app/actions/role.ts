'use server'

import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '../lib/auth'

const prisma = new PrismaClient()

export async function getRoles() {
    await verifyAuth()
    return await prisma.role.findMany()
} 