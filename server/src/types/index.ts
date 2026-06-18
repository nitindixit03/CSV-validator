export interface CountryConfig {
  countryCode: string
  phoneLength: number
}

export interface Countries {
  [code: string]: CountryConfig
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ProcessingResult {
  totalRows: number
  validRows: number
  invalidRows: number
  cleanedFiles: string[]
  errorFile: string
  detectedFields: string[]
}
