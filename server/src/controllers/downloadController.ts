import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { OUTPUT_DIR } from '../utils/fileUtils'

export async function handleDownload(req: Request, res: Response) {
  try {
    const filename = req.params.filename as string

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' })
    }

    const filePath = path.join(OUTPUT_DIR, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.download(filePath, filename)
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Failed to download file' })
  }
}
