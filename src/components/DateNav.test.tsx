import { fireEvent, render } from '@testing-library/react-native'
import type { ReactElement } from 'react'
import DateNav from './DateNav'
import { ThemeProvider } from '../context/ThemeContext'

function renderConTema(ui: ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('DateNav', () => {
  it('muestra la fecha y navega con los botones', async () => {
    const onCambiarDia = jest.fn()
    const onHoy = jest.fn()

    const { getByText, getByLabelText } = await renderConTema(
      <DateNav fecha="2026-08-30" onCambiarDia={onCambiarDia} onHoy={onHoy} />,
    )

    expect(getByText(/30 de agosto/i)).toBeTruthy()

    await fireEvent.press(getByLabelText('Día anterior'))
    expect(onCambiarDia).toHaveBeenCalledWith(-1)

    await fireEvent.press(getByLabelText('Día siguiente'))
    expect(onCambiarDia).toHaveBeenCalledWith(1)

    await fireEvent.press(getByText('Hoy'))
    expect(onHoy).toHaveBeenCalledTimes(1)
  })
})