/**
 * Fetches the Ball4 Foundation Figma file via the REST API.
 * Requires FIGMA_ACCESS_TOKEN in .env (or environment).
 *
 * Get a token: Figma → Settings → Personal access tokens → Generate.
 * Scope needed: file_content:read
 *
 * Run: node scripts/figma-fetch.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnv() {
  const path = join(root, '.env')
  if (!existsSync(path)) return {}
  const content = readFileSync(path, 'utf8')
  const out = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return out
}

const FIGMA_FILE_KEY = 'v963LpQMaglrkwS9SG668x'
const env = { ...process.env, ...loadEnv() }
const token = env.FIGMA_ACCESS_TOKEN

if (!token) {
  console.error('Missing FIGMA_ACCESS_TOKEN. Add it to .env or set the environment variable.')
  console.error('Get a token: Figma → Settings → Personal access tokens (scope: file_content:read)')
  process.exit(1)
}

const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`

try {
  const res = await fetch(url, {
    headers: { 'X-Figma-Token': token },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Figma API ${res.status}: ${text}`)
  }
  const data = await res.json()
  const outPath = join(root, 'figma-design.json')
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8')
  console.log('Figma file saved to figma-design.json')
  console.log('File name:', data.name)
  console.log('Document pages:', data.document?.children?.map((c) => c.name)?.join(', ') || 'n/a')
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
