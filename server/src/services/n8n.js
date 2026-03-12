import config from "../config.js";

export async function triggerMemoryCreatedWebhook(payload) {
  if (!config.n8nMemoryWebhookUrl) {
    return false;
  }

  try {
    const response = await fetch(config.n8nMemoryWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
