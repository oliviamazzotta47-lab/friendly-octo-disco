function cloneOrder(order) {
  return {
    ...order,
  }
}

export function createOrderStore() {
  const orders = new Map()
  const processedEvents = new Set()

  return {
    createPendingOrder({ orderId, playerId, productId, productName, unityProductId, priceId }) {
      const timestamp = new Date().toISOString()
      const order = {
        orderId,
        playerId,
        productId,
        productName,
        unityProductId,
        priceId,
        status: 'pending',
        paymentStatus: 'unpaid',
        checkoutUrl: null,
        checkoutSessionId: null,
        paymentIntentId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      orders.set(orderId, order)
      return cloneOrder(order)
    },
    attachCheckoutSession(orderId, { checkoutUrl, checkoutSessionId }) {
      const order = orders.get(orderId)

      if (!order) {
        return null
      }

      order.checkoutUrl = checkoutUrl
      order.checkoutSessionId = checkoutSessionId
      order.status = 'checkout_created'
      order.updatedAt = new Date().toISOString()
      return cloneOrder(order)
    },
    markFulfilled({ orderId, eventId, checkoutSessionId, paymentIntentId }) {
      if (processedEvents.has(eventId)) {
        return {
          applied: false,
          order: this.getOrder(orderId),
        }
      }

      const order = orders.get(orderId)

      if (!order) {
        return {
          applied: false,
          order: null,
        }
      }

      processedEvents.add(eventId)
      order.checkoutSessionId = checkoutSessionId ?? order.checkoutSessionId
      order.paymentIntentId = paymentIntentId ?? order.paymentIntentId
      order.status = 'fulfilled'
      order.paymentStatus = 'paid'
      order.fulfilledAt = new Date().toISOString()
      order.updatedAt = order.fulfilledAt

      return {
        applied: true,
        order: cloneOrder(order),
      }
    },
    markExpired({ orderId, eventId, checkoutSessionId }) {
      if (processedEvents.has(eventId)) {
        return {
          applied: false,
          order: this.getOrder(orderId),
        }
      }

      const order = orders.get(orderId)

      if (!order) {
        return {
          applied: false,
          order: null,
        }
      }

      processedEvents.add(eventId)
      order.checkoutSessionId = checkoutSessionId ?? order.checkoutSessionId
      order.status = 'expired'
      order.paymentStatus = 'cancelled'
      order.updatedAt = new Date().toISOString()

      return {
        applied: true,
        order: cloneOrder(order),
      }
    },
    getOrder(orderId) {
      const order = orders.get(orderId)
      return order ? cloneOrder(order) : null
    },
  }
}
