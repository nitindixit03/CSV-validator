# CSV Transaction Validator

Upload a CSV, get back cleaned CSVs + an error report. Runs validation in a single streaming pass — reads rows one by one, no full-file buffering.

## What I built

A full-stack app with a React frontend and Express backend. The backend streams the CSV through a validation pipeline and writes two outputs:

- **Cleaned CSV(s)** — rows that passed validation, split at 10,000 rows per file
- **Validation errors CSV** — row number + error message for each bad row

The frontend shows a summary (total/valid/invalid counts) and provides download links.

## Approach

**Data-driven, schema-less validation.** The validator doesn't know the column names ahead of time. It reads the CSV headers dynamically, then tracks state per column as rows stream in. Three generic checks:

| Check            | How                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| Missing values   | Any empty cell                                                       |
| Duplicates       | Same value appears >1x in a column (keeps first occurrence)          |
| Type consistency | After 10+ rows, if 80%+ of values are numeric, flag non-numeric ones |

Plus **phone number validation** — if a value starts with `+` and looks like a phone number (7+ digits), it's checked against known country codes (`countries.json`). Validates country code prefix and digit length (e.g., +91 followed by exactly 10 digits for India). Unknown country codes or wrong lengths are flagged.

That's it. No hardcoded column names, no format-specific rules. Any CSV works, but the checks are deliberately generic.

**Streaming pipeline.** `csv-parser` pipes rows through the validator, which feeds into `csv-stringify` writers — one for cleaned rows (with chunk rotation), one for errors. Memory use depends on row width, not file size.

**Chunked output.** Cleaned files are capped at 10,000 rows. Past that, a new `cleaned_part_N.csv` is created.

## Tradeoffs

- **Error file doesn't include original row data.** Just row number + message. You have to cross-reference the original CSV.
- **No persistence.** Outputs live in `output/` on disk until cleaned up. Restart the server, results are gone.
- **No concurrency.** Two simultaneous uploads overwrite each other's output files. No request-scoped isolation.
- **No queue.** Processing blocks the request thread. Large files hold the connection open until done.

- **No tests.**
- **No file size limits, no cleanup, no progress indicators.** It's a prototype.

## Assumptions

- CSV must have a header row
- Empty cell = error (including whitespace-only)
- Duplicate values are always errors — even legitimate repeats like "ACTIVE" status across rows
- After 10 rows, the column's type profile is stable enough to decide whether it's numeric
- `Number("")` evaluates to `0` (vanilla JS behavior), but empty strings are caught before the numeric check
- Output directory is writable and has enough disk space
- Only one person uses it at a time

## Project Structure

```
server/
  config/countries.json     # Phone config (unused)
  src/
    types/index.ts
    services/validator.ts
    services/csvProcessor.ts
    controllers/uploadController.ts
    routes/uploadRoutes.ts
    utils/fileUtils.ts      # loadCountries() used by validator
  index.ts

client/
  src/
    types/index.ts
    components/
      UploadPage.tsx
      ResultPage.tsx
    App.tsx
    App.css
```

## Setup

Requires [Bun](https://bun.sh) v1.2+.

```bash
cd server && bun install
cd ../client && bun install
```

### Run server

```bash
cd server && bun run index.ts
# http://localhost:3001
```

### Run client (separate terminal)

```bash
cd client && bun run dev
# http://localhost:5173 (proxies /api and /output to backend)
```

## Usage

1. Open http://localhost:5173
2. Upload a CSV
3. View results + download cleaned files and error report

## API

| Method | Endpoint            | Description                                     |
| ------ | ------------------- | ----------------------------------------------- |
| POST   | `/api/upload`       | Upload CSV (multipart/form-data, field: `file`) |
| GET    | `/output/:filename` | Download processed file                         |
