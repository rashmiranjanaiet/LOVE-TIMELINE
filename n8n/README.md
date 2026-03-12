# n8n Setup

This project supports three automation flows:

1. New memory notification
2. Anniversary reminder
3. Monthly or special-date love messages

## Required Environment Variables in n8n

- `LOVE_TIMELINE_BASE_URL`
  - Example: `https://your-render-service.onrender.com`
- `LOVE_TIMELINE_AUTOMATION_KEY`
  - Must match the app's `AUTOMATION_API_KEY`
- SMTP or email credentials configured in your `Send Email` node

## Workflow 1: New Memory Notification

Purpose: when a user saves a memory, the backend POSTs the memory payload to n8n.

### Backend config

Set this in the web app:

- `N8N_MEMORY_WEBHOOK_URL=https://your-n8n-host/webhook/love-memory-created`

### n8n nodes

1. `Webhook`
   - Method: `POST`
   - Path: `love-memory-created`
   - Response mode: `Using Respond to Webhook node`
2. `Code`
   - JavaScript:

```javascript
const payload = $json.body ?? $json;
const memory = payload.memory;
const user = payload.user;

return [
  {
    json: {
      to: user.email,
      subject: `New memory added: ${memory.title}`,
      html: `
        <h2>Love Timeline</h2>
        <p>${user.displayName}, a new memory was saved.</p>
        <p><strong>${memory.title}</strong></p>
        <p>${memory.description || "No description provided."}</p>
        <p>Date: ${new Date(memory.eventDate).toLocaleDateString()}</p>
      `
    }
  }
];
```

3. `Send Email`
   - To: `={{ $json.to }}`
   - Subject: `={{ $json.subject }}`
   - HTML: `={{ $json.html }}`
4. `Respond to Webhook`
   - Response format: JSON
   - Body:

```json
{
  "success": true
}
```

## Workflow 2: Anniversary Reminder

Purpose: run once per day and send reminders for anniversaries due within the next 7 days.

### n8n nodes

1. `Schedule Trigger`
   - Frequency: daily
   - Recommended time: 09:00
2. `HTTP Request`
   - Method: `POST`
   - URL: `={{ $env.LOVE_TIMELINE_BASE_URL + '/api/automation/anniversaries' }}`
   - Send headers: `x-automation-key = {{ $env.LOVE_TIMELINE_AUTOMATION_KEY }}`
   - Send JSON body:

```json
{
  "windowDays": 7
}
```

3. `Code`
   - JavaScript:

```javascript
const reminders = $json.reminders || [];

return reminders.map((reminder) => ({
  json: {
    to: reminder.email,
    subject: `${reminder.years} year anniversary in ${reminder.daysUntil} day(s)`,
    html: `
      <h2>Upcoming anniversary</h2>
      <p>${reminder.displayName}, your anniversary with ${reminder.partnerName} is coming up.</p>
      <p><strong>${reminder.years} years together</strong></p>
      <p>Date: ${new Date(reminder.anniversaryDate).toLocaleDateString()}</p>
      <p>Only ${reminder.daysUntil} day(s) left.</p>
    `
  }
}));
```

4. `Send Email`
   - To: `={{ $json.to }}`
   - Subject: `={{ $json.subject }}`
   - HTML: `={{ $json.html }}`

## Workflow 3: Monthly Love Messages

Purpose: run daily or monthly and send romantic messages when the relationship monthly milestone or a special date matches today.

### n8n nodes

1. `Schedule Trigger`
   - Frequency: daily
2. `HTTP Request`
   - Method: `POST`
   - URL: `={{ $env.LOVE_TIMELINE_BASE_URL + '/api/automation/love-messages' }}`
   - Send headers: `x-automation-key = {{ $env.LOVE_TIMELINE_AUTOMATION_KEY }}`
3. `Code`
   - JavaScript:

```javascript
const messages = $json.messages || [];

return messages.map((item) => ({
  json: {
    to: item.email,
    subject: "A message from your Love Timeline",
    html: `
      <h2>Love Timeline</h2>
      <p>${item.message}</p>
      <p>You and ${item.partnerName} have shared ${item.daysTogether} days together.</p>
    `
  }
}));
```

4. `Send Email`
   - To: `={{ $json.to }}`
   - Subject: `={{ $json.subject }}`
   - HTML: `={{ $json.html }}`

## Testing Tips

- Test the webhook flow first with a manual memory upload.
- Confirm the Render app exposes `/api/health`.
- Confirm `AUTOMATION_API_KEY` matches in both Render and n8n.
- If uploads need to persist in production, configure Cloudinary before testing media-heavy memories.
