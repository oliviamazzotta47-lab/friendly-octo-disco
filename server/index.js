import crypto from 'node:crypto'
import { createServer } from 'node:http'

import Stripe from 'stripe'

import { createOrderStore } from './orderStore.js'
import { loadEnvFile } from './loadEnvFile.js'
import { buildCheckoutUrls, buildProductCatalog, handleStripeEvent } from './stripeBackend.js'

loadEnvFile()

const PORT = Number(process.env.STRIPE_SERVER_PORT ?? 4242)
const APP_BASE_URL = process.env.STRIPE_APP_BASE_URL ?? 'http://localhost:5173/'
const ALLOWED_ORIGIN = process.env.STRIPE_ALLOWED_ORIGIN ?? new URL(APP_BASE_URL).origin
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const productCatalog = buildProductCatalog(process.env)
const orderStore = createOrderStore()
const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null

function setCorsHeaders(req, res) {
  const requestOrigin = req.headers.origin

  if (requestOrigin && requestOrigin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

async function readRawBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks)
}

async function readJsonBody(req) {
  const rawBody = await readRawBody(req)

  if (rawBody.length === 0) {
    return {}
  }

  return JSON.parse(rawBody.toString('utf-8'))
}

function getOrderSummary(order) {
  if (!order) {
    return null
  }

  return {
    orderId: order.orderId,
    playerId: order.playerId,
    productId: order.productId,
    productName: order.productName,
    unityProductId: order.unityProductId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

const server = createServer(async (req, res) => {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host}`)

  try {
    if (req.method === 'GET' && requestUrl.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        stripeConfigured: stripeClient !== null,
      })
      return
    }

    if (req.method === 'GET' && requestUrl.pathname.startsWith('/api/orders/')) {
      const orderId = decodeURIComponent(requestUrl.pathname.replace('/api/orders/', ''))
      const order = orderStore.getOrder(orderId)

      if (!order) {
        sendJson(res, 404, {
          error: 'Order not found.',
        })
        return
      }

      sendJson(res, 200, getOrderSummary(order))
      return
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/checkout-sessions') {
      if (!stripeClient) {
        sendJson(res, 503, {
          error: 'Stripe server is not configured. Add STRIPE_SECRET_KEY first.',
        })
        return
      }

      const { playerId, productId } = await readJsonBody(req)

      if (typeof playerId !== 'string' || playerId.trim().length === 0) {
        sendJson(res, 400, {
          error: 'A playerId is required.',
        })
        return
      }

      const product = productCatalog.get(productId)

      if (!product || !product.priceId) {
        sendJson(res, 400, {
          error: 'Unknown product or missing Stripe price ID configuration.',
        })
        return
      }

      const orderId = crypto.randomUUID()
      const { successUrl, cancelUrl } = buildCheckoutUrls({
        appBaseUrl: APP_BASE_URL,
        orderId,
      })

      orderStore.createPendingOrder({
        orderId,
        playerId: playerId.trim(),
        productId: product.id,
        productName: product.name,
        unityProductId: product.unityProductId,
        priceId: product.priceId,
      })

      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: product.priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          orderId,
          playerId: playerId.trim(),
          productId: product.id,
          unityProductId: product.unityProductId,
        },
      })

      orderStore.attachCheckoutSession(orderId, {
        checkoutUrl: session.url,
        checkoutSessionId: session.id,
      })

      sendJson(res, 201, {
        orderId,
        checkoutUrl: session.url,
      })
      return
    }

    if (req.method === 'POST' && requestUrl.pathname === '/api/stripe/webhook') {
      if (!stripeClient || !stripeWebhookSecret) {
        sendJson(res, 503, {
          error: 'Stripe webhook is not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.',
        })
        return
      }

      const rawBody = await readRawBody(req)
      const signature = req.headers['stripe-signature']

      if (typeof signature !== 'string' || signature.length === 0) {
        sendJson(res, 400, {
          error: 'Missing Stripe-Signature header.',
        })
        return
      }

      const event = stripeClient.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret)
      const result = handleStripeEvent({
        event,
        orderStore,
      })

      sendJson(res, 200, {
        received: true,
        applied: result.applied,
        order: getOrderSummary(result.order),
      })
      return
    }

    sendJson(res, 404, {
      error: 'Route not found.',
    })
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    })
  }
})

server.listen(PORT, () => {
  console.log(`Stripe checkout server listening on http://localhost:${PORT}`)
})
