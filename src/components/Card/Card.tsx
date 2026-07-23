import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  thumbnail?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

export default function Card({ thumbnail, title, subtitle, children, className, ...rest }: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      <div className={styles.thumbnail}>{thumbnail}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}
