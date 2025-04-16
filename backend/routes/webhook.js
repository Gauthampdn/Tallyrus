const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const stripelive = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);
const stripetest = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;


router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];




  let event;
  try {
    event = stripetest.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
  
    console.log("Webhook triggered for user:", userId);
  
    try {
      const updatedUser = await User.findOneAndUpdate(
        { id: userId },           // ✅ This matches your schema
        { isPremium: true },
        { new: true }
      );
  
      if (updatedUser) {
        console.log(`✅ User ${userId} upgraded to Premium`);
      } else {
        console.log(`❌ No user found with id: ${userId}`);
      }
    } catch (err) {
      console.error("❌ Error updating user:", err);
    }
  }
  
  
  

  res.status(200).json({ received: true });
});

module.exports = router;
