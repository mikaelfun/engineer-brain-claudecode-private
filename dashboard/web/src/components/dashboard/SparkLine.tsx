/**
 * SparkLine — Minimal inline SVG sparkline chart
 *
 * Renders a polyline + area fill with an end-dot marker.
 * No axes, labels, or gridlines — pure data-ink.
 */

interface SparkLineProps {
  data: number[]
  color: string
  width?: number
  height?: number
  fillOpacity?: number
}

export function SparkLine({
  data,
  color,
  width = 120,
  height = 32,
  fillOpacity = 0.15,
}: SparkLineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = range * 0.1

  const toPoint = (v: number, i: number) => {
    const x = (i / (data.length - 1)) * width
    const y =
      height - ((v - min + padding) / (range + 2 * padding)) * height
    return { x, y }
  }

  const pts = data.map(toPoint)
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ')

  // Area fill: close the polygon along the bottom edge
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`

  const last = pts[pts.length - 1]

  return (
    <svg width={width} height={height}>
      <polygon points={areaPoints} fill={color} opacity={fillOpacity} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      <circle cx={last.x} cy={last.y} r={2.5} fill={color} />
    </svg>
  )
}
