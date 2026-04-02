## PDF RAG App

Next.js frontend for the PDF RAG platform. This app gives users an authenticated workspace for upload, retrieval chat, memory visibility, and backend status monitoring.

## Overview

This repo provides:

- login and registration UI
- document upload with background job polling
- agent chat with streaming responses
- rendering for citations, tool calls, and reasoning steps
- system health, usage, and memory dashboards
- a Next.js proxy layer for backend communication

The companion backend repo is `pdf-rag-backend`.

## Key Features

- Next.js App Router application
- React 19 + TypeScript
- Zustand-based client state management
- SSE-based streaming chat
- responsive dashboard layout
- centralized API client and response normalization
- proxy route under `app/api/[...path]/route.ts`

## Architecture

### Request flow

1. The browser loads the Next.js app.
2. The user authenticates through the app's `/api/*` route.
3. The token is stored in `localStorage`.
4. Zustand stores hydrate the session and fetch system, document, and memory data.
5. Chat requests go through the local proxy to the backend agent endpoints.
6. Streaming events update the active assistant message in real time.

### Main modules

- `app/`: routes, root layout, and proxy endpoint
- `components/`: auth, chat, document, memory, system, and shared UI pieces
- `stores/`: auth, chat, document, memory, and system state
- `hooks/`: streaming behavior
- `lib/api.ts`: request helpers, token handling, and payload normalization

## Repository Structure

```text
pdf-rag-app/
|- app/
|  |- api/[...path]/route.ts   # backend proxy
|  |- layout.tsx               # root layout
|  |- page.tsx                 # app entry page
|  |- globals.css              # global styling
|- components/
|  |- auth/                    # authentication UI
|  |- chat/                    # chat, messages, reasoning, tools
|  |- documents/               # upload and document list
|  |- memory/                  # memory dashboard
|  |- system/                  # backend status cards
|  |- ui/                      # shared primitives
|- hooks/
|  |- use-streaming.ts         # SSE update flow
|- lib/
|  |- api.ts                   # API client
|  |- types.ts                 # shared frontend types
|- stores/                     # Zustand stores
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Zustand
- Tailwind CSS v4
- lucide-react
- react-dropzone
- react-hot-toast

## Configuration

Set the backend URL in `.env`.

### Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | fallback to deployed Railway URL in code | Backend base URL used by the Next.js proxy |

Local example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## UI and State Model

### Main layout

- `Header`: auth status, backend status, usage, theme toggle
- `Sidebar`: system health, upload, document list, memory dashboard
- `ChatInterface`: user and assistant conversation area

### Stores

- `stores/auth-store.ts`: auth, hydration, logout, usage updates
- `stores/chat-store.ts`: message lifecycle and non-streaming requests
- `stores/document-store.ts`: upload state, polling, document refresh
- `stores/memory-store.ts`: memory stats and cleanup actions
- `stores/system-store.ts`: health and backend status refresh

## Backend Integration

The app talks to the backend through the local Next.js proxy:

- browser -> `/api/*`
- `app/api/[...path]/route.ts` -> backend base URL
- `lib/api.ts` -> normalized frontend models

This keeps components simple and centralizes auth headers and payload normalization.

## Running with the Backend

Typical local setup:

1. Start `pdf-rag-backend` on `http://localhost:8000`
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
3. Start this app on `http://localhost:3000`

The frontend expects auth, upload, status, memory, and agent endpoints to be available from the backend.

## Deployment

This repo is suitable for Vercel-style frontend deployment with a separately hosted backend.

Before deploying:

- set `NEXT_PUBLIC_API_BASE_URL` to the production backend URL
- verify backend CORS allows the deployed frontend origin
- run `npm run build`

## Related Repository

- Backend: `C:\development\pdf-rag-backend`
