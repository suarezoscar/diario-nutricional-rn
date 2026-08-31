import { fireEvent, render } from '@testing-library/react-native'
import type { ReactElement } from 'react'
import CampoForm from './CampoForm'
import { CAMPOS } from '../config/campos'
import { ThemeProvider } from '../context/ThemeContext'
import type { CampoConfig } from '../types'

const desayuno = CAMPOS[0] as CampoConfig
const agua = CAMPOS[5] as CampoConfig

async function renderCampo(
  campo: CampoConfig,
  {
    valor = '',
    valorAnterior = '',
    estado,
    metaAgua = 0,
  }: {
    valor?: string
    valorAnterior?: string
    estado?: 'saving' | 'saved' | 'error'
    metaAgua?: number
  } = {},
) {
  const onActualizar = jest.fn()
  const onReintentar = jest.fn()
  const ui: ReactElement = (
    <ThemeProvider>
      <CampoForm
        campo={campo}
        valor={valor}
        valorAnterior={valorAnterior}
        valorFuera={false}
        estado={estado}
        metaAgua={metaAgua}
        onReintentar={onReintentar}
        onActualizar={onActualizar}
      />
    </ThemeProvider>
  )
  const utils = await render(ui)
  return { ...utils, onActualizar, onReintentar }
}

describe('CampoForm', () => {
  it('renderiza un textarea con su valor y contador de caracteres', async () => {
    const { getByPlaceholderText, getByText } = await renderCampo(desayuno, { valor: 'Tostadas' })
    const textarea = getByPlaceholderText('Ej: Tostadas con aguacate')
    expect(textarea.props.value).toBe('Tostadas')
    expect(getByText('8/500')).toBeTruthy()
  })

  it('muestra el badge «Guardando» en estado saving', async () => {
    const { getByText } = await renderCampo(desayuno, { estado: 'saving' })
    expect(getByText('Guardando')).toBeTruthy()
  })

  it('muestra el badge «Guardado» en estado saved', async () => {
    const { getByText } = await renderCampo(desayuno, { estado: 'saved' })
    expect(getByText('Guardado')).toBeTruthy()
  })

  it('el badge «Reintentar» en estado error llama al callback', async () => {
    const { getByLabelText, onReintentar } = await renderCampo(desayuno, { estado: 'error' })
    await fireEvent.press(getByLabelText('Reintentar guardado'))
    expect(onReintentar).toHaveBeenCalledTimes(1)
  })

  it('el botón de copiar toma el valor del día anterior', async () => {
    const { getByLabelText, onActualizar } = await renderCampo(desayuno, { valorAnterior: 'Avena' })
    await fireEvent.press(getByLabelText('Copiar del día anterior'))
    expect(onActualizar).toHaveBeenCalledWith('desayuno', 'Avena')
  })

  it('muestra la barra de progreso de agua si hay meta', async () => {
    const { getByText } = await renderCampo(agua, { valor: '1', metaAgua: 2 })
    expect(getByText('1 de 2L')).toBeTruthy()
  })
})