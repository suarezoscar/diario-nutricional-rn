import { eachDayOfInterval, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DiaRango, RegistrosPorFecha } from '../types'

/** Fecha de hoy en formato `yyyy-MM-dd` (clave usada en Firestore). */
export function hoy(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Formatea una fecha `yyyy-MM-dd` como texto largo en español, p. ej. «sábado 30 de agosto». */
export function formatearFechaLarga(fecha: string): string {
  return format(new Date(fecha + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })
}

/** Formatea una fecha `yyyy-MM-dd` como `dd/MM/yyyy`. */
export function formatearFechaCorta(fecha: string): string {
  return format(new Date(fecha + 'T00:00:00'), 'dd/MM/yyyy')
}

/**
 * Suma o resta días a una fecha `yyyy-MM-dd`.
 * @param delta Número de días (negativo para retroceder).
 */
export function desplazarDia(fecha: string, delta: number): string {
  const d = new Date(fecha + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return format(d, 'yyyy-MM-dd')
}

/**
 * Genera la lista de días del intervalo `[desde, hasta]` enlazando los datos de
 * cada día. Devuelve un array vacío si «desde» es posterior a «hasta».
 */
export function generarDiasRango(
  desde: string,
  hasta: string,
  registros: RegistrosPorFecha,
): DiaRango[] {
  const start = new Date(desde + 'T00:00:00')
  const end = new Date(hasta + 'T00:00:00')
  if (start > end) return []
  return eachDayOfInterval({ start, end }).map(f => {
    const key = format(f, 'yyyy-MM-dd')
    return { key, fecha: f, datos: registros[key] || {} }
  })
}