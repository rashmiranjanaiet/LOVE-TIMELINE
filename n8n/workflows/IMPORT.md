# Import These Workflows Into n8n

## Files

- `01-memory-created-email.workflow.json`
- `02-anniversary-reminders.workflow.json`
- `03-love-messages.workflow.json`

## Import Steps (n8n UI)

1. Open n8n.
2. Go to `Workflows`.
3. Click `Import from File`.
4. Import each JSON file above.
5. Open each imported workflow and configure the `Send Email` node credentials.
6. Keep `fromEmail` valid for your SMTP provider.
7. Activate each workflow.

## Required n8n Environment Variables

- `LOVE_TIMELINE_BASE_URL`  
  Example local value: `http://localhost:5000`
- `LOVE_TIMELINE_AUTOMATION_KEY`  
  Must match your app `server/.env` -> `AUTOMATION_API_KEY`

## Required App Environment Variable

In `server/.env`, set:

`N8N_MEMORY_WEBHOOK_URL=http://localhost:5678/webhook/love-memory-created`

Then restart your app server.
