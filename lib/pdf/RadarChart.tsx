import { Svg, Circle, Line, Polygon, Text as SvgText, G } from '@react-pdf/renderer'
import type { SVGPresentationAttributes } from '@react-pdf/types'
import { COMPETENCY_SHORT_LABEL } from '@/lib/framework/shortLabels'

// react-pdf renders outside a browser, so the on-screen radar (Recharts,
// components/assessment/CompetencyRadar.tsx) can't run here — Recharts needs
// a real DOM to measure itself against (ResponsiveContainer). This redraws
// the same self/manager/bar radar from scratch using react-pdf's own SVG
// primitives, which it CAN render into the PDF's content stream.

export interface RadarRow {
  competencyKey: string
  name: string
  self: number | null
  manager: number | null
  target: number
}

const SIZE = 460
const CENTER = SIZE / 2
const MAX_RADIUS = 160
const SCALE_MAX = 5 // competency scores are always 1-5
const RING_COUNT = 5 // gridlines at 1,2,3,4,5

function pointFor(index: number, count: number, value: number): { x: number; y: number } {
  // First axis points straight up; axes run clockwise, evenly spaced.
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count
  const r = (Math.max(0, Math.min(value, SCALE_MAX)) / SCALE_MAX) * MAX_RADIUS
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) }
}

function polygonPoints(rows: RadarRow[], pick: (r: RadarRow) => number | null): string {
  return rows
    .map((r, i) => {
      const v = pick(r)
      const p = pointFor(i, rows.length, v ?? 0)
      return `${p.x},${p.y}`
    })
    .join(' ')
}

export function RadarChart({ rows }: { rows: RadarRow[] }) {
  if (rows.length === 0) return null

  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {/* Concentric rings, one per scale point */}
      {Array.from({ length: RING_COUNT }, (_, i) => {
        const ringValue = i + 1
        return (
          <Circle
            key={ringValue}
            cx={CENTER}
            cy={CENTER}
            r={(ringValue / SCALE_MAX) * MAX_RADIUS}
            stroke="#e2e8f0"
            strokeWidth={0.75}
            fill="none"
          />
        )
      })}

      {/* Axis spokes + labels */}
      {rows.map((r, i) => {
        const edge = pointFor(i, rows.length, SCALE_MAX)
        const labelPoint = pointFor(i, rows.length, SCALE_MAX + 0.75)
        const label = COMPETENCY_SHORT_LABEL[r.competencyKey] ?? r.name
        // Keep long labels from running off the page edge: anchor by which
        // side of the circle they fall on rather than always centering.
        const anchor = labelPoint.x < CENTER - 4 ? 'end' : labelPoint.x > CENTER + 4 ? 'start' : 'middle'
        // @react-pdf/renderer's SVGTextProps type omits fontSize even though
        // the renderer reads it off style at runtime like any other Text node
        // (verified against @react-pdf/stylesheet's resolver) — cast narrowly
        // to work around that type gap rather than dropping the font size.
        const labelStyle = { fontSize: 8, fill: '#475569' } as unknown as SVGPresentationAttributes
        return (
          <G key={r.competencyKey}>
            <Line x1={CENTER} y1={CENTER} x2={edge.x} y2={edge.y} stroke="#e2e8f0" strokeWidth={0.75} />
            <SvgText x={labelPoint.x} y={labelPoint.y} style={labelStyle} textAnchor={anchor}>
              {label}
            </SvgText>
          </G>
        )
      })}

      {/* Bar (target) — filled light gray, drawn first so the real scores sit on top */}
      <Polygon
        points={polygonPoints(rows, (r) => r.target)}
        stroke="#cbd5e1"
        strokeWidth={1.5}
        fill="#cbd5e1"
        fillOpacity={0.25}
      />
      {/* Self */}
      <Polygon
        points={polygonPoints(rows, (r) => r.self)}
        stroke="#0ea5e9"
        strokeWidth={1.5}
        fill="#0ea5e9"
        fillOpacity={0.15}
      />
      {/* Manager */}
      <Polygon
        points={polygonPoints(rows, (r) => r.manager)}
        stroke="#1d4ed8"
        strokeWidth={1.5}
        fill="#1d4ed8"
        fillOpacity={0.25}
      />
    </Svg>
  )
}
