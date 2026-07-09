import test from 'node:test'
import assert from 'node:assert/strict'

import { createStripeStore, sanitizeApiBaseUrl, sanitizeExternalUrl } from '../src/lib/stripeStore.js'

test('sanitizeExternalUrl accepts https links and rejects unsafe protocols', () => {
  assert.equal(sanitizeExternalUrl('https://buy.stripe.com/test_checkout'), 'https://buy.stripe.com/test_checkout')
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null)
})

test('sanitizeApiBaseUrl accepts http origins and defaults to empty string', () => {
  assert.equal(sanitizeApiBaseUrl('http://localhost:4242'), 'http://localhost:4242/')
  assert.equal(sanitizeApiBaseUrl('file:///tmp/stripe'), '')
})

test('createStripeStore exposes api and dashboard URLs', () => {
  const stripeStore = createStripeStore({
    VITE_STRIPE_API_BASE_URL: 'http://localhost:4242',
    VITE_STRIPE_DASHBOARD_URL: 'https://dashboard.stripe.com/products',
  })

  assert.equal(stripeStore.apiBaseUrl, 'http://localhost:4242/')
  assert.equal(stripeStore.dashboardUrl, 'https://dashboard.stripe.com/products')
  assert.equal(stripeStore.items.length, 3)
})
