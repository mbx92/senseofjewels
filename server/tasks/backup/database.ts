import { createDatabaseBackup } from '../../utils/backup'

export default defineTask({
  meta: {
    name: 'backup:database',
    description: 'Automated daily database backup at 11 PM',
  },
  async run() {
    const filename = await createDatabaseBackup()
    console.log(`[backup] Auto backup created: ${filename}`)
    return { result: `Backup created: ${filename}` }
  },
})
