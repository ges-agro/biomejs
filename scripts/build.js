import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'generated')
const baseFileName = 'base.json'

mkdirSync(outDir, { recursive: true })

function deepMerge(base, override) {
  const result = { ...base }

  for (const key of Object.keys(override)) {
    if (
      key in result &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key]) &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key])
    } else {
      result[key] = override[key]
    }
  }

  return result
}

const base = JSON.parse(readFileSync(join(root, 'src/base.json'), 'utf8'))

writeFileSync(join(outDir, baseFileName), JSON.stringify(base, null, 2) + '\n')
console.log(`built generated/${baseFileName}`)

const presets = readdirSync(join(root, 'src'))
  .filter((f) => f.endsWith('.json') && f !== baseFileName)
  .map((f) => basename(f, '.json'))

for (const preset of presets) {
  const delta = JSON.parse(readFileSync(join(root, `src/${preset}.json`), 'utf8'))
  const merged = deepMerge(base, delta)

  writeFileSync(join(outDir, `${preset}.json`), JSON.stringify(merged, null, 2) + '\n')
  console.log(`built generated/${preset}.json`)
}
