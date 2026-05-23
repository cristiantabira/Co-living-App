const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890123456789012345');

const createPaymentIntent = async (amount, currency = 'ron', metadata = {}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency: currency.toLowerCase(),
            metadata: metadata,
        });
        return paymentIntent;
    } catch (error) {
        console.error('Stripe Error:', error);
        throw error;
    }
};

const confirmPaymentIntent = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Stripe Error:', error);
        throw error;
    }
};

module.exports = {
    createPaymentIntent,
    confirmPaymentIntent,
};
