import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Chip from '../components/Chip/Chip';
import Alert from '../components/Alert/Alert';
import styles from './CreatePlanPage.module.css';

interface Option {
  label: string;
  value: string;
}

const regionOptions: Option[] = [
  { label: '🏙️ 서울', value: 'SEOUL' },
  { label: '🌊 강릉', value: 'GANGNEUNG' },
  { label: '🏯 전주', value: 'JEONJU' },
  { label: '🔬 대전', value: 'DAEJEON' },
  { label: '🌉 부산', value: 'BUSAN' },
  { label: '🌴 제주도', value: 'JEJU' },
];

const timeOfDayOptions: Option[] = [
  { label: '🌅 아침', value: 'MORNING' },
  { label: '☀️ 점심', value: 'LUNCH' },
  { label: '🌇 저녁', value: 'DINNER' },
];

const transportOptions: Option[] = [
  { label: '🚗 차', value: 'CAR' },
  { label: '🚌 대중교통', value: 'PUBLIC_TRANSPORT' },
  { label: '🚶 도보', value: 'WALK' },
];

const purposeOptions: Option[] = [
  { label: '👬 친구', value: 'FRIEND' },
  { label: '👨‍👩‍👧‍👦 가족', value: 'FAMILY' },
  { label: '💑 연인', value: 'COUPLE' },
  { label: '🐾 반려동물', value: 'PET' },
  { label: '🧓 부모님', value: 'PARENTS' },
];

const styleOptions: Option[] = [
  { label: '🏄 액티비티', value: 'ACTIVITY' },
  { label: '🌿 자연', value: 'NATURE' },
  { label: '📸 관광', value: 'TOURISM' },
  { label: '🏖️ 휴양', value: 'RELAXATION' },
  { label: '🍽️ 맛집', value: 'FOOD' },
];

function getStayLabel(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;
  const nights = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (nights < 0) return null;
  return `${nights}박 ${nights + 1}일`;
}

function RequiredLabel({ children }: { children: string }) {
  return (
    <Typography variant="h3" className={styles.sectionLabel}>
      {children}
      <span className={styles.required}>*</span>
    </Typography>
  );
}

export default function CreatePlanPage() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [departureTime, setDepartureTime] = useState<string | null>(null);
  const [transport, setTransport] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [travelStyles, setTravelStyles] = useState<string[]>([]);

  const isDateRangeInvalid = Boolean(startDate && endDate && endDate < startDate);
  const isRequiredMissing = !startDate || !endDate || !region || !arrivalTime || !departureTime;
  const isSubmitDisabled = isRequiredMissing || isDateRangeInvalid;
  const stayLabel = !isDateRangeInvalid ? getStayLabel(startDate, endDate) : null;

  const toggleStyle = (value: string) =>
    setTravelStyles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const handleCreatePlan = () => {
    const iId = `dev-${Date.now()}`;
    navigate(`/place?iId=${iId}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <Typography variant="h1">여행 일정 만들기</Typography>
          <Typography variant="body" color="secondary" className={styles.subtitle}>
            몇 가지만 알려주시면 딱 맞는 장소를 추천해드려요
          </Typography>
        </div>

        <div className={styles.section}>
          <RequiredLabel>여행 기간</RequiredLabel>
          <div className={styles.dateRow}>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
            <Typography variant="body" color="tertiary" className={styles.dateSeparator}>
              -
            </Typography>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          {isDateRangeInvalid && (
            <Alert variant="error" className={styles.dateError}>
              종료일은 시작일보다 빠를 수 없어요
            </Alert>
          )}
          <Typography
            variant="body"
            className={styles.stayLabel}
            style={{ visibility: stayLabel ? 'visible' : 'hidden' }}
          >
            {stayLabel ?? ' '}
          </Typography>
        </div>

        <div className={styles.section}>
          <RequiredLabel>여행 지역</RequiredLabel>
          <div className={styles.chipRow}>
            {regionOptions.map((option) => (
              <Chip
                key={option.value}
                selected={region === option.value}
                onClick={() => setRegion(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <RequiredLabel>도착 시간 (1일차)</RequiredLabel>
          <div className={styles.chipRow}>
            {timeOfDayOptions.map((option) => (
              <Chip
                key={option.value}
                selected={arrivalTime === option.value}
                onClick={() => setArrivalTime(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <RequiredLabel>출발 시간 (마지막날)</RequiredLabel>
          <div className={styles.chipRow}>
            {timeOfDayOptions.map((option) => (
              <Chip
                key={option.value}
                selected={departureTime === option.value}
                onClick={() => setDepartureTime(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h3" className={styles.sectionLabel}>
            이동수단
          </Typography>
          <div className={styles.chipRow}>
            {transportOptions.map((option) => (
              <Chip
                key={option.value}
                selected={transport === option.value}
                onClick={() =>
                  setTransport((prev) => (prev === option.value ? null : option.value))
                }
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h3" className={styles.sectionLabel}>
            여행 목적
          </Typography>
          <div className={styles.chipRow}>
            {purposeOptions.map((option) => (
              <Chip
                key={option.value}
                selected={purpose === option.value}
                onClick={() => setPurpose((prev) => (prev === option.value ? null : option.value))}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.lastSection}>
          <Typography variant="h3" className={styles.sectionLabel}>
            여행 스타일
            <span className={styles.hint}>(복수 선택)</span>
          </Typography>
          <div className={styles.chipRow}>
            {styleOptions.map((option) => (
              <Chip
                key={option.value}
                selected={travelStyles.includes(option.value)}
                onClick={() => toggleStyle(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className={styles.submitButton}
          disabled={isSubmitDisabled}
          onClick={handleCreatePlan}
        >
          일정 만들기
        </Button>
      </div>
    </div>
  );
}
