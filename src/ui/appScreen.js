import bitcoinIcon from '../assets/bitcoin.svg'
import { getUpgradeCost } from '../game/engine.js'
import { UPGRADE_DEFINITIONS } from '../models/upgrades.js'

const formatAmount = (value) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value < 10 && value % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)

const formatEffect = (upgrade) => {
  const amount = formatAmount(upgrade.effectPerLevel)
  return upgrade.kind === 'click'
    ? `+${amount} BTC per click`
    : `+${amount} BTC per second`
}

const getUpgradeMarkup = (state) =>
  UPGRADE_DEFINITIONS.map((upgrade) => {
    const level = state.upgrades[upgrade.id] ?? 0
    const cost = getUpgradeCost(state, upgrade.id)
    const disabled = cost === null || state.bitcoins < cost

    return `
      <li class="upgrade-card">
        <div class="upgrade-card__top">
          <div>
            <h3>${upgrade.name}</h3>
            <small>Level ${level}</small>
          </div>
          <span class="upgrade-card__meta">${cost} BTC</span>
        </div>
        <div class="upgrade-card__effect">${formatEffect(upgrade)}</div>
        <p>${upgrade.description}</p>
        <button type="button" data-action="buy-upgrade" data-upgrade-id="${upgrade.id}" ${
          disabled ? 'disabled' : ''
        }>
          ${disabled ? 'Need more BTC' : `Buy for ${cost} BTC`}
        </button>
      </li>
    `
  }).join('')

const getStoreMarkup = (stripeStore) =>
  stripeStore.items.map((item) => `
    <li class="store-card">
      <div class="store-card__top">
        <div>
          <h3>${item.name}</h3>
          <small>${item.unityProductId}</small>
        </div>
        <span class="store-card__meta">${item.priceLabel}</span>
      </div>
      <p>${item.description}</p>
      ${
        item.isConfigured
          ? `<a
              class="store-card__button"
              href="${item.paymentLink}"
              target="_blank"
              rel="noreferrer noopener"
            >
              Buy with Stripe
            </a>`
          : `<button type="button" class="store-card__button" disabled>
              Add Stripe link in env
            </button>`
      }
    </li>
  `).join('')

export function renderApp(root, state, actions, stripeStore) {
  root.innerHTML = `
    <main class="screen">
      <section class="hero">
        <div class="hero__badge">
          <img src="${bitcoinIcon}" alt="" class="hero__icon" />
          Friendly Octo Disco
        </div>
        <h1>Bitcoin Mining Clicker</h1>
        <p>
          Tap to mine Bitcoin, reinvest your wallet into upgrades, and let passive income
          scale up while you chase the next big haul.
        </p>
      </section>

      <section class="layout">
        <section class="panel panel--mine">
          <div class="stats" aria-label="Current mining stats">
            <article class="stat">
              <span class="stat__label">Wallet</span>
              <span class="stat__value">${formatAmount(state.bitcoins)} BTC</span>
            </article>
            <article class="stat">
              <span class="stat__label">Total mined</span>
              <span class="stat__value">${formatAmount(state.totalMined)} BTC</span>
            </article>
            <article class="stat">
              <span class="stat__label">Click power</span>
              <span class="stat__value">${formatAmount(state.clickPower)} BTC</span>
            </article>
            <article class="stat">
              <span class="stat__label">Passive rate</span>
              <span class="stat__value">${formatAmount(state.passiveRate)} BTC/s</span>
            </article>
          </div>

          <div class="mine-area">
            <button type="button" class="mine-button" data-action="mine">
              <span class="mine-button__inner">
                <img src="${bitcoinIcon}" alt="" class="mine-button__icon" />
                <span class="mine-button__label">Mine Bitcoin</span>
                <span class="mine-button__hint">+${formatAmount(state.clickPower)} BTC this tap</span>
              </span>
            </button>
            <p>Passive miners tick every quarter second to keep the wallet growing.</p>
          </div>
        </section>

        <aside class="sidebar">
          <section class="panel panel--upgrades">
            <h2>Upgrades</h2>
            <p>Spend Bitcoin to boost manual clicks and unlock faster passive mining.</p>
            <ul class="upgrade-list">
              ${getUpgradeMarkup(state)}
            </ul>
          </section>

          <section class="panel panel--store">
            <div class="panel__heading">
              <div>
                <h2>Unity Store Purchases</h2>
                <p>Route web checkout buttons to Stripe while keeping Unity product IDs visible.</p>
              </div>
              ${
                stripeStore.dashboardUrl
                  ? `<a
                      class="panel__link"
                      href="${stripeStore.dashboardUrl}"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Stripe Dashboard
                    </a>`
                  : ''
              }
            </div>
            <ul class="store-list">
              ${getStoreMarkup(stripeStore)}
            </ul>
          </section>
        </aside>
      </section>

      <p class="footer-note">Tip: buy a GPU Rig first to unlock passive income, then stack click power for faster bursts.</p>
    </main>
  `

  root.querySelector('[data-action="mine"]').addEventListener('click', actions.onMine)
  root.querySelectorAll('[data-action="buy-upgrade"]').forEach((button) => {
    button.addEventListener('click', () => actions.onBuyUpgrade(button.dataset.upgradeId))
  })
}
