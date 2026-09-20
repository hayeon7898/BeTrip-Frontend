import type { ButtonHTMLAttributes } from 'react';
import styles from './Chip.module.css';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export default function Chip({ selected = false, className, ...rest }: ChipProps) {
  const classes = [styles.base, selected ? styles.selected : styles.default, className]
    .filter(Boolean)
    .join(' ');

  return <button type="button" className={classes} aria-pressed={selected} {...rest} />;
}
