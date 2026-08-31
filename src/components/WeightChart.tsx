import Svg, { Circle, G, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg'
import { format } from 'date-fns'
import { useTheme } from '../context/ThemeContext'
import type { PuntoPeso } from '../types'

interface WeightChartProps {
  /** Puntos del gráfico ordenados cronológicamente. */
  data: PuntoPeso[]
}

/** Anchos del lienzo del gráfico (coordenadas del viewBox). */
const W = 600
const H = 180
const PAD_L = 42
const PAD_R = 16
const PAD_T = 14
const PAD_B = 24

/**
 * Gráfico de evolución de peso en SVG (`react-native-svg`). Dibuja rejilla,
 * polilínea, relleno y puntos sobre el rango de valores observado.
 */
export default function WeightChart({ data }: WeightChartProps) {
  const { colores } = useTheme()

  if (!data || data.length === 0) return null

  const plotW = W - PAD_L - PAD_R
  const plotH = H - PAD_T - PAD_B

  const values = data.map(d => d.peso)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1
  const yMin = minV - range * 0.5
  const yMax = maxV + range * 0.5
  const ySpan = yMax - yMin

  const scaleX = (i: number) => PAD_L + (i / Math.max(data.length - 1, 1)) * plotW
  const scaleY = (v: number) => PAD_T + (1 - (v - yMin) / ySpan) * plotH

  // Líneas de rejilla (5 niveles)
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const v = yMin + (ySpan / 4) * i
    return { y: scaleY(v), label: v.toFixed(1) }
  })

  // Polilínea y polígono de relleno
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.peso)}`).join(' ')
  const fillPoints = [
    `${PAD_L},${scaleY(yMin)}`,
    ...data.map((d, i) => `${scaleX(i)},${scaleY(d.peso)}`),
    `${scaleX(data.length - 1)},${scaleY(yMin)}`,
  ].join(' ')

  // Etiquetas del eje X (se omiten algunas si hay demasiadas)
  const maxLabels = Math.floor(plotW / 50) || 1
  const step = Math.max(1, Math.ceil(data.length / maxLabels))
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <G>
        {gridLines.map(g => (
          <G key={g.label}>
            <Line
              x1={PAD_L}
              y1={g.y}
              x2={W - PAD_R}
              y2={g.y}
              stroke={colores.border}
              strokeWidth={0.5}
              strokeDasharray="3 3"
              opacity={0.6}
            />
            <SvgText x={PAD_L - 6} y={g.y + 3} fontSize={10} fill={colores.textLight} textAnchor="end">
              {g.label}
            </SvgText>
          </G>
        ))}
        {xLabels.map(d => {
          const idx = data.indexOf(d)
          return (
            <SvgText
              key={d.fecha}
              x={scaleX(idx)}
              y={H - 4}
              fontSize={10}
              fill={colores.textLight}
              textAnchor="middle"
            >
              {format(new Date(d.fecha + 'T00:00:00'), 'dd/MM')}
            </SvgText>
          )
        })}
      </G>
      <Polygon points={fillPoints} fill={colores.primary} fillOpacity={0.12} />
      <Polyline points={points} fill="none" stroke={colores.primary} strokeWidth={2} />
      {data.map((d, i) => (
        <Circle key={d.fecha} cx={scaleX(i)} cy={scaleY(d.peso)} r={3.5} fill={colores.primary} />
      ))}
    </Svg>
  )
}