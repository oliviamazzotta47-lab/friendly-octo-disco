import { advanceGame, createInitialGameState, loadGameState, mineBitcoin, purchaseUpgrade, saveGameState } from './engine.js'

export function createGameStore() {
  let state = loadGameState() ?? createInitialGameState()
  let timerId
  let lastUpdated = performance.now()
  const listeners = new Set()

  const notify = () => {
    saveGameState(state)
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
      timerId = window.setInterval(tick, 250)
    },
    stop() {
      if (!timerId) {
        return
      }

      window.clearInterval(timerId)
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
