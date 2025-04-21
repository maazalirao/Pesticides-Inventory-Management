import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../api/stripeHandler';

const CheckoutForm = ({ amount = 1000, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    // Create a payment intent when the form is mounted
    const fetchPaymentIntent = async () => {
      try {
        const paymentIntent = await createPaymentIntent(amount);
        setClientSecret(paymentIntent.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initiate payment. Please try again later.');
        if (onError) onError(err);
      }
    };

    fetchPaymentIntent();
  }, [amount, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    // For demo purposes, we're using a simulated clientSecret
    // In a real application, you would use the actual clientSecret
    const payload = clientSecret.startsWith('demo_') 
      ? { paymentMethod: { id: 'pm_card_visa' } } // Simulate success for demo
      : await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
      if (onError) onError(payload.error);
    } else {
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      if (onSuccess) onSuccess(payload);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="form-group">
        <label htmlFor="card-element">Credit or debit card</label>
        <div className="card-element-container">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>
      
      {error && (
        <div className="card-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe || succeeded}
        className="pay-button"
      >
        {processing ? 'Processing...' : `Pay PKR ${(amount / 100).toFixed(2)}`}
      </button>

      {succeeded && (
        <div className="payment-success">
          Payment successful! Thank you for your purchase.
        </div>
      )}

      <style jsx>{`
        .stripe-form {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          background-color: white;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .card-element-container {
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }
        
        .card-error {
          color: #fa755a;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .pay-button {
          background-color: #4f46e5;
          color: white;
          padding: 12px 16px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.2s ease;
        }
        
        .pay-button:hover {
          background-color: #4338ca;
        }
        
        .pay-button:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
        
        .payment-success {
          margin-top: 20px;
          padding: 10px;
          background-color: #dcfce7;
          color: #166534;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </form>
  );
};

export default CheckoutForm; 