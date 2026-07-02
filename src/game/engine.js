import { UPGRADE_DEFINITIONS } from '../models/upgrades.js'

const BASE_CLICK_POWER = 1

const toFixedNumber = (value) => Number(value.toFixed(2))

const getUpgradeDefinition = (upgradeId) =>
  UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === upgradeId)

const buildUpgradeLevels = () =>
  Object.fromEntries(UPGRADE_DEFINITIONS.map((upgrade) => [upgrade.id, 0]))

const calculateRates = (upgrades) =>
  UPGRADE_DEFINITIONS.reduce(
    (rates, upgrade) => {
      const owned = upgrades[upgrade.id] ?? 0
      const totalEffect = owned * upgrade.effectPerLevel

      if (upgrade.kind === 'click') {
        rates.clickPower += totalEffect
      } else {
        rates.passiveRate += totalEffect
      }

      return rates
    },
    { clickPower: BASE_CLICK_POWER, passiveRate: 0 },
  )

export function createInitialGameState() {
  const upgrades = buildUpgradeLevels()
  const { clickPower, passiveRate } = calculateRates(upgrades)

  return {
    bitcoins: 0,
    totalMined: 0,
    clickPower,
    passiveRate,
    upgrades,
  }
}

export function getUpgradeCost(state, upgradeId) {
  const upgrade = getUpgradeDefinition(upgradeId)

  if (!upgrade) {
    return null
  }

  const level = state.upgrades[upgradeId] ?? 0
  return Math.round(upgrade.baseCost * upgrade.costMultiplier ** level)
}

export function mineBitcoin(state) {
  return {
    ...state,
    bitcoins: toFixedNumber(state.bitcoins + state.clickPower),
    totalMined: toFixedNumber(state.totalMined + state.clickPower),
  }
}

export function advanceGame(state, elapsedMs) {
  if (elapsedMs <= 0 || state.passiveRate <= 0) {
    return state
  }

  const mined = state.passiveRate * (elapsedMs / 1000)

  return {
    ...state,
    bitcoins: toFixedNumber(state.bitcoins + mined),
    totalMined: toFixedNumber(state.totalMined + mined),
  }
}

export function purchaseUpgrade(state, upgradeId) {
  const upgrade = getUpgradeDefinition(upgradeId)
  const cost = getUpgradeCost(state, upgradeId)

  if (!upgrade || cost === null || state.bitcoins < cost) {
    return state
  }

  const upgrades = {
    ...state.upgrades,
    [upgradeId]: (state.upgrades[upgradeId] ?? 0) + 1,
  }
  const { clickPower, passiveRate } = calculateRates(upgrades)

  return {
    ...state,
    bitcoins: toFixedNumber(state.bitcoins - cost),
    upgrades,
    clickPower,
    passiveRate,
  }
}
