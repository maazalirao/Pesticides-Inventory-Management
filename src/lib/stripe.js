import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the publishable key
// Note: This is the public key which is safe to include in client-side code
const stripePromise = loadStripe('pk_test_51Q94VJRqkjizJVQiIfDhcxvfiQCNOM9PjNc2vZuYCbtGFNBTk5My5s9S6CK9BjhAZc6CXcQ03ESNM8OqNu9onanr001wenfmCB');

export default stripePromise; 