import './style.css'
import { createGameStore } from './game/store.js'
import { createCheckoutSession, getOrder } from './lib/purchaseApi.js'
import { createStripeStore } from './lib/stripeStore.js'
import { renderApp } from './ui/appScreen.js'

const root = document.querySelector('#app')
const store = createGameStore()
const stripeStore = createStripeStore(import.meta.env)
const PLAYER_ID_STORAGE_KEY = 'friendly-octo-disco-player-id'
let purchaseState = {
  activeProductId: null,
  message: '',
  tone: 'info',
}

function getPlayerId() {
  const existingPlayerId = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY)

  if (typeof existingPlayerId === 'string' && existingPlayerId.trim().length > 0) {
    return existingPlayerId
  }

  const nextPlayerId = `web-${window.crypto.randomUUID()}`
  window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, nextPlayerId)
  return nextPlayerId
}

function setPurchaseState(nextState) {
  purchaseState = {
    ...purchaseState,
    ...nextState,
  }
  render()
}

function clearCheckoutParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('checkout')
  url.searchParams.delete('order_id')
  url.searchParams.delete('session_id')
  window.history.replaceState({}, '', url)
}

async function hydratePurchaseStateFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const checkoutState = params.get('checkout')
  const orderId = params.get('order_id')

  if (!checkoutState || !orderId) {
    return
  }

  if (checkoutState === 'cancelled') {
    setPurchaseState({
      activeProductId: null,
      message: 'Stripe checkout was cancelled before payment completed.',
      tone: 'info',
    })
    clearCheckoutParams()
    return
  }

  try {
    const order = await getOrder(stripeStore.apiBaseUrl, orderId)
    const isFulfilled = order.status === 'fulfilled'

    setPurchaseState({
      activeProductId: null,
      message: isFulfilled
        ? `${order.productName} payment confirmed and ready to fulfill for ${order.playerId}.`
        : `${order.productName} checkout was created. Awaiting Stripe webhook confirmation.`,
      tone: isFulfilled ? 'success' : 'info',
    })
  } catch (error) {
    setPurchaseState({
      activeProductId: null,
      message: error.message,
      tone: 'error',
    })
  } finally {
    clearCheckoutParams()
  }
}

async function handleStorePurchase(productId) {
  setPurchaseState({
    activeProductId: productId,
    message: '',
    tone: 'info',
  })

  try {
    const session = await createCheckoutSession({
      baseUrl: stripeStore.apiBaseUrl,
      playerId: getPlayerId(),
      productId,
    })

    setPurchaseState({
      activeProductId: null,
      message: 'Opening Stripe Checkout...',
      tone: 'info',
    })

    window.location.assign(session.checkoutUrl)
  } catch (error) {
    setPurchaseState({
      activeProductId: null,
      message: error.message,
      tone: 'error',
    })
  }
}

const render = () => {
  renderApp(root, store.getState(), {
    onMine: () => store.mine(),
    onBuyUpgrade: (upgradeId) => store.buyUpgrade(upgradeId),
    onBuyStoreItem: (productId) => handleStorePurchase(productId),
  }, stripeStore, purchaseState)
}

store.subscribe(render)
render()
store.start()
hydratePurchaseStateFromUrl()
