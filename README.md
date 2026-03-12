# Love Timeline

A romantic full-stack web app where couples can sign up, save memories, upload photos or videos, track days together, and run n8n automations for reminders and love messages.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Automation: n8n via webhook triggers and secure automation endpoints
- Hosting: Render

## Features

- Secure signup and login with JWT authentication
- Couple dashboard for profile updates and memory management
- Chronological love timeline with photo and video attachments
- Days-together counter from the first meeting date
- Next-anniversary countdown
- n8n-ready automation hooks for:
  - new memory notification emails
  - anniversary reminder emails
  - monthly or special-date love messages

## Project Structure

```text
client/   React app
server/   Express API and MongoDB models
n8n/      n8n setup guide and workflow recipes
```

## Local Setup

1. Copy `.env.example` to `.env`.
2. Fill in:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `AUTOMATION_API_KEY`
   - optional `N8N_MEMORY_WEBHOOK_URL`
   - optional Cloudinary credentials for persistent media uploads
3. Install dependencies:

```bash
npm install
```

4. Run the app:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

## Production Notes

- Render’s filesystem is ephemeral. For production photo/video storage, set:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- If Cloudinary is not configured, uploads fall back to local disk storage for development only.

## Render Deployment

This repo includes `render.yaml`.

1. Push the project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Set these environment variables in Render:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_ORIGIN`
   - `AUTOMATION_API_KEY`
   - `N8N_MEMORY_WEBHOOK_URL` if you want new-memory webhook delivery
   - Cloudinary credentials for persistent uploads
4. Deploy.

The server serves the built React app automatically after `npm run build`.

## n8n Integration

See [n8n/README.md](n8n/README.md) for workflow setup.

## Security

The MongoDB connection string shared in chat included live credentials. Do not commit that URI to the repo. Rotate the Atlas password and replace it with a new value in your local `.env`, Render, and n8n.
