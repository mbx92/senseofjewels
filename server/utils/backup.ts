import { mkdir, writeFile, readdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import prisma from './prisma'

const BACKUP_DIR = join(process.cwd(), 'backups')
const MAX_BACKUPS = 7

export interface BackupMeta {
  filename: string
  size: number
  createdAt: string
}

export function getBackupDir(): string {
  return BACKUP_DIR
}

async function ensureBackupDir() {
  await mkdir(BACKUP_DIR, { recursive: true })
}

export async function createDatabaseBackup(): Promise<string> {
  await ensureBackupDir()

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const timePart = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  const filename = `backup_${datePart}_${timePart}.json`
  const filepath = join(BACKUP_DIR, filename)

  const [users, siteSettings, sections, collections, products, testimonials, media, orders, orderItems] =
    await Promise.all([
      // Exclude hashed passwords from backup for security
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } }),
      prisma.siteSetting.findMany(),
      prisma.section.findMany(),
      prisma.collection.findMany(),
      prisma.product.findMany(),
      prisma.testimonial.findMany(),
      prisma.media.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
    ])

  const data = {
    version: '1.0',
    timestamp: now.toISOString(),
    tables: {
      users,
      site_settings: siteSettings,
      sections,
      collections,
      products,
      testimonials,
      media,
      orders,
      order_items: orderItems,
    },
  }

  await writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8')
  await pruneOldBackups()

  return filename
}

export async function listBackups(): Promise<BackupMeta[]> {
  await ensureBackupDir()

  let files: string[]
  try {
    files = await readdir(BACKUP_DIR)
  } catch {
    return []
  }

  const jsonFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'))

  const backups = await Promise.all(
    jsonFiles.map(async (filename) => {
      const s = await stat(join(BACKUP_DIR, filename))
      return { filename, size: s.size, createdAt: s.mtime.toISOString() } satisfies BackupMeta
    }),
  )

  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

async function pruneOldBackups() {
  const backups = await listBackups()
  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS)
    await Promise.all(toDelete.map(b => unlink(join(BACKUP_DIR, b.filename))))
  }
}
