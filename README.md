# Document Upload & Extraction

A client-side document upload and text extraction application built with React 18, TypeScript, and Vite. Upload PDF, DOCX, and TXT files to extract and view their text content — all processing happens in the browser with no server required.

## Features

- **Document Upload** — Drag & drop or file picker support for PDF, DOCX, and TXT files (up to 10 MB)
- **Text Extraction** — Client-side extraction using pdfjs-dist (PDF), mammoth.js (DOCX), and FileReader API (TXT)
- **Text Cleaning** — Automatic removal of formatting artifacts, control characters, and whitespace normalization
- **Authentication** — Local signup/login with SHA-256 password hashing and encrypted session management
- **Encrypted Storage** — All localStorage data (credentials, sessions, documents) encrypted with AES-GCM via Web Crypto API
- **Document History** — Browse, view, and delete previously uploaded documents with full metadata
- **Retry Logic** — Automatic retry with exponential backoff for failed extractions
- **Responsive Design** — Mobile-friendly layout with Tailwind CSS utility classes
- **Accessibility** — ARIA labels, keyboard navigation, live regions for status messages, and focus management

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript (strict mode) |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| PDF Extraction | pdfjs-dist 4 |
| DOCX Extraction | mammoth.js |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

## Architecture Overview

```
src/
├── components/          # Reusable UI components
│   ├── auth/            # LoginForm, SignupForm, ProtectedRoute
│   ├── common/          # StatusMessage
│   ├── documents/       # DocumentCard, DocumentDetail, DocumentList
│   ├── layout/          # Header, Sidebar, AppLayout
│   └── upload/          # DropZone, UploadProgress
├── contexts/            # React context providers
│   ├── AuthContext.tsx   # Authentication state management
│   ├── StatusContext.tsx # Global notification management
│   └── DocumentContext.tsx # Document workflow state
├── hooks/               # Custom React hooks
│   ├── useFileUpload.ts # Drag & drop and file picker logic
│   └── useSession.ts   # Session validation and auto-logout
├── pages/               # Route-level page components
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── DashboardPage.tsx
│   ├── UploadPage.tsx
│   └── HistoryPage.tsx
├── services/            # Business logic services
│   ├── authService.ts   # Signup, login, logout, session management
│   ├── extractionService.ts # Extraction orchestrator with retry
│   ├── pdfExtractor.ts  # PDF text extraction via pdfjs-dist
│   ├── docxExtractor.ts # DOCX text extraction via mammoth
│   └── txtExtractor.ts  # TXT file reading via FileReader
├── utils/               # Utility functions
│   ├── encryption.ts    # AES-GCM encryption/decryption
│   ├── storage.ts       # Encrypted localStorage adapter
│   ├── validation.ts    # File type and size validation
│   └── textCleaner.ts   # Text normalization and cleanup
├── types.ts             # Shared TypeScript type definitions
├── constants.ts         # Application constants
├── App.tsx              # Root component with routing
└── main.tsx             # Entry point
```

### Data Flow

1. **Upload** — User drops or selects a file via `DropZone`
2. **Validate** — `validation.ts` checks file type and size
3. **Extract** — `extractionService.ts` routes to the correct extractor (PDF/DOCX/TXT)
4. **Clean** — `textCleaner.ts` normalizes the extracted text
5. **Store** — `storage.ts` encrypts and persists the document record to localStorage
6. **Display** — `DocumentDetail` renders the extracted text and metadata

### Security Model

> **⚠️ Demo/Educational Use Only** — localStorage is not a secure storage mechanism for sensitive data. The encryption layer is for demonstration purposes.

- Passwords are hashed with SHA-256 before storage
- All localStorage values are encrypted with AES-GCM using PBKDF2-derived keys
- Sessions include timestamps for expiry validation (24-hour timeout)
- Protected routes redirect unauthenticated users to the login page

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd doc-upload-extraction

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

Edit `.env` and set a custom encryption key:

```env
VITE_ENCRYPTION_KEY=your-secret-encryption-key-change-in-production
```

> All `VITE_` prefixed variables are exposed to the client-side bundle. Do not store truly sensitive secrets here.

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

### Build

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Usage Guide

### 1. Create an Account

Navigate to the signup page and create an account with a username (3–32 alphanumeric characters) and password (6–64 characters).

### 2. Upload a Document

- Go to the **Upload** page
- Drag and drop a file onto the drop zone, or click to open the file picker
- Supported formats: **PDF**, **DOCX**, **TXT**
- Maximum file size: **10 MB**

### 3. View Extracted Text

After upload and extraction complete, the extracted text is displayed automatically. You can also find it in the **History** page.

### 4. Browse Document History

The **History** page lists all previously uploaded documents with their metadata (file name, type, size, upload date, extraction status). Click any document to view its full extracted text.

### 5. Dashboard

The **Dashboard** provides a summary of your uploaded documents and quick actions to upload new files or browse history.

## Supported File Types

| Format | MIME Type | Library |
|---|---|---|
| PDF | `application/pdf` | pdfjs-dist |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | mammoth.js |
| TXT | `text/plain` | FileReader API |

## Deployment

The project includes a `vercel.json` configuration for one-click deployment to [Vercel](https://vercel.com):

1. Push the repository to GitHub
2. Import the project in Vercel
3. Set the `VITE_ENCRYPTION_KEY` environment variable in Vercel project settings
4. Deploy

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |

## License

**Private** — All rights reserved. This project is not licensed for redistribution or reuse without explicit permission.