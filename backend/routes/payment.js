const express = require('express');
const router = express.Router();
const stripelive = require('stripe')(process.env.STRIPE_SECRET_KEY_LIVE);
const stripetest = require('stripe')(process.env.STRIPE_SECRET_KEY_TEST);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;


router.post('/create-checkout-session', async (req, res) => {
    const { userId, email } = req.body; // ✅ correctly extract both
    console.log("Creating session with userId:", userId);
    console.log(endpointSecret);

  
    try {
      const session = await stripetest.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'TallyRus Premium',
              },
              unit_amount: 50,
            },
            quantity: 1,
          },
        ],
        success_url: 'http://localhost:3000/profile?success=true',
        cancel_url: 'http://localhost:3000/profile?canceled=true',
        customer_email: email,
        metadata: {
          userId: userId || "none"
        }
      });
  
      res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe session creation error:", err.message); // <--- This!
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
