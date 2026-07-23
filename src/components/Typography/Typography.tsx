import type { ElementType, ReactNode } from 'react';
import styles from './Typography.module.css';

export type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption';
export type TypographyColor = 'primary' | 'secondary' | 'tertiary';

const DEFAULT_TAG: Record<TypographyVariant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  caption: 'span',
};

interface TypographyProps {
  variant: TypographyVariant;
  as?: ElementType;
  color?: TypographyColor;
  className?: string;
  children: ReactNode;
}

export default function Typography({
  variant,
  as,
  color = 'primary',
  className,
  children,
}: TypographyProps) {
  const Tag = as ?? DEFAULT_TAG[variant];
  const classes = [styles[variant], styles[`color-${color}`], className].filter(Boolean).join(' ');

  return <Tag className={classes}>{children}</Tag>;
}
