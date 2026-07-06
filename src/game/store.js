import { advanceGame, createInitialGameState, mineBitcoin, purchaseUpgrade } from './engine.js'

export function createGameStore() {
  let state = createInitialGameState()
  let timerId
  let lastUpdated = performance.now()
  const listeners = new Set()

  const notify = () => {
    for (const listener of listeners) {
      listener(state)
    }
  }

  const tick = () => {
    const now = performance.now()
    const nextState = advanceGame(state, now - lastUpdated)
    lastUpdated = now

    if (nextState !== state) {
      state = nextState
      notify()
    }
  }

  return {
    getState() {
      return state
    },
    subscribe(listener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
    start() {
      if (timerId) {
        return
      }

      lastUpdated = performance.now()
      timerId = globalThis.setInterval(tick, 250)
    },
    stop() {
      if (!timerId) {
        return
      }

      globalThis.clearInterval(timerId)
      timerId = undefined
    },
    mine() {
      state = mineBitcoin(state)
      notify()
    },
    buyUpgrade(upgradeId) {
      const nextState = purchaseUpgrade(state, upgradeId)

      if (nextState !== state) {
        state = nextState
        notify()
      }
    },
  }
}
