import { act, renderHook, waitFor } from '@testing-library/react-native'
import { useFiltroFechas } from './useFiltroFechas'
import { cargarAjustes, guardarAjustes } from '../lib/firestore'

jest.mock('../lib/firestore', () => ({
  cargarAjustes: jest.fn(),
  guardarAjustes: jest.fn(),
}))

const cargarAjustesMock = jest.mocked(cargarAjustes)
const guardarAjustesMock = jest.mocked(guardarAjustes)

describe('useFiltroFechas', () => {
  beforeEach(() => {
    cargarAjustesMock.mockReset()
    guardarAjustesMock.mockReset()
    cargarAjustesMock.mockResolvedValue({ filterStart: '2026-08-01', filterEnd: '2026-08-30' })
    guardarAjustesMock.mockResolvedValue(undefined)
  })

  it('carga los ajustes sin avisar de la persistencia inicial', async () => {
    const onGuardado = jest.fn()
    await renderHook(() => useFiltroFechas('u1', '2026-08-30', onGuardado))

    await waitFor(() => expect(guardarAjustesMock).toHaveBeenCalled())
    expect(onGuardado).not.toHaveBeenCalled()
  })

  it('avisa al guardar un cambio del rango', async () => {
    const onGuardado = jest.fn()
    const { result } = await renderHook(() => useFiltroFechas('u1', '2026-08-30', onGuardado))

    await waitFor(() => expect(guardarAjustesMock).toHaveBeenCalled())

    await act(async () => result.current.setFechaDesde('2026-08-15'))
    await waitFor(() => expect(onGuardado).toHaveBeenCalledTimes(1))

    expect(guardarAjustesMock).toHaveBeenLastCalledWith(
      'u1',
      expect.objectContaining({ filterStart: '2026-08-15' }),
    )
  })
})