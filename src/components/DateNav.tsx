import { Pressable, StyleSheet, Text, View } from 'react-native'
import { CaretLeft, CaretRight } from 'phosphor-react-native'
import { useTheme } from '../context/ThemeContext'
import { formatearFechaLarga } from '../lib/fechas'

interface DateNavProps {
  /** Fecha activa en formato `yyyy-MM-dd`. */
  fecha: string
  /** Cambia el día activo en `delta` días (negativo para retroceder). */
  onCambiarDia: (delta: number) => void
  /** Vuelve al día actual. */
  onHoy: () => void
}

/** Navegación día a día con botones ◀ ▶ y acceso directo a hoy. */
export default function DateNav({ fecha, onCambiarDia, onHoy }: DateNavProps) {
  const { colores } = useTheme()

  return (
    <View style={[styles.nav, { backgroundColor: colores.card, borderColor: colores.border }]}>
      <Pressable
        onPress={() => onCambiarDia(-1)}
        style={[styles.flecha, { backgroundColor: colores.primarySoft, borderColor: colores.border }]}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Día anterior"
      >
        <CaretLeft size={18} weight="bold" color={colores.primaryDark} />
      </Pressable>
      <Text style={[styles.fecha, { color: colores.primaryDark }]} numberOfLines={1}>
        {formatearFechaLarga(fecha)}
      </Text>
      <Pressable
        onPress={() => onCambiarDia(1)}
        style={[styles.flecha, { backgroundColor: colores.primarySoft, borderColor: colores.border }]}
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Día siguiente"
      >
        <CaretRight size={18} weight="bold" color={colores.primaryDark} />
      </Pressable>
      <Pressable
        onPress={onHoy}
        style={[styles.hoy, { borderColor: colores.primary, backgroundColor: colores.primarySoft }]}
        accessibilityRole="button"
      >
        <Text style={[styles.hoyTexto, { color: colores.primaryDark }]}>Hoy</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  flecha: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fecha: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  hoy: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  hoyTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
})