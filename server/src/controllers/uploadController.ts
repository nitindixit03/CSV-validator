import type { Request, Response } from 'express'
import fs from 'fs'
import { processCSV } from '../services/csvProcessor'
import { OUTPUT_DIR } from '../utils/fileUtils'

export async function handleUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'Only CSV files are allowed' })
    }

    const result = await processCSV(req.file.path, OUTPUT_DIR)

    fs.unlink(req.file.path, () => {})

    res.json(result)
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {})
    }
    console.error('Upload processing error:', error)
    res.status(500).json({ error: 'Failed to process file' })
  }
}
