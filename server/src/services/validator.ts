import type { ValidationResult, Countries } from '../types'

export interface ColumnRule {
  seenValues: Map<string, number>
  numericCount: number
  totalCount: number
  phoneLikeCount: number
}

export function buildColumnRules(headers: string[]): Record<string, ColumnRule> {
  const rules: Record<string, ColumnRule> = {}
  for (const header of headers) {
    rules[header] = { seenValues: new Map(), numericCount: 0, totalCount: 0, phoneLikeCount: 0 }
  }
  return rules
}

function isLikelyPhone(value: string): boolean {
  return value.startsWith('+') && value.replace(/\D/g, '').length >= 7
}

function validatePhoneValue(value: string, countries: Countries): string | null {
  const digitsOnly = value.replace(/\D/g, '')

  const entries = Object.entries(countries).sort((a, b) => b[1].countryCode.length - a[1].countryCode.length)

  for (const [country, config] of entries) {
    const cc = config.countryCode
    if (value.startsWith(cc)) {
      const ccDigits = cc.replace(/\D/g, '').length
      const numberPart = digitsOnly.slice(ccDigits)
      if (numberPart.length !== config.phoneLength) {
        return `Invalid ${country} phone number: expected ${config.phoneLength} digits after ${cc}, got ${numberPart.length}`
      }
      return null
    }
  }

  return `Unknown country code in phone number "${value}"`
}

export function validateRow(
  row: Record<string, string>,
  rowNumber: number,
  columnRules: Record<string, ColumnRule>,
  countries: Countries = {},
): ValidationResult {
  const errors: string[] = []

  for (const [header, rule] of Object.entries(columnRules)) {
    const value = (row[header] ?? '').trim()

    if (!value) {
      errors.push(`Row ${rowNumber}: Missing value in column "${header}"`)
      continue
    }

    rule.totalCount++

    const prevCount = rule.seenValues.get(value) ?? 0
    if (prevCount > 0) {
      errors.push(`Row ${rowNumber}: Duplicate value "${value}" in column "${header}"`)
    }
    rule.seenValues.set(value, prevCount + 1)

    const isNumeric = !isNaN(Number(value))
    if (isNumeric) {
      rule.numericCount++
    }

    if (rule.totalCount >= 10 && rule.numericCount / rule.totalCount > 0.8 && !isNumeric) {
      errors.push(`Row ${rowNumber}: Non-numeric value "${value}" in column "${header}" (column is mostly numeric)`)
    }

    if (Object.keys(countries).length > 0 && isLikelyPhone(value)) {
      rule.phoneLikeCount++
      const phoneError = validatePhoneValue(value, countries)
      if (phoneError) {
        errors.push(`Row ${rowNumber}: ${phoneError}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
