import api from "./api";

export async function trackEvent(name, payload = {}) {
  const body = { event: name, payload, ts: new Date().toISOString() };
  try {
    // best-effort: send to /analytics/events if backend supports it
    await api.post("/analytics/events", body);
  } catch (err) {
    // fallback: log to console to avoid breaking UX
    console.debug(
      "Analytics track failed (fallback to console):",
      name,
      payload,
      err?.message || err,
    );
  }
}
