import fs from 'fs'
import path from 'path'
import csvParser from 'csv-parser'
import { stringify } from 'csv-stringify'
import { loadCountries } from '../utils/fileUtils'
import { buildColumnRules, validateRow } from './validator'
import type { ColumnRule } from './validator'
import type { ProcessingResult, Countries } from '../types'

const CHUNK_SIZE = 10000

class CleanedChunkWriter {
  private partIndex = 1
  private rowsInCurrentPart = 0
  private stringifier: ReturnType<typeof stringify> | null = null
  private outputDir: string
  public headers: string[]
  public files: string[] = []

  constructor(outputDir: string, headers: string[]) {
    this.outputDir = outputDir
    this.headers = headers
    this.createWriter()
  }

  private createWriter() {
    const filename = `cleaned_part_${this.partIndex}.csv`
    this.files.push(filename)
    const filePath = path.join(this.outputDir, filename)
    const ws = fs.createWriteStream(filePath)
    this.stringifier = stringify({ header: true, columns: [...this.headers, 'status'] })
    this.stringifier.pipe(ws)
  }

  write(row: Record<string, string>) {
    if (this.rowsInCurrentPart >= CHUNK_SIZE) {
      this.stringifier!.end()
      this.partIndex++
      this.rowsInCurrentPart = 0
      this.createWriter()
    }
    this.stringifier!.write({ ...row, status: 'VALID' })
    this.rowsInCurrentPart++
  }

  end() {
    if (this.stringifier) {
      this.stringifier.end()
    }
  }
}

export async function processCSV(filePath: string, outputDir: string): Promise<ProcessingResult> {
  return new Promise((resolve, reject) => {
    const countries: Countries = loadCountries()
    let columnRules: Record<string, ColumnRule> = {}

    let totalRows = 0
    let validRows = 0
    let invalidRows = 0
    let cleanedWriter: CleanedChunkWriter | null = null

    const errorFile = 'validation_errors.csv'
    const errorFilePath = path.join(outputDir, errorFile)
    const errorStream = fs.createWriteStream(errorFilePath)
    const errorStringifier = stringify({ header: true, columns: ['row_number', 'error_message'] })
    errorStringifier.pipe(errorStream)

    const parser = csvParser()

    parser.on('headers', (headers: string[]) => {
      if (headers.length > 0) {
        columnRules = buildColumnRules(headers)
        cleanedWriter = new CleanedChunkWriter(outputDir, headers)
      }
    })

    parser.on('data', (row: Record<string, string>) => {
      totalRows++
      const result = validateRow(row, totalRows, columnRules, countries)
      if (result.valid) {
        validRows++
        cleanedWriter?.write(row)
      } else {
        invalidRows++
        for (const err of result.errors) {
          errorStringifier.write({ row_number: totalRows, error_message: err })
        }
      }
    })

    parser.on('end', () => {
      errorStringifier.end()
      cleanedWriter?.end()

      resolve({
        totalRows,
        validRows,
        invalidRows,
        cleanedFiles: cleanedWriter?.files ?? [],
        errorFile,
        detectedFields: cleanedWriter?.headers ?? [],
      })
    })

    parser.on('error', (err) => {
      errorStringifier.end()
      cleanedWriter?.end()
      reject(err)
    })

    const readStream = fs.createReadStream(filePath)
    readStream.on('error', (err) => {
      errorStringifier.end()
      cleanedWriter?.end()
      reject(err)
    })

    readStream.pipe(parser)
  })
}
