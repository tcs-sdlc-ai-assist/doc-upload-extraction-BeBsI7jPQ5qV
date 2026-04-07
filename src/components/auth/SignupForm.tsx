import { useState, useCallback, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStatusContext } from '../../contexts/StatusContext';

export function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { signup } = useAuth();
  const { showSuccess, showError } = useStatusContext();

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
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  }, [username, password, confirmPassword]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      showError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(username.trim(), password);
      showSuccess('Account created successfully! Welcome.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setFormError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, validateForm, signup, showSuccess, showError]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-6"
      noValidate
      aria-label="Sign up form"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="signup-username"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Username
          </label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFormError(null);
            }}
            placeholder="Enter a username"
            required
            minLength={3}
            maxLength={32}
            autoComplete="username"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={formError !== null && formError.toLowerCase().includes('username')}
            aria-describedby="signup-username-hint"
            className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <p id="signup-username-hint" className="mt-1 text-xs text-neutral-500">
            3–32 alphanumeric characters
          </p>
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormError(null);
            }}
            placeholder="Enter a password"
            required
            minLength={6}
            maxLength={64}
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={formError !== null && formError.toLowerCase().includes('password') && !formError.toLowerCase().includes('match')}
            aria-describedby="signup-password-hint"
            className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <p id="signup-password-hint" className="mt-1 text-xs text-neutral-500">
            6–64 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFormError(null);
            }}
            placeholder="Confirm your password"
            required
            minLength={6}
            maxLength={64}
            autoComplete="new-password"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={formError !== null && formError.toLowerCase().includes('match')}
            aria-describedby="signup-confirm-hint"
            className="w-full px-4 py-2 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <p id="signup-confirm-hint" className="mt-1 text-xs text-neutral-500">
            Must match the password above
          </p>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm"
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
        {isSubmitting ? 'Creating account…' : 'Sign Up'}
      </button>
    </form>
  );
}