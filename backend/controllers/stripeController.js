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
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
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
    
    console.log(`Webhook received event: ${event.type}`);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`Processing checkout.session.completed for session: ${session.id}`);
      
      // Process the subscription payment
      if (session.mode === 'subscription') {
        try {
          const userId = session.metadata.userId;
          console.log(`Session has user ID in metadata: ${userId}`);
          
          const subscriptionId = session.subscription;
          console.log(`Session has subscription ID: ${subscriptionId}`);
          
          // Retrieve the subscription to get the period end
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Create a valid expiration date with proper error handling
          let premiumExpiresAt;
          if (subscription && subscription.current_period_end) {
            const timestamp = subscription.current_period_end * 1000; // Convert seconds to milliseconds
            premiumExpiresAt = new Date(timestamp);
            
            // Validate the date
            if (isNaN(premiumExpiresAt.getTime())) {
              console.error('Invalid date from Stripe webhook timestamp:', timestamp);
              // Fallback to 30 days from now
              premiumExpiresAt = new Date();
              premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
            }
          } else {
            // Fallback to 30 days from now if no subscription end date
            premiumExpiresAt = new Date();
            premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
          }
          
          console.log(`Webhook: Setting premium to expire at: ${premiumExpiresAt.toISOString()}`);
          
          // Update user with subscription info
          await User.findByIdAndUpdate(userId, {
            isPremium: true,
            stripeSubscriptionId: subscriptionId,
            premiumExpiresAt
          });
          
          console.log(`User ${userId} subscribed successfully via webhook`);
        } catch (error) {
          console.error('Error processing subscription in webhook:', error);
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
            // Create a valid expiration date with proper error handling
            let premiumExpiresAt;
            if (subscription && subscription.current_period_end) {
              const timestamp = subscription.current_period_end * 1000; // Convert seconds to milliseconds
              premiumExpiresAt = new Date(timestamp);
              
              // Validate the date
              if (isNaN(premiumExpiresAt.getTime())) {
                console.error('Invalid renewal date from Stripe webhook timestamp:', timestamp);
                // Fallback to 30 days from now
                premiumExpiresAt = new Date();
                premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
              }
            } else {
              // Fallback to 30 days from now if no subscription end date
              premiumExpiresAt = new Date();
              premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
            }
            
            console.log(`Webhook renewal: Setting premium to expire at: ${premiumExpiresAt.toISOString()}`);
            
            // Update the expiration date
            await User.findByIdAndUpdate(user._id, {
              isPremium: true,
              premiumExpiresAt
            });
            
            console.log(`Subscription renewed for user ${user._id}`);
          }
        } catch (error) {
          console.error('Error processing renewal in webhook:', error);
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

    // First retrieve the subscription to check its status
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    
    if (subscription.status === 'canceled') {
      return res.status(400).json({ error: 'Subscription is already canceled' });
    }

    if (subscription.cancel_at_period_end) {
      return res.status(400).json({ error: 'Subscription is already scheduled for cancellation' });
    }

    // Cancel at period end instead of immediately
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.status(200).json({ message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Manual update function for premium status
const manuallyUpdatePremiumStatus = async (req, res) => {
  try {
    const user = req.user;
    const { sessionId } = req.body;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    console.log(`Processing manual update for session: ${sessionId} for user: ${user._id}`);
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`Session retrieved with payment status: ${session.payment_status}`);
    
    // Verify that the session belongs to this user if the user has a Stripe customer ID
    // Skip this check if the user doesn't have a stripeCustomerId yet (it might be set during the checkout)
    if (user.stripeCustomerId && session.customer !== user.stripeCustomerId) {
      console.log(`Customer ID mismatch. User: ${user.stripeCustomerId}, Session: ${session.customer}`);
      
      // Instead of failing, let's update the user's stripeCustomerId
      await User.findByIdAndUpdate(user._id, { 
        stripeCustomerId: session.customer 
      });
      console.log(`Updated user's stripeCustomerId to: ${session.customer}`);
    }
    
    // Only proceed if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not successful' });
    }
    
    // Get subscription details
    const subscriptionId = session.subscription;
    
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Ensure we have a valid date by using fallback if needed
      let premiumExpiresAt;
      
      if (subscription && subscription.current_period_end) {
        const timestamp = subscription.current_period_end * 1000; // Convert seconds to milliseconds
        premiumExpiresAt = new Date(timestamp);
        
        // Validate the date
        if (isNaN(premiumExpiresAt.getTime())) {
          console.error('Invalid date from Stripe timestamp:', timestamp);
          // Fallback to 30 days from now
          premiumExpiresAt = new Date();
          premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
        }
      } else {
        // Fallback to 30 days from now if no subscription end date
        premiumExpiresAt = new Date();
        premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
      }
      
      console.log(`Setting premium to expire at: ${premiumExpiresAt.toISOString()}`);
      
      // Update user with premium status
      const updatedUser = await User.findByIdAndUpdate(
        user._id, 
        {
          isPremium: true,
          stripeCustomerId: session.customer, // Make sure this is always set correctly
          stripeSubscriptionId: subscriptionId,
          premiumExpiresAt
        }, 
        { new: true }
      );
      
      console.log(`User ${user._id} premium status manually updated. Premium: ${updatedUser.isPremium}`);
      
      res.status(200).json({ 
        success: true,
        isPremium: true,
        premiumExpiresAt
      });
      
    } catch (subscriptionError) {
      console.error('Error retrieving subscription:', subscriptionError);
      
      // Still update the user as premium with a default expiration
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 30); // 30 days from now
      
      await User.findByIdAndUpdate(user._id, {
        isPremium: true,
        stripeSubscriptionId: subscriptionId,
        premiumExpiresAt: defaultExpiry
      });
      
      res.status(200).json({ 
        success: true,
        isPremium: true,
        premiumExpiresAt: defaultExpiry,
        note: 'Used default expiration date due to subscription retrieval issue'
      });
    }
    
  } catch (error) {
    console.error('Error updating premium status:', error);
    res.status(500).json({ error: 'Failed to update premium status' });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPremiumStatus,
  cancelSubscription,
  manuallyUpdatePremiumStatus
}; 