// controllers/stripeController.js
const Stripe = require("stripe");
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require("../models/userModel");

/**
 * createPaymentIntent
 * -------------------
 * Creates a Payment Intent using the provided amount and currency.
 *
 * Expected request body:
 * {
 *   "amount": 5000,       // amount in the smallest currency unit
 *   "currency": "usd"
 * }
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * createOrGetStripeCustomer
 * ---------------------------
 * Helper function to create or retrieve a Stripe customer associated with a Google user.
 * If the user already has a stripeCustomerId, it returns it; otherwise, it creates a new Stripe customer,
 * stores the customer id in the user's document, and returns the new id.
 *
 * @param {Object} user - The user document from the database.
 * @returns {String} - The Stripe customer ID.
 */
const createOrGetStripeCustomer = async (user) => {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  
  // Create a new Stripe customer using the user's email and Google ID as metadata.
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { googleId: user.id },
  });
  
  // Save the newly created Stripe customer ID to the user document.
  user.stripeCustomerId = customer.id;
  await user.save();
  
  return customer.id;
};

/**
 * createSubscription
 * ------------------
 * Creates (or updates) a subscription for a customer linked to a Google user.
 *
 * Expected request body:
 * {
 *   "paymentMethodId": "pm_xxxx",
 *   "priceId": "price_xxxx"
 * }
 */
const createSubscription = async (req, res) => {
  try {
    const { paymentMethodId, priceId } = req.body;
    const user = req.user; // Authenticated user

    // Retrieve or create the Stripe customer for this user
    const customerId = await createOrGetStripeCustomer(user);
    console.log("Using customerId:", customerId);

    // Log the paymentMethodId passed in (e.g. "pm_card_visa")
    console.log("Attaching PaymentMethod:", paymentMethodId);

    // Attach the PaymentMethod to the customer and capture the response
    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    console.log("Attached PaymentMethod response:", attachedPaymentMethod);

    // Use the PaymentMethod ID returned from the attach call
    const attachedPaymentMethodId = attachedPaymentMethod.id;
    console.log("Using attached PaymentMethod id:", attachedPaymentMethodId);

    // Update the customer's default payment method with the attached PaymentMethod ID
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: attachedPaymentMethodId },
    });
    console.log("Customer updated with default payment method:", attachedPaymentMethodId);

    // Create the subscription using the customer and a valid price ID
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * updatePaymentMethod
 * -------------------
 * Updates (or saves) a new payment method for an existing Stripe customer.
 * This allows the customer to enter a card number once and have it reused for future charges.
 *
 * Expected request body:
 * {
 *   "customerId": "cus_xxxx",
 *   "paymentMethodId": "pm_xxxx"
 * }
 */
const updatePaymentMethod = async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.body;

    // Attach the new payment method to the customer.
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

    // Update the customer's default payment method.
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    res.status(200).json({
      message: "Payment method updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * cancelSubscription
 * ------------------
 * Cancels an existing subscription.
 *
 * Expected request body:
 * {
 *   "subscriptionId": "sub_xxxx"
 * }
 */
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const cancellation = await stripe.subscriptions.cancel(subscriptionId);
    res.status(200).json({
      message: "Subscription cancelled successfully",
      cancellation,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  createSubscription,
  updatePaymentMethod,
  cancelSubscription
};
