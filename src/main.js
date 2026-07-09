import './style.css'
import { createGameStore } from './game/store.js'
import { createStripeStore } from './lib/stripeStore.js'
import { renderApp } from './ui/appScreen.js'

const root = document.querySelector('#app')
const store = createGameStore()
const stripeStore = createStripeStore(import.meta.env)

const render = () => {
  renderApp(root, store.getState(), {
    onMine: () => store.mine(),
    onBuyUpgrade: (upgradeId) => store.buyUpgrade(upgradeId),
  }, stripeStore)
}

store.subscribe(render)
render()
store.start()
