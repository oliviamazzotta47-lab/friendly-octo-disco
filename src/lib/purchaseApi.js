const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

function getApiUrl(baseUrl, path) {
  if (!baseUrl) {
    return path
  }

  return new URL(path, `${baseUrl}/`).toString()
}

async function readJsonResponse(response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

export async function createCheckoutSession({ baseUrl, playerId, productId }) {
  const response = await fetch(getApiUrl(baseUrl, '/api/checkout-sessions'), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      playerId,
      productId,
    }),
  })

  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Unable to create Stripe checkout session.')
  }

  return payload
}

export async function getOrder(baseUrl, orderId) {
  const response = await fetch(getApiUrl(baseUrl, `/api/orders/${encodeURIComponent(orderId)}`))
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Unable to load purchase status.')
  }

  return payload
}
