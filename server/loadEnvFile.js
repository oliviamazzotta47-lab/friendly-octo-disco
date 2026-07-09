import fs from 'node:fs'
import path from 'node:path'

export function loadEnvFile(filePath = '.env') {
  const absolutePath = path.resolve(process.cwd(), filePath)

  if (!fs.existsSync(absolutePath)) {
    return
  }

  const contents = fs.readFileSync(absolutePath, 'utf-8')

  for (const line of contents.split(/\r?\n/u)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    const normalizedValue = rawValue.replace(/^['"]|['"]$/gu, '')

    if (!(key in process.env)) {
      process.env[key] = normalizedValue
    }
  }
}
