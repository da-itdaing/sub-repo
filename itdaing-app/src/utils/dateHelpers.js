const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const formatSingleDate = (value) => {
  if (!value) return null;
  try {
    return dateFormatter.format(new Date(value));
  } catch (error) {
    console.warn('[dateHelpers] Failed to format date:', value, error);
    return null;
  }
};

/**
 * 시작일/종료일을 한국어 포맷으로 표기합니다.
 * @param {string | null} start
 * @param {string | null} end
 * @returns {string}
 */
export const formatDateRange = (start, end) => {
  const startLabel = formatSingleDate(start);
  const endLabel = formatSingleDate(end);

  if (startLabel && endLabel) {
    return `${startLabel} ~ ${endLabel}`;
  }
  if (startLabel) {
    return `${startLabel} 시작`;
  }
  if (endLabel) {
    return `${endLabel} 종료`;
  }
  return '일정 미정';
};
