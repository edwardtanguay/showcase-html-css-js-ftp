import { readdirSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async () => {
  try {
    const outlineDir = join(process.cwd(), 'public', 'images', 'outline')
    const files = readdirSync(outlineDir)
    return {
      images: files
    }
  } catch {
    return {
      images: []
    }
  }
})
