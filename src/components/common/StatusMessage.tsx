import { useStatusContext } from '../../contexts/StatusContext';

const typeStyles: Record<string, { container: string; icon: string }> = {
  success: {
    container: 'bg-success-50 border-success-500 text-success-700',
    icon: '✓',
  },
  error: {
    container: 'bg-error-50 border-error-500 text-error-700',
    icon: '✕',
  },
  info: {
    container: 'bg-info-50 border-info-500 text-info-700',
    icon: 'ℹ',
  },
  warning: {
    container: 'bg-warning-50 border-warning-500 text-warning-700',
    icon: '⚠',
  },
};

export function StatusMessage() {
  const { statusMessage, clearStatus } = useStatusContext();

  if (!statusMessage) {
    return (
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status" />
    );
  }

  const styles = typeStyles[statusMessage.type] ?? typeStyles.info;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className="animate-slide-up"
    >
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border-l-4 px-4 py-3 shadow-card ${styles.container}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 text-lg font-bold" aria-hidden="true">
            {styles.icon}
          </span>
          <p className="text-sm font-medium">{statusMessage.message}</p>
        </div>
        <button
          type="button"
          onClick={clearStatus}
          className="flex-shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1"
          aria-label="Dismiss notification"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ✕
          </span>
        </button>
      </div>
    </div>
  );
}