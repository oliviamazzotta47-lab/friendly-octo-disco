import test from 'node:test'
import assert from 'node:assert/strict'

import { createOrderStore } from '../server/orderStore.js'
import { buildCheckoutUrls, buildProductCatalog, handleStripeEvent } from '../server/stripeBackend.js'

test('buildProductCatalog maps env price IDs onto known store items', () => {
  const catalog = buildProductCatalog({
    STRIPE_PRICE_ID_STARTER_PACK: 'price_starter',
    STRIPE_PRICE_ID_PRO_PACK: 'price_pro',
  })

  assert.equal(catalog.get('starter-pack').priceId, 'price_starter')
  assert.equal(catalog.get('pro-pack').priceId, 'price_pro')
  assert.equal(catalog.get('ultimate-pack').priceId, '')
})

test('buildCheckoutUrls embeds order and session placeholders', () => {
  const urls = buildCheckoutUrls({
    appBaseUrl: 'https://game.example/store',
    orderId: 'order-123',
  })

  assert.match(urls.successUrl, /checkout=success/)
  assert.match(urls.successUrl, /order_id=order-123/)
  assert.match(urls.successUrl, /session_id=%7BCHECKOUT_SESSION_ID%7D/)
  assert.match(urls.cancelUrl, /checkout=cancelled/)
})

test('handleStripeEvent fulfills orders once and ignores duplicate events', () => {
  const orderStore = createOrderStore()

  orderStore.createPendingOrder({
    orderId: 'order-123',
    playerId: 'player-1',
    productId: 'starter-pack',
    productName: 'Starter Coin Pack',
    unityProductId: 'com.friendlyoctodisco.starterpack',
    priceId: 'price_123',
  })

  const firstResult = handleStripeEvent({
    orderStore,
    event: {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_123',
          metadata: {
            orderId: 'order-123',
          },
        },
      },
    },
  })

  const duplicateResult = handleStripeEvent({
    orderStore,
    event: {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_123',
          metadata: {
            orderId: 'order-123',
          },
        },
      },
    },
  })

  assert.equal(firstResult.applied, true)
  assert.equal(firstResult.order.status, 'fulfilled')
  assert.equal(duplicateResult.applied, false)
  assert.equal(duplicateResult.order.status, 'fulfilled')
})
