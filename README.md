# Nuvexa

Nuvexa is a full-stack real-time chat application with secure authentication, persistent direct and group conversations, presence, typing indicators, and read receipts.

## Features

- Registration and login with bcrypt password hashing and JWT authentication
- Protected frontend routes and authenticated API endpoints
- Persistent one-to-one messaging with PostgreSQL and Prisma
- Real-time direct and group messages with Socket.IO
- Online and offline presence across multiple browser sessions
- Real-time typing indicators for direct conversations
- Persistent Sent and Seen message receipts
- Group creation, membership, history, and access control
- Loading, empty, error, disconnect, and reconnect states
- Responsive chat layout

## Architecture

```text
React + Vite client
    |-- HTTPS REST requests --> Express API
    |-- WSS Socket.IO -------> Node HTTP server
                                  |
                                  +--> Prisma ORM --> PostgreSQL
```

The API persists messages, read receipts, groups, and memberships. Socket.IO carries real-time delivery, presence, and typing events.

## Technology

- Frontend: React, Vite, React Router, Axios, socket.io-client
- Backend: Node.js, Express, Socket.IO, JWT, bcrypt
- Database: PostgreSQL
- ORM: Prisma
- Suggested hosting: Render Static Site, Render Web Service, and Neon PostgreSQL

## Repository structure

```text
client/                 React frontend
server/                 Express and Socket.IO backend
server/prisma/          Prisma schema and migrations
render.yaml             Render deployment Blueprint
```

## Local setup

Requirements: Node.js 20 or newer, PostgreSQL, and npm.

1. Clone the repository.
2. Create local environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Replace the placeholders in `server/.env` with your local PostgreSQL URL and a strong JWT secret.
4. Install dependencies and prepare Prisma:

```bash
cd server
npm ci
npm run prisma:generate
npm run migrate:deploy

cd ../client
npm ci
```

5. Start the backend and frontend in separate terminals:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The defaults are `http://localhost:5173` for the frontend and `http://localhost:5000` for the backend.

## Environment variables

### Backend

| Variable | Purpose | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://...` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | A long random value |
| `CLIENT_URL` | Exact frontend origin without a trailing slash | `http://localhost:5173` |
| `PORT` | HTTP port, normally provided by hosting | `5000` |

### Frontend

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_URL` | Public backend URL including `/api` | `https://nuvexa-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Public backend origin for Socket.IO | `https://nuvexa-api.onrender.com` |

Never commit real `.env` files or secrets. Vite variables are included in the browser bundle and must never contain secrets.

## Prisma workflow

During development, create intentional migrations with `prisma migrate dev` and commit the resulting migration directories.

Production must use the non-interactive migration command:

```bash
npm run migrate:deploy
```

The Render backend command applies pending production migrations before starting. It never uses `migrate dev` or `db push` against production data.

## Production deployment

The included `render.yaml` describes the React static site and Node web service. Use a persistent managed PostgreSQL database such as Neon. Render's free PostgreSQL databases currently expire after 30 days, so they are unsuitable for a lasting portfolio deployment.

### 1. Create PostgreSQL

1. Create a Neon project in a region close to the backend.
2. Copy its PostgreSQL connection string.
3. Keep it private; this becomes the backend `DATABASE_URL`.

### 2. Push the repository

Commit these production-ready files and push the default branch to GitHub, GitLab, or Bitbucket.

### 3. Create the Render Blueprint

1. In Render, choose **New > Blueprint**.
2. Connect this repository. Render detects `render.yaml`.
3. Supply the requested values:
   - Backend `DATABASE_URL`: production PostgreSQL connection string
   - Backend `CLIENT_URL`: final Render static-site URL
   - Frontend `VITE_API_URL`: `https://YOUR-BACKEND.onrender.com/api`
   - Frontend `VITE_SOCKET_URL`: `https://YOUR-BACKEND.onrender.com`
4. Deploy both services.
5. If the frontend URL was unknown initially, update `CLIENT_URL` and redeploy the backend.
6. Redeploy the static site after changing a Vite variable because Vite injects variables at build time.

Render terminates TLS at its public URL. An `https://` Socket.IO URL establishes a secure WebSocket connection (`wss://`) in production.

Render free web services can spin down while idle, so the first API or Socket.IO connection after inactivity can be delayed. Use an always-on instance if uninterrupted real-time availability is required.

### 4. Verify production

- Open `/health` on the backend and confirm `{"status":"ok"}`.
- Register and log in with two separate browser sessions.
- Verify direct messages, persistence, presence, typing, and read receipts.
- Create a group with at least three accounts and verify membership and real-time messages.
- Refresh all sessions and verify histories persist.
- Test logout, reconnect behavior, and the responsive layout.
- Confirm browser requests use HTTPS/WSS without mixed-content or CORS errors.

## Commands

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server

```bash
npm run dev
npm start
npm run prisma:generate
npm run migrate:deploy
npm run render:start
```

## Screenshots

Add screenshots after deployment:

- Authentication
- Direct conversation with typing and Seen status
- Group creation and group conversation
- Mobile layout

## Future improvements

- Group read receipts and typing indicators
- Message editing and deletion
- File and image attachments
- Push notifications
- Automated integration and browser tests
