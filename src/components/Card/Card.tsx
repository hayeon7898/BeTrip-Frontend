import type { HTMLAttributes, ReactNode } from 'react';
import Badge from '../Badge/Badge';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  thumbnail?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** D-day 등 카드 우측에 표시할 작은 배지 */
  badge?: ReactNode;
  /** 전달 시 배지 옆에 삭제(×) 버튼이 표시되고, 클릭 시 카드 자체의 onClick으로는 전파되지 않습니다 */
  onDelete?: () => void;
  children?: ReactNode;
}

export default function Card({
  thumbnail,
  title,
  subtitle,
  badge,
  onDelete,
  children,
  className,
  ...rest
}: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(' ');
  const hasActions = badge !== undefined || Boolean(onDelete);

  return (
    <div className={classes} {...rest}>
      <div className={styles.thumbnail}>{thumbnail}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        {children}
      </div>
      {hasActions && (
        <div className={styles.actions}>
          {badge !== undefined && <Badge tone="info">{badge}</Badge>}
          {onDelete && (
            <button
              type="button"
              className={styles.deleteButton}
              aria-label="삭제"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
