const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  },
  body: JSON.stringify(body)
});

export async function handler(event) {
  if (event.requestContext?.http?.method === "OPTIONS") {
    return json(204, {});
  }

  if (event.rawPath === "/coach/tip") {
    return json(200, {
      tip: "Anchor the next meal with lean protein and colorful carbohydrates, then keep your final set two reps shy of failure."
    });
  }

  if (event.rawPath === "/health") {
    return json(200, { status: "ok", service: "vital-lift-api" });
  }

  return json(404, { message: "Route not found" });
}
