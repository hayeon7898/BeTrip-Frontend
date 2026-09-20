import Button from '../Button/Button';
import styles from './DayTabs.module.css';

interface DayTabsProps {
  totalDays: number;
  activeDay: number;
  onSelect: (day: number) => void;
}

export default function DayTabs({ totalDays, activeDay, onSelect }: DayTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="일차 선택">
      {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => (
        <Button
          key={day}
          role="tab"
          aria-selected={activeDay === day}
          variant={activeDay === day ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onSelect(day)}
        >
          {`Day ${day}`}
        </Button>
      ))}
    </div>
  );
}