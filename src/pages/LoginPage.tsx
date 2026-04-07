import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { ROUTES } from '../constants';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Document Upload & Extraction
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(ROUTES.SIGNUP)}
                className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition-colors"
                aria-label="Navigate to signup page"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}