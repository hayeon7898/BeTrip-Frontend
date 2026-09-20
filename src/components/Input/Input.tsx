import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...rest }: InputProps) {
  const classes = [styles.input, className].filter(Boolean).join(' ');

  return <input className={classes} {...rest} />;
}
