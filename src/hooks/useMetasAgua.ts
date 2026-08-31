import { useCallback, useEffect, useState } from 'react'
import { borrarMetaAgua, cargarMetasAgua, guardarMetaAgua } from '../lib/firestore'
import type { MetaAgua } from '../types'

/**
 * Hook de las metas de agua: lista de rangos con su objetivo diario de litros
 * y operaciones de guardado/borrado.
 */
export function useMetasAgua(userId: string): {
  metas: MetaAgua[]
  metaDelDia: (fecha: string) => number
  guardar: (meta: MetaAgua) => Promise<void>
  borrar: (startDate: string) => Promise<void>
} {
  const [metas, setMetas] = useState<MetaAgua[]>([])

  useEffect(() => {
    let activo = true
    cargarMetasAgua(userId)
      .then(lista => {
        if (activo) setMetas(lista)
      })
      .catch(err => console.error('Error cargando metas de agua:', err))
    return () => {
      activo = false
    }
  }, [userId])

  /** Litros objetivo vigentes para una fecha (0 si no hay meta activa). */
  const metaDelDia = useCallback(
    (fecha: string): number =>
      metas.find(g => fecha >= g.startDate && fecha <= g.endDate)?.litersPerDay || 0,
    [metas],
  )

  /** Guarda (upsert) una meta de agua y la reordena por fecha de inicio. */
  const guardar = useCallback(
    async (meta: MetaAgua) => {
      await guardarMetaAgua(userId, meta)
      setMetas(prev =>
        [...prev.filter(g => g.startDate !== meta.startDate), meta].sort((a, b) =>
          a.startDate.localeCompare(b.startDate),
        ),
      )
    },
    [userId],
  )

  /** Elimina la meta cuyo rango empieza en `startDate`. */
  const borrar = useCallback(
    async (startDate: string) => {
      await borrarMetaAgua(userId, startDate)
      setMetas(prev => prev.filter(g => g.startDate !== startDate))
    },
    [userId],
  )

  return { metas, metaDelDia, guardar, borrar }
}