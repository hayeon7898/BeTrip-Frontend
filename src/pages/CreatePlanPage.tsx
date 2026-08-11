import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Typography from '../components/Typography/Typography';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import Chip from '../components/Chip/Chip';
import { useToast } from '../components/Toast/useToast';
import { createItineraryConditions } from '../api/itineraries';
import type { Purpose, TimeSlot, TravelStyle } from '../api/itineraries';
import { ApiClientError } from '../api/client';
import { getDayDiff, getTodayKST } from '../utils/date';
import styles from './CreatePlanPage.module.css';

const MAX_NIGHTS = 13;

interface Option {
  label: string;
  value: string;
}

const regionOptions: Option[] = [
  { label: '🏙️ 서울', value: '서울' },
  { label: '🌊 강릉', value: '강릉' },
  { label: '🏯 전주', value: '전주' },
  { label: '🔬 대전', value: '대전' },
  { label: '🌉 부산', value: '부산' },
  { label: '🌴 제주도', value: '제주' },
];

const timeOfDayOptions: Option[] = [
  { label: '🌅 아침', value: 'MORNING' },
  { label: '☀️ 점심', value: 'LUNCH' },
  { label: '🌇 저녁', value: 'EVENING' },
];

const transportOptions: Option[] = [
  { label: '🚗 차', value: 'CAR' },
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
  { label: '📸 관광', value: 'SIGHTSEEING' },
  { label: '🏖️ 휴양', value: 'RELAXATION' },
  { label: '🍽️ 맛집', value: 'FOOD' },
];

function getNights(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  return getDayDiff(startDate, endDate);
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
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [departureTime, setDepartureTime] = useState<string | null>(null);
  const [transport, setTransport] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [travelStyles, setTravelStyles] = useState<string[]>([]);

  const today = getTodayKST();
  const nights = getNights(startDate, endDate);

  const isStartInPast = Boolean(startDate && startDate < today);
  const isDateRangeInvalid = nights !== null && nights < 0;
  const isMaxDurationExceeded = nights !== null && nights > MAX_NIGHTS;

  const dateErrorMessage = isStartInPast
    ? '시작일은 오늘 이후 날짜로 선택해주세요'
    : isDateRangeInvalid
      ? '종료일은 시작일보다 빠를 수 없어요'
      : isMaxDurationExceeded
        ? `최대 ${MAX_NIGHTS}박 ${MAX_NIGHTS + 1}일까지 선택할 수 있어요`
        : null;

  const stayLabel = !dateErrorMessage && nights !== null ? `${nights}박 ${nights + 1}일` : null;

  const arrivalIndex = arrivalTime ? timeOfDayOptions.findIndex((o) => o.value === arrivalTime) : -1;
  const departureIndex = departureTime
    ? timeOfDayOptions.findIndex((o) => o.value === departureTime)
    : -1;
  const isSameDayTimeInvalid =
    nights === 0 && arrivalIndex !== -1 && departureIndex !== -1 && departureIndex <= arrivalIndex;

  const isRequiredMissing = !startDate || !endDate || !region || !arrivalTime || !departureTime;
  const isSubmitDisabled =
    isRequiredMissing || isStartInPast || isDateRangeInvalid || isMaxDurationExceeded;

  const toggleStyle = (value: string) =>
    setTravelStyles((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const handleSelectArrivalTime = (value: string) => {
    const index = timeOfDayOptions.findIndex((o) => o.value === value);
    if (nights === 0 && departureIndex !== -1 && index >= departureIndex) {
      showToast({ variant: 'error', message: '당일치기는 도착 시간이 출발 시간보다 빨라야 해요' });
      return;
    }
    setArrivalTime(value);
  };

  const handleSelectDepartureTime = (value: string) => {
    const index = timeOfDayOptions.findIndex((o) => o.value === value);
    if (nights === 0 && arrivalIndex !== -1 && index <= arrivalIndex) {
      showToast({ variant: 'error', message: '당일치기는 출발 시간이 도착 시간보다 늦어야 해요' });
      return;
    }
    setDepartureTime(value);
  };

  const handleCreatePlan = async () => {
    if (isSameDayTimeInvalid) {
      showToast({ variant: 'error', message: '당일치기는 출발 시간이 도착 시간보다 늦어야 해요' });
      return;
    }

    try {
      const { itinerary_id } = await createItineraryConditions({
        start_date: startDate,
        end_date: endDate,
        region: region as string,
        arrival_time: arrivalTime as TimeSlot,
        departure_time: departureTime as TimeSlot,
        // WALK는 백엔드에 값이 없음(CAR가 아니면 도보로 처리) — 안 보내면 도보로 계산됨
        transportation: transport === 'CAR' ? 'CAR' : undefined,
        purpose: (purpose as Purpose) ?? undefined,
        styles: travelStyles as TravelStyle[],
      });
      navigate(`/place?iId=${itinerary_id}`);
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : '일정 생성 중 문제가 발생했어요';
      showToast({ variant: 'error', message });
    }
  };

  return (
    <div className={styles.page}>
      <Header />

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
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
            <Typography variant="body" color="tertiary" className={styles.dateSeparator}>
              -
            </Typography>
            <Input
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          {dateErrorMessage && (
            <Typography variant="body" className={styles.dateErrorLabel}>
              {dateErrorMessage}
            </Typography>
          )}
          {!dateErrorMessage && (
            <Typography
              variant="body"
              className={styles.stayLabel}
              style={{ visibility: stayLabel ? 'visible' : 'hidden' }}
            >
              {stayLabel ?? ' '}
            </Typography>
          )}
        </div>

        <div className={styles.section}>
          <RequiredLabel>여행 지역</RequiredLabel>
          <div className={styles.chipRow} role="group" aria-label="여행 지역 선택">
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
          <div className={styles.chipRow} role="group" aria-label="도착 시간 선택 (1일차)">
            {timeOfDayOptions.map((option) => (
              <Chip
                key={option.value}
                selected={arrivalTime === option.value}
                onClick={() => handleSelectArrivalTime(option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <RequiredLabel>출발 시간 (마지막날)</RequiredLabel>
          <div className={styles.chipRow} role="group" aria-label="출발 시간 선택 (마지막날)">
            {timeOfDayOptions.map((option) => (
              <Chip
                key={option.value}
                selected={departureTime === option.value}
                onClick={() => handleSelectDepartureTime(option.value)}
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
          <div className={styles.chipRow} role="group" aria-label="이동수단 선택">
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
          <div className={styles.chipRow} role="group" aria-label="여행 목적 선택">
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
          <div className={styles.chipRow} role="group" aria-label="여행 스타일 선택 (복수 선택)">
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