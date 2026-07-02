export const UPGRADE_DEFINITIONS = [
  {
    id: 'gpu-rig',
    name: 'GPU Rig',
    description: 'Adds steady passive mining power.',
    kind: 'passive',
    effectPerLevel: 0.2,
    baseCost: 10,
    costMultiplier: 1.8,
  },
  {
    id: 'better-pickaxe',
    name: 'Better Pickaxe',
    description: 'Improves each manual mining click.',
    kind: 'click',
    effectPerLevel: 1,
    baseCost: 15,
    costMultiplier: 1.75,
  },
  {
    id: 'server-farm',
    name: 'Server Farm',
    description: 'Unlock industrial-scale passive mining.',
    kind: 'passive',
    effectPerLevel: 1,
    baseCost: 60,
    costMultiplier: 2,
  },
]
