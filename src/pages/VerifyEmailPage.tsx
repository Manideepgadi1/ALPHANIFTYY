import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email.');
        return;
      }

      try {
        const response = await fetch(`https://app.vsfintech.in/alphanifty/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Redirect to sign-in after 3 seconds
          setTimeout(() => {
            navigate('/sign-in', { 
              state: { message: 'Email verified! You can now sign in.' } 
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <Loader className="w-20 h-20 text-primary animate-spin" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Verifying Your Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Email Verified!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Redirecting to sign in...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Verification Failed</h1>
              <p className="text-gray-600 mb-8">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary-50 transition-colors"
                >
                  Register Again
                </button>
                <button
                  onClick={() => navigate('/sign-in')}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
