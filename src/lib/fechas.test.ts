import { desplazarDia, formatearFechaCorta, generarDiasRango, hoy } from './fechas'

describe('utilidades de fechas', () => {
  it('formatea fechas en dd/MM/yyyy', () => {
    expect(formatearFechaCorta('2026-08-30')).toBe('30/08/2026')
  })

  it('desplaza días correctamente (positivo y negativo)', () => {
    expect(desplazarDia('2026-08-30', 1)).toBe('2026-08-31')
    expect(desplazarDia('2026-08-30', -1)).toBe('2026-08-29')
    expect(desplazarDia('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('hoy devuelve el formato yyyy-MM-dd', () => {
    expect(hoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('genera el rango con los datos de cada día', () => {
    const dias = generarDiasRango('2026-08-28', '2026-08-30', {
      '2026-08-28': { desayuno: 'Tostadas' },
    })
    expect(dias).toHaveLength(3)
    expect(dias[0].key).toBe('2026-08-28')
    expect(dias[0].datos.desayuno).toBe('Tostadas')
    expect(dias[1].datos.desayuno).toBeUndefined()
  })

  it('devuelve un rango vacío si desde es posterior a hasta', () => {
    expect(generarDiasRango('2026-08-30', '2026-08-28', {})).toEqual([])
  })
})