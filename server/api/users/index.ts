import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

async function requireSuperAdmin(event: any) {
  const sessionId = getCookie(event, 'mm_session')
  if (!sessionId) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  const user = await prisma.user.findUnique({ where: { id: sessionId }, select: { role: true } })
  if (user?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
}

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    await requireSuperAdmin(event)
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    })
    return users
  }

  if (method === 'POST') {
    await requireSuperAdmin(event)
    const body = await readBody(event)
    if (!body.email || !body.password || !body.name) {
      throw createError({ statusCode: 400, statusMessage: 'Name, email and password are required' })
    }
    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) throw createError({ statusCode: 409, statusMessage: 'Email already in use' })

    const hashed = await bcrypt.hash(body.password, 12)
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashed,
        role: body.role === 'superadmin' ? 'superadmin' : 'admin',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })
    return user
  }
})
