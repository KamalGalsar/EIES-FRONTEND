// Handles the redirect from backend after OAuth completes.
// Backend sends: /auth-callback?accessToken=…&refreshToken=…&email=…&name=…&provider=…&mode=…&role=…
// On error:      /auth-callback?error=…&provider=…
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const { showToast }  = useToast();
  const processed      = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken  = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const email        = searchParams.get('email')    ?? '';
    const name         = searchParams.get('name')     ?? '';
    const provider     = searchParams.get('provider') ?? '';
    const role         = searchParams.get('role')     ?? 'User';
    const error        = searchParams.get('error');
    const mode         = searchParams.get('mode')     ?? 'signin';

    console.log('[AuthCallback]', { hasTokens: !!(accessToken && refreshToken), error, mode, provider, role });

    //  Error handling
    if (error) {
      if (error === 'user_exists') {
        alert('An account with this email already exists. Please sign in instead.');
        navigate('/signin', { replace: true });
      } else if (error === 'user_not_found') {
        alert('No account found with this email. Please sign up first.');
        navigate('/signup', { replace: true });
      } else if (error === 'email_not_found') {
        alert('Could not retrieve your email from the provider. Please try again.');
        navigate(mode === 'signup' ? '/signup' : '/signin', { replace: true });
      } else {
        alert(`Authentication failed. Please try again.`);
        navigate('/signin', { replace: true });
      }
      return;
    }

    // Success 
    if (accessToken && refreshToken) {
      // Decode URI-encoded values from backend
      const decodedEmail = decodeURIComponent(email);
      const decodedName  = decodeURIComponent(name);

      // Store tokens and update auth state
      login({ 
        accessToken, 
        refreshToken, 
        email: decodedEmail, 
        name: decodedName, 
        provider, 
        role
      });

      // Show toast based on mode
      if (mode === 'signup') {
        showToast('Account created successfully', 'success');
      } else {
        showToast('Signed in successfully', 'success');
      }

      // Navigate to home
      navigate('/', { replace: true });
      return;
    }

    // Unexpected state
    console.error('[AuthCallback] No tokens and no error in URL');
    alert('Sign-in did not complete. Please try again.');
    navigate('/signin', { replace: true });

  }, []); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
          Completing sign-in…
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          You will be redirected automatically.
        </p>
      </div>
    </div>
  );
}