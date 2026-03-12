const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function resolveUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(path, { token, body, headers = {}, ...options } = {}) {
  const requestHeaders = new Headers(headers);

  if (!(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(path), {
    ...options,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}
