import { StyleSheet, Text, View } from 'react-native'
import { NotePencil } from 'phosphor-react-native'
import { CAMPOS } from '../config/campos'
import { useTheme } from '../context/ThemeContext'
import { formatearFechaCorta } from '../lib/fechas'
import CampoForm from './CampoForm'
import type { UltimoGuardado } from '../hooks/useRegistros'
import type { ClaveCampo, ClaveDatosRegistro, DatosRegistro, EstadoCampo } from '../types'

interface DailyFormProps {
  /** Fecha activa (`yyyy-MM-dd`). */
  fecha: string
  /** Indica si la fecha activa es hoy. */
  esHoy: boolean
  /** Datos del día activo. */
  datos: DatosRegistro
  /** Datos del día anterior (botón «copiar»). */
  datosAnterior: DatosRegistro
  /** Fecha del día anterior (`yyyy-MM-dd`). */
  fechaAnterior: string
  /** Litros objetivo del día activo. */
  metaAgua: number
  /** Hay cambios sin persistir (debounce en curso). */
  pendiente: boolean
  guardando: boolean
  /** El último guardado falló. */
  errorGuardado: boolean
  /** Campos modificados desde el último guardado. */
  camposPendientes: ClaveCampo[]
  /** Último autosave con éxito (transitorio). */
  ultimoGuardado: UltimoGuardado | null
  onActualizar: (campo: ClaveDatosRegistro, valor: string | boolean) => void
  /** Reintenta el guardado tras un error. */
  onReintentar: () => void
}

/** Tarjeta del registro diario: formulario con indicador de guardado por campo. */
export default function DailyForm({
  fecha,
  esHoy,
  datos,
  datosAnterior,
  fechaAnterior,
  metaAgua,
  pendiente,
  guardando,
  errorGuardado,
  camposPendientes,
  ultimoGuardado,
  onActualizar,
  onReintentar,
}: DailyFormProps) {
  const { colores } = useTheme()

  /** Estado del indicador de un campo según su avance de guardado. */
  const estadoCampo = (key: ClaveCampo): EstadoCampo | null => {
    const pendienteCampo = camposPendientes.includes(key)
    if (errorGuardado && pendienteCampo) return 'error'
    if ((pendiente || guardando) && pendienteCampo) return 'saving'
    if (ultimoGuardado?.campos.includes(key)) return 'saved'
    return null
  }

  return (
    <View style={[styles.card, { backgroundColor: colores.card, borderColor: colores.border }]}>
      <Text style={[styles.titulo, { color: colores.primaryDark }]}>
        <NotePencil size={16} weight="duotone" color={colores.primary} />
        {esHoy ? '  Registro de hoy' : `  Registro del ${formatearFechaCorta(fecha)}`}
      </Text>

      {CAMPOS.map(campo => (
        <CampoForm
          key={campo.key}
          campo={campo}
          valor={datos[campo.key] || ''}
          valorAnterior={datosAnterior[campo.key] || ''}
          valorFuera={datos[`${campo.key}Fuera` as keyof DatosRegistro] as boolean | undefined}
          estado={estadoCampo(campo.key)}
          metaAgua={campo.key === 'agua' ? metaAgua : 0}
          onReintentar={onReintentar}
          onActualizar={onActualizar}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    gap: 20,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
})