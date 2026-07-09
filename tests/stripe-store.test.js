import test from 'node:test'
import assert from 'node:assert/strict'

import { createStripeStore, sanitizeExternalUrl } from '../src/lib/stripeStore.js'

test('sanitizeExternalUrl accepts https links and rejects unsafe protocols', () => {
  assert.equal(sanitizeExternalUrl('https://buy.stripe.com/test_checkout'), 'https://buy.stripe.com/test_checkout')
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null)
})

test('createStripeStore maps env keys into purchasable store items', () => {
  const stripeStore = createStripeStore({
    VITE_STRIPE_DASHBOARD_URL: 'https://dashboard.stripe.com/products',
    VITE_STRIPE_PAYMENT_LINK_STARTER_PACK: 'https://buy.stripe.com/starter',
  })

  assert.equal(stripeStore.dashboardUrl, 'https://dashboard.stripe.com/products')
  assert.equal(stripeStore.items[0].isConfigured, true)
  assert.equal(stripeStore.items[0].paymentLink, 'https://buy.stripe.com/starter')
  assert.equal(stripeStore.items[1].isConfigured, false)
})
