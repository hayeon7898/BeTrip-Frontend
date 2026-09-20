import type { FormEvent, ReactNode } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  /** 검색바와 같은 배경/알약 모양 안에 넣을 오른쪽 요소 (예: 닫기 버튼) */
  rightSlot?: ReactNode;
}

export default function SearchBar({
  value,
  placeholder = '검색어를 입력하세요',
  onChange,
  onSubmit,
  className,
  rightSlot,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim()) {
      onSubmit?.(value.trim());
    }
  };

  return (
    <form className={[styles.searchBar, className].filter(Boolean).join(' ')} onSubmit={handleSubmit}>
      <svg
        className={styles.icon}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        className={styles.input}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {rightSlot}
    </form>
  );
}