import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      
      // Check response code from PHP backend
      if (response.code === 8) {
        // Success - OTP sent
        toast.success('Password reset instructions sent to your email!');
        onBack();
      } else if (response.code === 9) {
        // Invalid email
        toast.error('Invalid email address');
      } else if (response.code === 10) {
        // Email sending failed
        toast.error('Failed to send email. Please try again later.');
      } else {
        // Other errors
        toast.error('An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={onBack}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Back to login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 