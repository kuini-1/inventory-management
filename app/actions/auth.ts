'use server'

import { PrismaClient } from '@prisma/client'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { AuthUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'

function getPrismaClient() {
  return new PrismaClient()
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '')

export async function login(data: { username: string; password: string }) {
  const prisma = getPrismaClient()
  
  try {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
      include: {
        role: true
      }
    })

    if (!user) throw new Error('User not found')
    
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    if (!isPasswordValid) throw new Error('Invalid credentials')

    await setAuthCookie({ 
      id: user.id, 
      username: user.username, 
      role: user.role.name
    })
    redirect('/')
  } finally {
    await prisma.$disconnect()
  }
}

export async function register(data: { username: string; password: string }) {
  const prisma = getPrismaClient()
  
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    })

    if (existingUser) throw new Error('User already exists')

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({
      data: { username: data.username, password: hashedPassword },
      include: { role: true }
    })

    await setAuthCookie({ id: user.id, username: user.username, role: user.role.name })
    redirect('/')
  } finally {
    await prisma.$disconnect()
  }
}

async function setAuthCookie(user: AuthUser) {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400
  })
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  return { success: true }
}