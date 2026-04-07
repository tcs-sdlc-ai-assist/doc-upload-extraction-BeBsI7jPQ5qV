import { useState, useCallback, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStatusContext } from '../../contexts/StatusContext';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login } = useAuth();
  const { showError } = useStatusContext();

  const validateForm = useCallback((): string | null => {
    if (!username.trim()) {
      return 'Username is required.';
    }
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (username.trim().length > 32) {
      return 'Username must be no more than 32 characters.';
    }
    if (!/^[a-zA-Z0-9]+$/.test(username.trim())) {
      return 'Username must contain only alphanumeric characters.';
    }
    if (!password) {
      return 'Password is required.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (password.length > 64) {
      return 'Password must be no more than 64 characters.';
    }
    return null;
  }, [username, password]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setFormError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, validateForm, login, showError]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-6"
      noValidate
      aria-label="Login form"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="login-username"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Username
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="Enter your username"
            autoComplete="username"
            required
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={formError !== null && formError.toLowerCase().includes('username')}
            aria-describedby={formError ? 'login-error' : undefined}
            className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={formError !== null && formError.toLowerCase().includes('password')}
            aria-describedby={formError ? 'login-error' : undefined}
            className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
        </div>
      </div>

      {formError && (
        <div
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="p-3 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm"
        >
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}