const KST_OFFSET = '+09:00';

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string') {
    const hasTime = value.includes('T');
    const source = hasTime ? value : `${value}T00:00:00${KST_OFFSET}`;
    const date = new Date(source);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export const getRuntimeStatus = (popup) => {
  const now = new Date();
  const start = parseDate(popup?.startDate);
  const end = parseDate(popup?.endDate);

  if (end && now > end) {
    return 'ended';
  }
  if (start && now < start) {
    return 'upcoming';
  }
  if (start && end && now >= start && now <= end) {
    return 'ongoing';
  }
  if (!start && end && now <= end) {
    return 'ongoing';
  }
  return 'unknown';
};

export const runtimeStatusLabel = {
  upcoming: '오픈 예정',
  ongoing: '진행 중',
  ended: '종료',
  unknown: null,
  default: null,
};

export const normalizePopup = (popup = {}) => {
  const runtimeStatus = getRuntimeStatus(popup);
  return {
    ...popup,
    runtimeStatus,
    runtimeStatusLabel: runtimeStatusLabel[runtimeStatus] ?? runtimeStatusLabel.default,
    isFavorite: Boolean(popup.isFavorite),
  };
};

export const isPopupActive = (popup) => {
  if (!popup) return false;
  const status = popup.runtimeStatus ?? getRuntimeStatus(popup);
  return status !== 'ended';
};

