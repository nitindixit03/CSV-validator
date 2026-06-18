import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { handleUpload } from '../controllers/uploadController'
import { handleDownload } from '../controllers/downloadController'
import { ensureDir } from '../utils/fileUtils'

const UPLOAD_DIR = path.resolve('uploads')
ensureDir(UPLOAD_DIR)

const upload = multer({ dest: UPLOAD_DIR })

const router = Router()

router.post('/upload', upload.single('file'), handleUpload)
router.get('/download/:filename', handleDownload)

export default router
