import { existsSync, mkdirSync } from 'fs'

export function createDirectory (path): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true })
}
