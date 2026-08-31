import { camposCambiados } from './useRegistros'
import type { DatosRegistro } from '../types'

// Evita cargar la cadena de Firebase nativo (solo se usa la función pura).
jest.mock('../lib/firestore', () => ({
  cargarRegistros: jest.fn(),
  guardarRegistro: jest.fn(),
}))

describe('camposCambiados', () => {
  it('devuelve [] si no hay cambios', () => {
    const prev: DatosRegistro = { desayuno: 'Tostadas', agua: '2' }
    expect(camposCambiados(prev, { ...prev })).toEqual([])
  })

  it('detecta el cambio de texto de una comida', () => {
    expect(camposCambiados({ desayuno: 'Tostadas' }, { desayuno: 'Avena' })).toEqual(['desayuno'])
  })

  it('el marcador «fuera de casa» cuenta como cambio de esa comida', () => {
    expect(camposCambiados({ comida: 'Ensalada' }, { comida: 'Ensalada', comidaFuera: true })).toEqual(
      ['comida'],
    )
  })

  it('detecta agua, ejercicio y comentarios', () => {
    const cambios = camposCambiados({}, { agua: '2', ejercicio: 'Correr', comentarios: 'Nota' })
    expect(cambios).toEqual(['agua', 'ejercicio', 'comentarios'])
  })

  it('un prev undefined equivale a un día no persistido', () => {
    expect(camposCambiados(undefined, { cena: 'Pescado' })).toEqual(['cena'])
  })
})