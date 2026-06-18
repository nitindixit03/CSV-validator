export interface ProcessingResult {
  totalRows: number
  validRows: number
  invalidRows: number
  cleanedFiles: string[]
  errorFile: string
  detectedFields: string[]
}

export type PageState = 'upload' | 'result'
