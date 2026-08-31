import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarBlank } from 'phosphor-react-native'
import { useTheme } from '../context/ThemeContext'

interface CampoFechaProps {
  /** Fecha en formato `yyyy-MM-dd`. */
  valor: string
  onCambio: (fecha: string) => void
  /** Etiqueta opcional mostrada sobre el selector. */
  etiqueta?: string
  /** Fecha mínima permitida (`yyyy-MM-dd`). */
  minimo?: string
  /** Fecha máxima permitida (`yyyy-MM-dd`). */
  maximo?: string
}

/**
 * Selector de fecha reutilizable. Abre el `DateTimePicker` nativo al pulsar y
 * muestra la fecha elegida con el formato local. En Android el picker se
 * presenta como diálogo; en iOS como rueda embebida.
 */
export default function CampoFecha({ valor, onCambio, etiqueta, minimo, maximo }: CampoFechaProps) {
  const { colores } = useTheme()
  const [visible, setVisible] = useState(false)
  const fecha = new Date(valor + 'T00:00:00')

  const abrir = () => setVisible(true)
  const cerrar = () => setVisible(false)

  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={[styles.etiqueta, { color: colores.textLight }]}>{etiqueta}</Text> : null}
      <Pressable
        onPress={abrir}
        style={[styles.selector, { backgroundColor: colores.input, borderColor: colores.border }]}
        accessibilityRole="button"
      >
        <CalendarBlank size={16} weight="bold" color={colores.primary} />
        <Text style={[styles.texto, { color: colores.text }]}>
          {format(fecha, 'dd/MM/yyyy', { locale: es })}
        </Text>
      </Pressable>

      {visible && (
        <DateTimePicker
          value={fecha}
          mode="date"
          minimumDate={minimo ? new Date(minimo + 'T00:00:00') : undefined}
          maximumDate={maximo ? new Date(maximo + 'T00:00:00') : undefined}
          onChange={(event, seleccionada) => {
            if (Platform.OS !== 'ios') cerrar()
            if (event.type === 'set' && seleccionada) {
              onCambio(format(seleccionada, 'yyyy-MM-dd'))
            }
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 4,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '500',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  texto: {
    fontSize: 14,
  },
})