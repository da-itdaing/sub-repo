import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';

const clamp = (value, min, max) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const StarRatingInput = ({
  value = 0,
  max = 5,
  onChange,
  label,
  helperText,
  readOnly = false,
}) => {
  const stars = useMemo(() => Array.from({ length: max }).map((_, index) => index + 1), [max]);
  const [hoverValue, setHoverValue] = useState(null);
  const displayValue = hoverValue ?? value;

  const handleSelect = (nextValue) => {
    if (readOnly || typeof onChange !== 'function') return;
    onChange(nextValue);
  };

  const handleSliderKey = (event) => {
    if (readOnly || typeof onChange !== 'function') return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(clamp(value + 1, 1, max));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(clamp(value - 1, 1, max));
    } else if (event.key === 'Home') {
      event.preventDefault();
      onChange(1);
    } else if (event.key === 'End') {
      event.preventDefault();
      onChange(max);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          <span className="text-sm font-bold text-primary">
            {displayValue > 0 ? `${displayValue}.0` : '선택 안 함'}
          </span>
        </div>
      )}

      <div
        role="slider"
        aria-valuemin={1}
        aria-valuemax={max}
        aria-valuenow={displayValue}
        aria-label={label || '별점 선택'}
        tabIndex={readOnly ? -1 : 0}
        onKeyDown={handleSliderKey}
        className="flex items-center justify-center gap-1 rounded-2xl bg-gray-50 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary"
        onMouseLeave={() => setHoverValue(null)}
      >
        {stars.map((starValue) => {
          const isActive = starValue <= displayValue;
          return (
            <button
              type="button"
              key={starValue}
              onMouseEnter={() => !readOnly && setHoverValue(starValue)}
              onFocus={() => !readOnly && setHoverValue(starValue)}
              onBlur={() => setHoverValue(null)}
              onClick={() => handleSelect(starValue)}
              disabled={readOnly}
              aria-pressed={isActive}
              className={`transition-all duration-200 ${
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <Star
                className={`h-9 w-9 transition-colors ${
                  isActive ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>

      {helperText && <p className="text-xs text-gray-500 text-center">{helperText}</p>}
    </div>
  );
};

export default StarRatingInput;


