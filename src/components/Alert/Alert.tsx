import type { HTMLAttributes } from 'react';
import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export default function Alert({ variant = 'info', className, ...rest }: AlertProps) {
  const classes = [styles.base, styles[variant], className].filter(Boolean).join(' ');

  return <div className={classes} {...rest} />;
}
