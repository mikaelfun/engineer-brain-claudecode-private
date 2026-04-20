/**
 * RingChart — Reusable SVG ring/donut chart
 *
 * Renders a circular progress indicator with a center value label
 * and a caption below. Animates the arc on mount via CSS transition.
 */

interface RingChartProps {
  value: number
  max: number
  color: string
  label: string
  size?: number
  strokeWidth?: number
}

export function RingChart({
  value,
  max,
  color,
  label,
  size = 80,
  strokeWidth = 6,
}: RingChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percentage = max > 0 ? Math.min(value / max, 1) : 0
  const dashOffset = circumference * (1 - percentage)

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Ring container */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--bg-inset)"
            strokeWidth={strokeWidth}
          />
          {/* Foreground arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        {/* Center value overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="font-mono text-xs font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {value}/{max}
          </span>
        </div>
      </div>
      {/* Label */}
      <span
        className="text-[10px] font-medium"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
    </div>
  )
}
