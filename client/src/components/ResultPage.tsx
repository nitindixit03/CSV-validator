import type { ProcessingResult } from "../types";

interface ResultPageProps {
  result: ProcessingResult;
  onReset: () => void;
}

export default function ResultPage({ result, onReset }: ResultPageProps) {
  const { totalRows, validRows, invalidRows, cleanedFiles, errorFile, detectedFields } = result;
  const apiBase = "https://csv-validator-server.onrender.com";

  const validPercent = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0;
  const invalidPercent = totalRows > 0 ? Math.round((invalidRows / totalRows) * 100) : 0;

  return (
    <div className="page">
      <div className="card">
        <div className="result-header">
          <svg className="result-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <h1>Processing Complete</h1>
            <p className="subtitle">Your CSV has been validated and processed</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-value">{totalRows}</span>
            <span className="stat-label">Total Rows</span>
          </div>
          <div className="stat stat-valid">
            <span className="stat-value">{validRows}</span>
            <span className="stat-label">Valid ({validPercent}%)</span>
          </div>
          <div className="stat stat-invalid">
            <span className="stat-value">{invalidRows}</span>
            <span className="stat-label">Invalid ({invalidPercent}%)</span>
          </div>
        </div>

        {totalRows > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill progress-valid"
              style={{ width: `${validPercent}%` }}
              title={`${validPercent}% valid`}
            />
            {invalidPercent > 0 && (
              <div
                className="progress-fill progress-invalid"
                style={{ width: `${invalidPercent}%` }}
                title={`${invalidPercent}% invalid`}
              />
            )}
          </div>
        )}

        {detectedFields.length > 0 && (
          <div className="fields-section">
            <h3>Detected Fields</h3>
            <div className="field-tags">
              {detectedFields.map((field) => (
                <span key={field} className="tag">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="downloads">
          <h3>Download Results</h3>
          <div className="download-buttons">
            {cleanedFiles.map((file) => (
              <a
                key={file}
                href={`${apiBase}/api/download/${file}`}
                className="btn btn-success"
                download
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {cleanedFiles.length > 1 ? file : "Cleaned CSV"}
              </a>
            ))}
            <a
              href={`${apiBase}/api/download/${errorFile}`}
              className="btn btn-warning"
              download
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Validation Errors
            </a>
          </div>
        </div>

        <button onClick={onReset} className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Upload Another File
        </button>
      </div>
    </div>
  );
}
