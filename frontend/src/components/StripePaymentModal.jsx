import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../api/axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51234567890123456789012345');

function StripePaymentModal({ isOpen, amount, onClose, onSuccess }) {
    return (
        isOpen && (
            <div style={modalOverlayStyle} onClick={onClose}>
                <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                    <h2 style={modalTitleStyle}>💳 Plată cu Stripe</h2>
                    <p style={modalDescStyle}>Suma de plătit: <strong>{amount.toFixed(2)} RON</strong></p>
                    <Elements stripe={stripePromise}>
                        <StripePaymentForm amount={amount} onClose={onClose} onSuccess={onSuccess} />
                    </Elements>
                </div>
            </div>
        )
    );
}

function StripePaymentForm({ amount, onClose, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Create payment intent pe backend
            const { data: intentData } = await API.post('/expenses/create-payment-intent', {
                amount: amount
            });

            // 2. Confirm payment cu Stripe
            const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
                intentData.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    }
                }
            );

            if (stripeError) {
                setError(stripeError.message);
                setLoading(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // 3. Confirm pe backend
                const { data: confirmData } = await API.post('/expenses/confirm-payment', {
                    paymentIntentId: paymentIntent.id,
                    amount: amount
                });

                alert(confirmData.message);
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <div style={cardElementStyle}>
                <CardElement 
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': { color: '#aab7c4' },
                            },
                            invalid: { color: '#9e2146' },
                        },
                    }}
                />
            </div>
            
            {error && <div style={errorMessageStyle}>{error}</div>}
            
            <div style={buttonGroupStyle}>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    style={cancelButtonStyle}
                >
                    Anulează
                </button>
                <button
                    type="submit"
                    disabled={loading || !stripe}
                    style={{...confirmButtonStyle, opacity: loading ? 0.6 : 1}}
                >
                    {loading ? '⏳ Se procesează...' : '✓ Plătește acum'}
                </button>
            </div>
        </form>
    );
}

// Styles
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
};

const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '450px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
};

const modalTitleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 12px 0',
};

const modalDescStyle = {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 24px 0',
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
};

const cardElementStyle = {
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f7fafc',
};

const errorMessageStyle = {
    padding: '12px',
    backgroundColor: '#fed7d7',
    borderLeft: '4px solid #fc8181',
    color: '#c53030',
    fontSize: '14px',
    borderRadius: '4px',
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
};

const cancelButtonStyle = {
    padding: '10px 24px',
    fontSize: '14px',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#2d3748',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
};

const confirmButtonStyle = {
    padding: '10px 24px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#48bb78',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
};

export default StripePaymentModal;
