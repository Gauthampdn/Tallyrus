const User = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a checkout session for premium subscription
const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user already has an active subscription
    if (user.isPremium) {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }

    // Create or retrieve the customer in Stripe
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      // Save the customer ID to the user
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
    }

    // Create a checkout session - using price ID from environment variables if available
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          // If a price ID is available in env vars, use it; otherwise use price_data
          ...(process.env.STRIPE_PRICE_ID ? 
            { price: process.env.STRIPE_PRICE_ID, quantity: 1 } : 
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Tallyrus Premium',
                  description: 'Access premium features on Tallyrus'
                },
                unit_amount: 1200, // $12.00
                recurring: {
                  interval: 'month'
                }
              },
              quantity: 1,
            }
          )
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/app`,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle the webhook event from Stripe
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Process the subscription payment
      if (session.mode === 'subscription') {
        try {
          const userId = session.metadata.userId;
          const subscriptionId = session.subscription;
          
          // Retrieve the subscription to get the period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const premiumExpiresAt = new Date(subscription.current_period_end * 1000);
          
          // Update user with subscription info
          await User.findByIdAndUpdate(userId, {
            isPremium: true,
            stripeSubscriptionId: subscriptionId,
            premiumExpiresAt
          });
          
          console.log(`User ${userId} subscribed successfully`);
        } catch (error) {
          console.error('Error processing subscription:', error);
        }
      }
      break;
      
    case 'invoice.payment_succeeded':
      // When a subscription is renewed
      const invoice = event.data.object;
      if (invoice.subscription) {
        try {
          // Find the user with this subscription ID
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const user = await User.findOne({ stripeSubscriptionId: invoice.subscription });
          
          if (user) {
            // Update the expiration date
            const premiumExpiresAt = new Date(subscription.current_period_end * 1000);
            await User.findByIdAndUpdate(user._id, {
              isPremium: true,
              premiumExpiresAt
            });
            
            console.log(`Subscription renewed for user ${user._id}`);
          }
        } catch (error) {
          console.error('Error processing renewal:', error);
        }
      }
      break;
      
    case 'customer.subscription.deleted':
      // When a subscription is canceled
      const canceledSubscription = event.data.object;
      try {
        // Find the user with this subscription ID and remove premium status
        const user = await User.findOne({ stripeSubscriptionId: canceledSubscription.id });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            isPremium: false,
            stripeSubscriptionId: null,
            premiumExpiresAt: null
          });
          
          console.log(`Premium status removed for user ${user._id}`);
        }
      } catch (error) {
        console.error('Error processing subscription cancellation:', error);
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// Get the premium status for a user
const getPremiumStatus = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if premium has expired (in case webhook failed)
    if (user.isPremium && user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
      await User.findByIdAndUpdate(user._id, {
        isPremium: false
      });
      
      return res.status(200).json({ isPremium: false });
    }

    res.status(200).json({ isPremium: user.isPremium });
  } catch (error) {
    console.error('Error getting premium status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!user.isPremium || !user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel at period end instead of immediately
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.status(200).json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPremiumStatus,
  cancelSubscription
}; 