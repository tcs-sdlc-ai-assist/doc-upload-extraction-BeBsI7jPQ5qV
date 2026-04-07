import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-soft sm:px-6 lg:px-8"
      role="banner"
    >
      <div className="flex items-center gap-3">
        <a
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 text-xl font-bold text-primary-700 transition-colors hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg px-1"
          aria-label="Go to dashboard"
        >
          <svg
            className="h-7 w-7 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
          <span className="hidden sm:inline">DocExtract</span>
        </a>
      </div>

      {isAuthenticated && user && (
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2"
            aria-label={`Logged in as ${user.username}`}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
              aria-hidden="true"
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-medium text-neutral-700 sm:inline">
              {user.username}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-error-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Log out of your account"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
              />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}