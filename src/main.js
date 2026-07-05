import './style.css'
import { createGameStore } from './game/store.js'
import { renderApp } from './ui/appScreen.js'

const root = document.querySelector('#app')
const store = createGameStore()

const render = () => {
  renderApp(root, store.getState(), {
    onMine: () => store.mine(),
    onBuyUpgrade: (upgradeId) => store.buyUpgrade(upgradeId),
  })
}

store.subscribe(render)
render()
store.start()
