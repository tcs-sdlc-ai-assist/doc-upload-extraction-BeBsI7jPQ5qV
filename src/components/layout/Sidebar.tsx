import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
  { label: 'Upload', path: ROUTES.UPLOAD, icon: '📤' },
  { label: 'History', path: ROUTES.HISTORY, icon: '📁' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = useCallback(
    (path: string): boolean => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  const handleNavClick = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, path: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(path);
      }
    },
    [navigate]
  );

  return (
    <aside
      className="w-64 bg-white border-r border-neutral-200 min-h-screen-content flex flex-col"
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className="flex flex-col py-4">
        <ul className="space-y-1 px-3" role="list">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <li key={item.path} role="listitem">
                <button
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  onKeyDown={(e) => handleKeyDown(e, item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                    active
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  aria-current={active ? 'page' : undefined}
                  aria-label={`Navigate to ${item.label}`}
                  tabIndex={0}
                >
                  <span className="text-lg" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-3 py-4 border-t border-neutral-200">
        <div className="px-4 py-2">
          <p className="text-xs text-neutral-400">
            Supported formats: PDF, DOCX, TXT
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Max file size: 10 MB
          </p>
        </div>
      </div>
    </aside>
  );
}