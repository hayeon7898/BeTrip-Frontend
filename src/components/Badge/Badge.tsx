import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export default function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  const classes = [styles.base, styles[tone], className].filter(Boolean).join(' ');

  return <span className={classes} {...rest} />;
}
