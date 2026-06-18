# CSV Transaction Validator

A full-stack web application for validating, cleaning, and processing CSV transaction files. Upload a CSV, get back cleaned data chunks and a detailed validation error report.

## Features

- **Drag-and-drop upload** — intuitive file selection with CSV validation
- **Streaming validation** — reads rows one by one, no full-file buffering
- **4 validation checks:**
  - Missing value detection
  - Duplicate row identification
  - Type consistency analysis (numeric vs string columns)
  - Phone number validation with country-specific rules (IN, SG, US, UK, MY)
- **Chunked output** — cleaned files split at 10,000 rows per file
- **Dark mode UI** — professional-grade interface with real-time stats
- **Download reports** — cleaned CSVs and validation errors report

## Tech Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Frontend    | React 19, TypeScript, Vite       |
| Backend     | Express 5, TypeScript, Bun       |
| Validation  | Custom streaming pipeline        |
| CSV parsing | csv-parser, csv-stringify        |

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPage.tsx      # Drag-and-drop file upload
│   │   │   └── ResultPage.tsx      # Validation summary & downloads
│   │   ├── App.tsx                 # Root component
│   │   ├── App.css                 # Dark theme styles
│   │   └── index.css               # Global base styles
│   └── index.html
│
└── server/                    # Express API
    ├── src/
    │   ├── controllers/
    │   │   ├── uploadController.ts    # Upload handling
    │   │   └── downloadController.ts  # File downloads
    │   ├── services/
    │   │   ├── validator.ts           # Core validation logic
    │   │   └── csvProcessor.ts        # Streaming pipeline
    │   ├── routes/uploadRoutes.ts     # Route definitions
    │   ├── types/index.ts             # Shared types
    │   └── utils/fileUtils.ts         # File helpers
    ├── config/countries.json         # Phone validation rules
    └── index.ts                      # Server entry point
```

## Quick Start

Requires [Bun](https://bun.sh) v1.2+.

```bash
# Install dependencies
cd server && bun install
cd ../client && bun install

# Start the API server (terminal 1)
cd server && bun run index.ts

# Start the frontend dev server (terminal 2)
cd client && bun run dev
```

Open http://localhost:5173, upload a CSV, and view results.

## API

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/api/upload`             | Upload CSV (multipart, field: file)|
| GET    | `/api/download/:filename` | Download processed file            |

## Validation Rules

| Check             | Description                                                         |
|-------------------|---------------------------------------------------------------------|
| Missing values    | Any empty cell is flagged                                           |
| Duplicates        | Repeated values in a column (keeps first occurrence)                |
| Type consistency  | After 10 rows, if 80%+ values are numeric, non-numeric ones flagged |
| Phone numbers     | Values starting with `+` checked against country code + digit rules |

## License

MIT
