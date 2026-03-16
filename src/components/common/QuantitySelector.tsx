import { FiMinus, FiPlus } from "react-icons/fi";

type QuantitySelectorSize = "md" | "sm";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: QuantitySelectorSize;
  editable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const sizeClasses: Record<
  QuantitySelectorSize,
  {
    button: string;
    inputWrap: string;
    input: string;
    icon: number;
    radius: string;
  }
> = {
  md: {
    button: "px-4 py-3",
    inputWrap: "w-12",
    input: "text-base",
    icon: 16,
    radius: "rounded-lg",
  },
  sm: {
    button: "h-8 w-8",
    inputWrap: "w-9",
    input: "text-xs",
    icon: 14,
    radius: "rounded-md",
  },
};

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  editable = true,
  disabled = false,
  loading = false,
  className = "",
}: QuantitySelectorProps) {
  const selectedSize = sizeClasses[size];

  const clampValue = (nextValue: number) => {
    if (Number.isNaN(nextValue)) return min;
    if (nextValue < min) return min;
    if (max != null && nextValue > max) return max;
    return nextValue;
  };

  const handleDecrease = () => {
    if (disabled || loading) return;
    onChange(clampValue(value - 1));
  };

  const handleIncrease = () => {
    if (disabled || loading) return;
    onChange(clampValue(value + 1));
  };

  return (
    <div
      className={`flex items-center border border-[var(--border-color)] ${selectedSize.radius} overflow-hidden ${className}`}
    >
      <button
        type='button'
        onClick={handleDecrease}
        className={`cursor-pointer ${selectedSize.button} bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center`}
        disabled={disabled || loading || value <= min}
      >
        <FiMinus size={selectedSize.icon} />
      </button>

      <div
        className={`${selectedSize.inputWrap} text-center text-[var(--text-secondary)] font-medium`}
      >
        {loading ? (
          <span className='inline-flex items-center justify-center'>
            <span className='h-3.5 w-3.5 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin' />
          </span>
        ) : (
          <input
            value={value}
            readOnly={!editable || disabled}
            onChange={(e) => {
              if (!editable || disabled) return;
              onChange(clampValue(Number(e.target.value)));
            }}
            onBlur={(e) => {
              if (!editable || disabled) return;
              if (Number(e.currentTarget.value) < 1) {
                onChange(0);
              } else if (max != null && Number(e.currentTarget.value) > max) {
                onChange(max);
              }
            }}
            className={`w-full text-center text-[var(--text-secondary)] font-medium ${selectedSize.input} ${editable && !disabled ? "" : "cursor-default"} appearance-none`}
          />
        )}
      </div>

      <button
        type='button'
        onClick={handleIncrease}
        className={`cursor-pointer ${selectedSize.button} bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center`}
        disabled={disabled || loading || (max != null ? value >= max : false)}
      >
        <FiPlus size={selectedSize.icon} />
      </button>
    </div>
  );
}
