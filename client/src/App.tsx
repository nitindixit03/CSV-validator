import { useState } from 'react'
import type { ProcessingResult, PageState } from './types'
import UploadPage from './components/UploadPage'
import ResultPage from './components/ResultPage'
import './App.css'

function App() {
  const [page, setPage] = useState<PageState>('upload')
  const [result, setResult] = useState<ProcessingResult | null>(null)

  const handleComplete = (processingResult: ProcessingResult) => {
    setResult(processingResult)
    setPage('result')
  }

  const handleReset = () => {
    setResult(null)
    setPage('upload')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <svg className="header-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="header-title">CSV Validator</span>
        </div>
      </header>
      <main className="main">
        {page === 'upload' && <UploadPage onComplete={handleComplete} />}
        {page === 'result' && result && <ResultPage result={result} onReset={handleReset} />}
      </main>
    </div>
  )
}

export default App
