import { createContext } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

export interface ShowToastOptions {
  variant?: ToastVariant;
  message: string;
}

export interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
