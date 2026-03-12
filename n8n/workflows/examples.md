# Payload Examples

## New Memory Webhook Payload

The backend sends this shape to `N8N_MEMORY_WEBHOOK_URL` after a memory is created:

```json
{
  "type": "memory.created",
  "user": {
    "id": "65f0d2f1e86c9a001234abcd",
    "displayName": "Rashmi",
    "partnerName": "Ayan",
    "email": "rashmi@example.com",
    "relationshipStartDate": "2023-02-14T00:00:00.000Z",
    "loveMessageOptIn": true,
    "createdAt": "2026-03-09T11:30:00.000Z"
  },
  "memory": {
    "_id": "65f0d301e86c9a001234abce",
    "user": "65f0d2f1e86c9a001234abcd",
    "title": "Our first trip to Puri",
    "description": "Sunrise, beach walk, and too much coffee.",
    "category": "trip",
    "location": "Puri, Odisha",
    "eventDate": "2025-11-18T00:00:00.000Z",
    "media": [
      {
        "url": "https://res.cloudinary.com/demo/image/upload/v1/love-timeline/trip.jpg",
        "publicId": "love-timeline/trip",
        "resourceType": "image",
        "fileName": "trip.jpg"
      }
    ],
    "createdAt": "2026-03-09T11:34:00.000Z",
    "updatedAt": "2026-03-09T11:34:00.000Z"
  }
}
```

## Anniversary Endpoint Response

`POST /api/automation/anniversaries`

```json
{
  "count": 1,
  "reminders": [
    {
      "email": "rashmi@example.com",
      "displayName": "Rashmi",
      "partnerName": "Ayan",
      "years": 3,
      "anniversaryDate": "2026-03-14T00:00:00.000Z",
      "daysUntil": 5
    }
  ]
}
```

## Love Message Endpoint Response

`POST /api/automation/love-messages`

```json
{
  "count": 1,
  "messages": [
    {
      "email": "rashmi@example.com",
      "displayName": "Rashmi",
      "partnerName": "Ayan",
      "daysTogether": 1120,
      "reason": "monthly",
      "message": "Another month of your story is on the calendar. Rashmi, you and Ayan have been together for 1120 days."
    }
  ]
}
```
