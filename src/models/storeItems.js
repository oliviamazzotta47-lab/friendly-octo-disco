export const STORE_ITEMS = [
  {
    id: 'starter-pack',
    name: 'Starter Coin Pack',
    description: 'Launch a small Unity in-app purchase bundle for new players.',
    unityProductId: 'com.friendlyoctodisco.starterpack',
    priceLabel: '$4.99',
    paymentLinkEnvKey: 'VITE_STRIPE_PAYMENT_LINK_STARTER_PACK',
  },
  {
    id: 'pro-pack',
    name: 'Pro Coin Pack',
    description: 'Offer a mid-tier purchase with more value for returning players.',
    unityProductId: 'com.friendlyoctodisco.propack',
    priceLabel: '$14.99',
    paymentLinkEnvKey: 'VITE_STRIPE_PAYMENT_LINK_PRO_PACK',
  },
  {
    id: 'ultimate-pack',
    name: 'Ultimate Coin Pack',
    description: 'Promote a premium Unity bundle tied to your Stripe catalog.',
    unityProductId: 'com.friendlyoctodisco.ultimatepack',
    priceLabel: '$29.99',
    paymentLinkEnvKey: 'VITE_STRIPE_PAYMENT_LINK_ULTIMATE_PACK',
  },
]
