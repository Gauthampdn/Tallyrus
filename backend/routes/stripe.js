// routes/stripe.js
const express = require("express");
const router = express.Router();

const { 
  createPaymentIntent, 
  createSubscription, 
  updatePaymentMethod,
  cancelSubscription
} = require("../controllers/stripeController");

const requireAuth = require("../middleware/requireAuth");

// Require authentication for all Stripe endpoints
router.use(requireAuth);

// Endpoint for creating a one-time payment
router.post("/payment-intent", createPaymentIntent);

// Endpoint for creating a subscription
router.post("/create-subscription", createSubscription);

// Endpoint to update/save a new payment method (for future subscriptions)
router.post("/update-payment-method", updatePaymentMethod);

// Endpoint to cancel a subscription
router.post("/cancel-subscription", cancelSubscription);

module.exports = router;
