import { STORE_ITEMS } from '../models/storeItems.js'

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

export function sanitizeExternalUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null
  }

  try {
    const url = new URL(value)
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

export function sanitizeApiBaseUrl(value) {
  const normalized = sanitizeExternalUrl(value)
  return normalized ?? ''
}

export function createStripeStore(env = {}) {
  return {
    apiBaseUrl: sanitizeApiBaseUrl(env.VITE_STRIPE_API_BASE_URL),
    dashboardUrl: sanitizeExternalUrl(env.VITE_STRIPE_DASHBOARD_URL),
    items: STORE_ITEMS,
  }
}
