const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  getPremiumStatus,
  cancelSubscription,
  manuallyUpdatePremiumStatus
} = require('../controllers/stripeController');

// Create a checkout session for premium subscription
router.post('/create-checkout-session', createCheckoutSession);

// Special route for Stripe webhooks - we'll use express raw body for this
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Get premium status
router.get('/premium-status', getPremiumStatus);

// Cancel subscription
router.post('/cancel-subscription', cancelSubscription);

// Manually update premium status after successful payment
router.post('/update-premium-status', manuallyUpdatePremiumStatus);

module.exports = router; 