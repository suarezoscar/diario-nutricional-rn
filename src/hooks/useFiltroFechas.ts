import { useEffect, useRef, useState } from 'react'
import { format, subDays } from 'date-fns'
import { cargarAjustes, guardarAjustes } from '../lib/firestore'

/**
 * Hook del filtro de fechas del resumen. Carga los límites persistidos del
 * usuario (`userSettings`) y guarda cualquier cambio en Firestore.
 *
 * @param onGuardado Se invoca tras persistir un cambio de rango (no se llama en
 * la escritura inicial que hace eco de los ajustes cargados).
 */
export function useFiltroFechas(
  userId: string,
  fechaHoy: string,
  onGuardado?: () => void,
): {
  fechaDesde: string
  fechaHasta: string
  setFechaDesde: (v: string) => void
  setFechaHasta: (v: string) => void
} {
  /** Por defecto, los últimos 14 días (hoy incluido). */
  const [fechaDesde, setFechaDesde] = useState<string>(() =>
    format(subDays(new Date(), 13), 'yyyy-MM-dd'),
  )
  const [fechaHasta, setFechaHasta] = useState<string>(fechaHoy)
  const [cargando, setCargando] = useState(true)
  /** Marca la primera persistencia (eco de la carga) para no avisarla. */
  const inicializado = useRef(false)

  useEffect(() => {
    let activo = true
    cargarAjustes(userId)
      .then(ajustes => {
        if (!activo) return
        if (ajustes.filterStart) setFechaDesde(ajustes.filterStart)
        if (ajustes.filterEnd) setFechaHasta(ajustes.filterEnd)
        setCargando(false)
      })
      .catch(err => {
        console.error('Error cargando ajustes:', err)
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [userId])

  useEffect(() => {
    if (!cargando) {
      const avisar = inicializado.current
      inicializado.current = true
      guardarAjustes(userId, { filterStart: fechaDesde, filterEnd: fechaHasta })
        .then(() => {
          if (avisar) onGuardado?.()
        })
        .catch(() => {
          /* silencioso */
        })
    }
  }, [fechaDesde, fechaHasta, cargando, userId, onGuardado])

  return { fechaDesde, fechaHasta, setFechaDesde, setFechaHasta }
}