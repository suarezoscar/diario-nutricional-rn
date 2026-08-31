import { useCallback, useEffect, useMemo, useState } from 'react'
import { borrarPeso, cargarPesos, guardarPeso } from '../lib/firestore'
import type { PesosPorFecha, PuntoPeso } from '../types'

/**
 * Hook del seguimiento de peso: estado en memoria, carga inicial desde
 * Firestore y operaciones de guardado/borrado.
 */
export function usePeso(userId: string): {
  pesos: PesosPorFecha
  chartData: PuntoPeso[]
  guardar: (fecha: string, valor: number) => Promise<void>
  borrar: (fecha: string) => Promise<void>
} {
  const [pesos, setPesos] = useState<PesosPorFecha>({})

  useEffect(() => {
    let activo = true
    cargarPesos(userId)
      .then(mapa => {
        if (activo) setPesos(mapa)
      })
      .catch(err => console.error('Error cargando pesos:', err))
    return () => {
      activo = false
    }
  }, [userId])

  /** Guarda (upsert) el peso de una fecha. */
  const guardar = useCallback(
    async (fecha: string, valor: number) => {
      await guardarPeso({ userId, fecha, peso: valor })
      setPesos(prev => ({ ...prev, [fecha]: valor }))
    },
    [userId],
  )

  /** Elimina el peso de una fecha. */
  const borrar = useCallback(
    async (fecha: string) => {
      await borrarPeso(userId, fecha)
      setPesos(prev => {
        const next = { ...prev }
        delete next[fecha]
        return next
      })
    },
    [userId],
  )

  /** Puntos del gráfico, ordenados cronológicamente. */
  const chartData = useMemo<PuntoPeso[]>(
    () =>
      Object.entries(pesos)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, peso]) => ({ fecha, peso })),
    [pesos],
  )

  return { pesos, chartData, guardar, borrar }
}