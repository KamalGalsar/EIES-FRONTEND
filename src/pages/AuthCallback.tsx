// Handles the redirect from backend after OAuth completes.
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const processed = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const email = searchParams.get('email') ?? '';
    const name = searchParams.get('name') ?? '';
    const provider = searchParams.get('provider') ?? '';
    const role = searchParams.get('role') ?? 'User';
    const error = searchParams.get('error');
    const mode = searchParams.get('mode') ?? 'signin';

    // Error handling
    if (error) {
      logout(); // clear any stale session

      let message = '';
      let redirectPath = '/signin';

      switch (error) {
        case 'user_exists':
          message = 'An account with this email already exists. Please sign in instead.';
          redirectPath = '/signin';
          break;
        case 'user_not_found':
          message = 'No account found with this email. Please sign up first.';
          redirectPath = '/signup';
          break;
        case 'email_not_found':
          message = 'Could not retrieve your email from the provider. Please try again.';
          redirectPath = mode === 'signup' ? '/signup' : '/signin';
          break;
        case 'different_provider':
          message = 'This email is already registered with a different provider. Please sign in using that provider.';
          redirectPath = '/signin';
          break;
        default:
          message = 'Authentication failed. Please try again.';
          redirectPath = '/signin';
      }

      showToast(message, 'error');
      setErrorMsg(message);
      setTimeout(() => navigate(redirectPath, { replace: true }), 2000);
      return;
    }

    // Success
    if (accessToken && refreshToken) {
      const decodedEmail = decodeURIComponent(email);
      const decodedName = decodeURIComponent(name);

      login({
        accessToken,
        refreshToken,
        email: decodedEmail,
        name: decodedName,
        provider,
        role,
      });

      showToast(
        mode === 'signup' ? 'Account created successfully' : 'Signed in successfully',
        'success'
      );
      navigate('/', { replace: true });
      return;
    }

    // No error and no tokens – unexpected
    logout();
    showToast('Sign-in did not complete. Please try again.', 'error');
    setErrorMsg('Sign-in did not complete. Please try again.');
    setTimeout(() => navigate('/signin', { replace: true }), 2000);
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <p className="text-gray-800 dark:text-gray-200 font-medium text-lg">{errorMsg}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Completing sign-in…</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">You will be redirected automatically.</p>
      </div>
    </div>
  );
}