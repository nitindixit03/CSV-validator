import fs from 'fs'
import path from 'path'
import type { Countries } from '../types'

const CONFIG_DIR = path.resolve('config')
const COUNTRIES_PATH = path.join(CONFIG_DIR, 'countries.json')

export const OUTPUT_DIR = path.resolve(import.meta.dirname, '..', '..', 'output')

export function loadCountries(): Countries {
  try {
    const data = fs.readFileSync(COUNTRIES_PATH, 'utf-8')
    return JSON.parse(data) as Countries
  } catch {
    console.warn('Could not load countries.json, using empty config')
    return {}
  }
}

export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}
