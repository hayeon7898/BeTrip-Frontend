export function getTodayKST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

export function getDayDiff(fromDate: string, toDate: string): number {
  return Math.round(
    (new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function formatDateRange(startDate: string, endDate: string): string {
  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);
  const start = startDate.replaceAll('-', '.');
  const end =
    endYear === startYear ? endDate.slice(5).replace('-', '.') : endDate.replaceAll('-', '.');
  return `${start} ~ ${end}`;
}

export function formatDday(startDate: string, today: string): string {
  const diff = getDayDiff(today, startDate);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return 'D-DAY';
  return '여행 중';
}
