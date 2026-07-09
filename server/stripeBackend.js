import { STORE_ITEMS } from '../src/models/storeItems.js'

export function buildProductCatalog(env = process.env) {
  return new Map(
    STORE_ITEMS.map((item) => [
      item.id,
      {
        ...item,
        priceId: env[item.priceEnvKey] ?? '',
      },
    ]),
  )
}

export function buildCheckoutUrls({ appBaseUrl, orderId }) {
  const successUrl = new URL(appBaseUrl)
  successUrl.searchParams.set('checkout', 'success')
  successUrl.searchParams.set('order_id', orderId)
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')

  const cancelUrl = new URL(appBaseUrl)
  cancelUrl.searchParams.set('checkout', 'cancelled')
  cancelUrl.searchParams.set('order_id', orderId)

  return {
    successUrl: successUrl.toString(),
    cancelUrl: cancelUrl.toString(),
  }
}

export function handleStripeEvent({ event, orderStore }) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    return orderStore.markFulfilled({
      orderId: session.metadata?.orderId,
      eventId: event.id,
      checkoutSessionId: session.id,
      paymentIntentId: session.payment_intent ?? null,
    })
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object

    return orderStore.markExpired({
      orderId: session.metadata?.orderId,
      eventId: event.id,
      checkoutSessionId: session.id,
    })
  }

  return {
    applied: false,
    order: null,
  }
}
