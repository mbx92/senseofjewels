import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

async function requireSuperAdmin(event: any) {
  const sessionId = getCookie(event, 'mm_session')
  if (!sessionId) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })
  const user = await prisma.user.findUnique({ where: { id: sessionId }, select: { role: true } })
  if (user?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') as string
  const method = event.method

  await requireSuperAdmin(event)

  if (method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })
    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    return user
  }

  if (method === 'PUT') {
    const body = await readBody(event)
    const data: Record<string, string> = {}

    if (body.name) data.name = body.name
    if (body.email) data.email = body.email
    if (body.role && ['admin', 'superadmin', 'customer'].includes(body.role)) data.role = body.role
    if (body.password) data.password = await bcrypt.hash(body.password, 12)

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    })
    return user
  }

  if (method === 'DELETE') {
    // Prevent deleting yourself
    const sessionId = getCookie(event, 'mm_session')
    if (id === sessionId) throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })

    // Ensure at least one superadmin remains
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (target?.role === 'superadmin') {
      const superAdminCount = await prisma.user.count({ where: { role: 'superadmin' } })
      if (superAdminCount <= 1) throw createError({ statusCode: 400, statusMessage: 'Cannot delete the last superadmin' })
    }

    await prisma.user.delete({ where: { id } })
    return { success: true }
  }
})
