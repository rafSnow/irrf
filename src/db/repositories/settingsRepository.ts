import { db } from '../database'

export const settingsRepository = {
  async get(key: string) {
    const setting = await db.settings.get(key)
    return setting?.value
  },
  async set(key: string, value: unknown) {
    return db.settings.put({ key, value })
  },
}
