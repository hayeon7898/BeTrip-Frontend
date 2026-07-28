import styles from './Toast.module.css';
import type { ToastItem } from './ToastContext';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const classes = [styles.toast, styles[toast.variant]].join(' ');

  return (
    <div className={classes} role="status">
      <span>{toast.message}</span>
      <button className={styles.close} onClick={() => onDismiss(toast.id)} aria-label="닫기">
        ×
      </button>
    </div>
  );
}
