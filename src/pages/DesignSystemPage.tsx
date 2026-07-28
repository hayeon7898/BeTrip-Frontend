import { useState } from 'react';
import type { ReactNode } from 'react';
import styles from './DesignSystemPage.module.css';
import Typography from '../components/Typography/Typography';
import Button from '../components/Button/Button';
import Badge from '../components/Badge/Badge';
import Input from '../components/Input/Input';
import Select from '../components/Select/Select';
import Card from '../components/Card/Card';
import Alert from '../components/Alert/Alert';
import Chip from '../components/Chip/Chip';
import ConfirmModal from '../components/Modal/ConfirmModal';
import SearchBar from '../components/SearchBar/SearchBar';
import PlaceCard from '../components/PlaceCard/PlaceCard';
import PlaceListItem from '../components/PlaceListItem/PlaceListItem';
import DayTabs from '../components/DayTabs/DayTabs';
import { useToast } from '../components/Toast/useToast';
import type { ButtonSize, ButtonVariant } from '../components/Button/Button';
import type { BadgeTone } from '../components/Badge/Badge';
import type { AlertVariant } from '../components/Alert/Alert';
import type { TypographyVariant } from '../components/Typography/Typography';
import type { Place } from '../types/place';

type ColorToken = { name: string; hex: string; varName: string };

const colorGroups: ColorToken[][] = [
  [
    { name: 'Main (500)', hex: '#5260ed', varName: '--color-main-500' },
    { name: 'Sub (100)', hex: '#c9cef8', varName: '--color-sub-100' },
    { name: 'SSub (50)', hex: '#edeffd', varName: '--color-sub-50' },
  ],
  [
    { name: 'Text', hex: '#1b1c2b', varName: '--color-text' },
    { name: 'Text Secondary', hex: '#6b7086', varName: '--color-text-secondary' },
    { name: 'Text Tertiary', hex: '#a8adc4', varName: '--color-text-tertiary' },
    { name: 'Border', hex: '#e6e8f5', varName: '--color-border' },
  ],
  [
    { name: 'Success', hex: '#2fb380', varName: '--color-success' },
    { name: 'Warning', hex: '#f5a623', varName: '--color-warning' },
    { name: 'Error', hex: '#eb5757', varName: '--color-error' },
  ],
];

const typeScale: { variant: TypographyVariant; label: string; sample: string }[] = [
  { variant: 'display', label: 'Display · 32', sample: '가장 큰 제목입니다' },
  { variant: 'h1', label: 'H1 · 24', sample: '섹션 제목입니다' },
  { variant: 'h2', label: 'H2 · 20', sample: '서브 섹션 제목입니다' },
  { variant: 'h3', label: 'H3 · 17', sample: '카드/리스트 제목입니다' },
  { variant: 'body', label: 'Body · 15', sample: '본문에 사용하는 기본 텍스트입니다' },
  { variant: 'caption', label: 'Caption · 13', sample: '캡션, 보조 설명 텍스트입니다' },
];

const buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost'];
const buttonSizes: ButtonSize[] = ['sm', 'md', 'lg'];

const badgeSamples: { tone: BadgeTone; label: string }[] = [
  { tone: 'neutral', label: 'DRAFT' },
  { tone: 'info', label: 'GENERATED' },
  { tone: 'success', label: 'SAVED' },
  { tone: 'warning', label: 'WARNING' },
  { tone: 'error', label: 'ERROR' },
];

const alertSamples: { variant: AlertVariant; message: string }[] = [
  { variant: 'info', message: '일정이 생성되었습니다' },
  { variant: 'success', message: '저장이 완료되었습니다' },
  { variant: 'warning', message: '이동시간이 다시 계산됩니다' },
  { variant: 'error', message: '요청 처리 중 오류가 발생했습니다' },
];

// PlaceCard / PlaceListItem 미리보기 전용 더미 데이터입니다.
// PlacePage의 실제 mock 데이터(placeMockData.ts)와는 분리해서, 이 페이지가
// 특정 페이지 데이터에 의존하지 않고 항상 단독으로 렌더링되도록 했어요.
const placeDemoData: Place[] = [
  {
    id: 'demo-restaurant',
    name: '한강뷰 와인바',
    category: 'restaurant',
    rating: 4.8,
    tags: ['조용함', '한강뷰'],
    priceLabel: '4만원대',
    menuSummary: [],
    reviewSummary: '',
    photos: [],
  },
  {
    id: 'demo-cafe',
    name: '성수동 로스터리',
    category: 'cafe',
    rating: 4.5,
    tags: ['조용함', '원두 직접 로스팅'],
    priceLabel: '1만원 이하',
    menuSummary: [],
    reviewSummary: '',
    photos: [],
  },
];

function Section({
  title,
  usage,
  options,
  children,
}: {
  title: string;
  usage?: string;
  options?: { label: string; values: string[] }[];
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <Typography variant="h2" className={styles.sectionTitle}>
        {title}
      </Typography>
      {usage && (
        <div className={styles.usage}>
          <code>{usage}</code>
        </div>
      )}
      {options && (
        <div className={styles.optionList}>
          {options.map((o) => (
            <div key={o.label} className={styles.optionLine}>
              <span className={styles.optionLabel}>{o.label}</span>
              {o.values.join(' · ')}
            </div>
          ))}
        </div>
      )}
      {children}
    </section>
  );
}

const chipDemoOptions = ['힐링', '맛집', '관광'];

export default function DesignSystemPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [singleChip, setSingleChip] = useState<string | null>(chipDemoOptions[0]);
  const [multiChips, setMultiChips] = useState<string[]>([chipDemoOptions[0]]);
  const [searchDemoValue, setSearchDemoValue] = useState('');
  const [addedDemoIds, setAddedDemoIds] = useState<string[]>([]);
  const [listDemoItems, setListDemoItems] = useState<Place[]>(placeDemoData);
  const [dayTabsDemo, setDayTabsDemo] = useState(1);
  const { showToast } = useToast();

  return (
    <div className={styles.page}>
      <Typography variant="display" className={styles.pageTitle}>
        디자인 시스템
      </Typography>
      <Typography variant="body" color="secondary" className={styles.pageSubtitle}>
        색상/타이포/버튼 등 공통 토큰 — 모든 화면은 여기서 정의된 값만 사용합니다
      </Typography>

      <Section title="색상">
        <div className={styles.colorGroups}>
          {colorGroups.map((group, i) => (
            <div key={i} className={styles.colorGrid}>
              {group.map((c) => (
                <div key={c.varName}>
                  <div
                    className={styles.colorSwatch}
                    style={{ background: `var(${c.varName})` }}
                  />
                  <Typography variant="caption" className={styles.colorName}>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" color="tertiary" className={styles.colorHex}>
                    {c.hex}
                  </Typography>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="타이포그래피 (Pretendard)"
        usage='텍스트에는 Typography 컴포넌트를 사용하세요: <Typography variant="h1">제목</Typography>'
      >
        <div className={styles.typeList}>
          {typeScale.map((t) => (
            <div key={t.variant} className={styles.typeRow}>
              <Typography variant="caption" color="tertiary" className={styles.typeLabel}>
                {t.label}
              </Typography>
              <Typography variant={t.variant}>{t.sample}</Typography>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="버튼"
        usage='버튼에는 Button 컴포넌트를 사용하세요: <Button variant="primary" size="md">저장</Button>'
        options={[
          { label: 'variant', values: buttonVariants },
          { label: 'size', values: buttonSizes },
        ]}
      >
        <div className={styles.buttonRows}>
          {buttonVariants.map((variant) => (
            <div key={variant} className={styles.buttonRow}>
              <Typography variant="caption" color="secondary" className={styles.buttonRowLabel}>
                {variant}
              </Typography>
              {buttonSizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size}
                </Button>
              ))}
              <Button variant={variant} size="md" disabled>
                disabled
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="배지 / 태그"
        usage='상태 표시에는 Badge 컴포넌트를 사용하세요: <Badge tone="success">SAVED</Badge>'
        options={[{ label: 'tone', values: badgeSamples.map((b) => b.tone) }]}
      >
        <div className={styles.badgeRow}>
          {badgeSamples.map((b) => (
            <div key={b.tone} className={styles.badgeItem}>
              <Typography variant="caption" color="tertiary">
                {b.tone}
              </Typography>
              <Badge tone={b.tone}>{b.label}</Badge>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="폼 요소"
        usage='입력창에는 Input, 드롭다운에는 Select 컴포넌트를 사용하세요: <Input placeholder="텍스트 입력" />'
      >
        <div className={styles.formGroup}>
          <Input placeholder="텍스트 입력" />
          <Select defaultValue="">
            <option value="" disabled>
              드롭다운 선택
            </option>
            <option value="seoul">서울</option>
            <option value="busan">부산</option>
          </Select>
        </div>
      </Section>

      <Section
        title="검색바"
        usage='키워드 검색에는 SearchBar 컴포넌트를 사용하세요: <SearchBar value={value} onChange={setValue} onSubmit={handleSearch} placeholder="검색어를 입력하세요" /> · 오른쪽에 버튼 등을 같은 배경 안에 넣으려면 rightSlot prop 사용'
      >
        <SearchBar
          value={searchDemoValue}
          onChange={setSearchDemoValue}
          onSubmit={(query) => showToast({ variant: 'info', message: `'${query}' 검색 (예시)` })}
          placeholder="장소, 맛집, 카페 검색해서 바로 추가해보세요"
        />
        <Typography variant="caption" color="tertiary" className={styles.usage}>
          rightSlot 예시 (지도 위 검색바처럼 닫기 버튼이 필요할 때)
        </Typography>
        <SearchBar
          value=""
          onChange={() => undefined}
          placeholder="닫기 버튼이 있는 검색바"
          rightSlot={
            <button type="button" aria-label="닫기" onClick={() => showToast({ variant: 'info', message: '닫기 (예시)' })}>
              ×
            </button>
          }
        />
      </Section>

      <Section
        title="일차 탭 (DayTabs)"
        usage='PlanPage처럼 Day 1~N을 넘나드는 화면에는 DayTabs를 사용하세요: <DayTabs totalDays={4} activeDay={activeDay} onSelect={setActiveDay} />'
      >
        <DayTabs totalDays={4} activeDay={dayTabsDemo} onSelect={setDayTabsDemo} />
      </Section>

      <Section
        title="카드"
        usage='일정/장소 카드에는 Card 컴포넌트를 사용하세요: <Card title="제주도 힐링 여행" subtitle="제주도 · 2026.08.10 - 08.13" />'
      >
        <Card
          className={styles.cardDemo}
          title="제주도 힐링 여행"
          subtitle="제주도 · 2026.08.10 - 08.13"
        />
      </Section>

      <Section
        title="장소 카드 (PlaceCard)"
        usage='AI 추천/검색 결과처럼 담기 액션이 필요한 카드에는 PlaceCard를 사용하세요: <PlaceCard place={place} added={added} onAdd={handleAdd} onClick={handleOpenDetail} />'
      >
        <div className={styles.chipRow}>
          {placeDemoData.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              added={addedDemoIds.includes(place.id)}
              onAdd={(p) =>
                setAddedDemoIds((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]))
              }
              onClick={(p) => showToast({ variant: 'info', message: `${p.name} 상세보기 (예시)` })}
            />
          ))}
        </div>
      </Section>

      <Section
        title="장소 리스트 아이템 (PlaceListItem)"
        usage='담은 장소를 목록으로 보여줄 때는 PlaceListItem을 사용하세요: <PlaceListItem place={place} onClick={handleOpenDetail} onRemove={handleRemove} /> · 일정처럼 시간이 있으면 time prop 추가: <PlaceListItem place={place} time="08:30" ... />'
      >
        <div className={styles.typeList}>
          {listDemoItems.map((place, index) => (
            <PlaceListItem
              key={place.id}
              place={place}
              time={index === 0 ? '08:30' : undefined}
              onClick={(p) => showToast({ variant: 'info', message: `${p.name} 상세보기 (예시)` })}
              onRemove={(p) => setListDemoItems((prev) => prev.filter((item) => item.id !== p.id))}
            />
          ))}
          {listDemoItems.length === 0 && (
            <Typography variant="caption" color="tertiary">
              모두 삭제됨 — 새로고침하면 다시 보여요
            </Typography>
          )}
        </div>
      </Section>

      <Section
        title="선택 버튼 (Chip)"
        usage='단일/복수 선택 토글에는 Chip 컴포넌트를 사용하세요. 선택 로직(단일/복수)은 상위 컴포넌트에서 상태로 관리: <Chip selected={value === option} onClick={...}>{option}</Chip>'
      >
        <div className={styles.chipDemoGroup}>
          <Typography variant="caption" color="tertiary">
            단일 선택 (이동수단 등)
          </Typography>
          <div className={styles.chipRow}>
            {chipDemoOptions.map((option) => (
              <Chip
                key={option}
                selected={singleChip === option}
                onClick={() => setSingleChip(option)}
              >
                {option}
              </Chip>
            ))}
          </div>
        </div>
        <div className={styles.chipDemoGroup}>
          <Typography variant="caption" color="tertiary">
            복수 선택 (여행 목적/스타일 등)
          </Typography>
          <div className={styles.chipRow}>
            {chipDemoOptions.map((option) => (
              <Chip
                key={option}
                selected={multiChips.includes(option)}
                onClick={() =>
                  setMultiChips((prev) =>
                    prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
                  )
                }
              >
                {option}
              </Chip>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="알림"
        usage='정적 알림에는 Alert를, 잠깐 떴다 사라지는 알림에는 useToast()를 사용하세요: <Alert variant="success">저장되었습니다</Alert> / showToast({ variant: "success", message: "저장되었습니다" })'
        options={[{ label: 'variant', values: alertSamples.map((a) => a.variant) }]}
      >
        <div className={styles.alertList}>
          {alertSamples.map((a) => (
            <div key={a.variant} className={styles.alertRow}>
              <Typography variant="caption" color="tertiary" className={styles.alertLabel}>
                {a.variant}
              </Typography>
              <Alert variant={a.variant} className={styles.alertBox}>
                {a.message}
              </Alert>
            </div>
          ))}
          <Button
            variant="outline"
            size="md"
            onClick={() => showToast({ variant: 'success', message: '저장되었습니다' })}
          >
            토스트 미리보기
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => showToast({ variant: 'brand', message: '담았어요!' })}
          >
            브랜드 토스트 미리보기
          </Button>
        </div>
        <Typography variant="caption" color="tertiary" className={styles.usage}>
          brand 톤은 success(상태 성공)와 별개로, "장소를 담았어요" 같은 브랜드 액션 피드백 전용입니다.
        </Typography>
      </Section>

      <Section
        title="모달"
        usage='확인이 필요한 동작에는 ConfirmModal을 사용하세요: <ConfirmModal isOpen={open} title="..." onConfirm={...} onCancel={...} />'
      >
        <Button variant="primary" size="md" onClick={() => setConfirmOpen(true)}>
          모달 미리보기
        </Button>
      </Section>

      <ConfirmModal
        isOpen={confirmOpen}
        title="일정을 삭제할까요?"
        description="제주도 힐링 여행 일정이 삭제됩니다"
        confirmLabel="삭제"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}