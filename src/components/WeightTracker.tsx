import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { format } from 'date-fns'
import { PersonSimpleRun, Trash } from 'phosphor-react-native'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { hoy } from '../lib/fechas'
import CampoFecha from './CampoFecha'
import WeightChart from './WeightChart'
import type { PuntoPeso } from '../types'

interface WeightTrackerProps {
  /** Puntos del gráfico, ordenados cronológicamente. */
  chartData: PuntoPeso[]
  onGuardar: (fecha: string, valor: number) => Promise<void>
  onBorrar: (fecha: string) => Promise<void>
}

/** Sección de seguimiento de peso: formulario, gráfico y listado histórico. */
export default function WeightTracker({ chartData, onGuardar, onBorrar }: WeightTrackerProps) {
  const { colores } = useTheme()
  const toast = useToast()
  const [nuevoPeso, setNuevoPeso] = useState('')
  const [fechaPeso, setFechaPeso] = useState(hoy())

  const guardar = async () => {
    if (!nuevoPeso || parseFloat(nuevoPeso) <= 0) return
    const valor = parseFloat(nuevoPeso)
    await onGuardar(fechaPeso, valor)
    setNuevoPeso('')
    toast.exito(`Peso guardado: ${valor} kg`)
  }

  const borrar = async (fecha: string) => {
    await onBorrar(fecha)
    toast.exito('Registro de peso eliminado')
  }

  return (
    <View style={[styles.card, { backgroundColor: colores.card, borderColor: colores.border }]}>
      <Text style={[styles.titulo, { color: colores.primaryDark }]}>
        <PersonSimpleRun size={18} weight="duotone" color="#9a7a5a" />  Seguimiento de peso
      </Text>

      <View style={styles.formulario}>
        <TextInput
          style={[styles.inputPeso, { backgroundColor: colores.input, color: colores.text, borderColor: colores.border }]}
          keyboardType="decimal-pad"
          placeholder="kg"
          placeholderTextColor={colores.textSoft}
          value={nuevoPeso}
          onChangeText={setNuevoPeso}
        />
        <View style={styles.fecha}>
          <CampoFecha valor={fechaPeso} onCambio={setFechaPeso} />
        </View>
        <Pressable
          style={[styles.boton, { backgroundColor: colores.primary }]}
          onPress={() => void guardar()}
          accessibilityRole="button"
        >
          <Text style={styles.botonTexto}>Guardar</Text>
        </Pressable>
      </View>

      {chartData.length > 0 ? (
        <WeightChart data={chartData} />
      ) : (
        <Text style={[styles.vacio, { color: colores.textLight }]}>Sin registros de peso en este periodo.</Text>
      )}

      {chartData.map(({ fecha, peso }) => (
        <View key={fecha} style={styles.fila}>
          <Text style={[styles.filaFecha, { color: colores.text }]}>
            {format(new Date(fecha + 'T00:00:00'), 'dd/MM/yyyy')}
          </Text>
          <Text style={[styles.filaValor, { color: colores.primaryDark }]}>{peso} kg</Text>
          <Pressable
            onPress={() => void borrar(fecha)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar peso del ${fecha}`}
          >
            <Trash size={14} weight="bold" color={colores.textLight} />
          </Pressable>
        </View>
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
    gap: 12,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
  },
  formulario: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  inputPeso: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minWidth: 70,
  },
  fecha: {
    flex: 1,
    minWidth: 130,
  },
  boton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  vacio: {
    fontSize: 13,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filaFecha: {
    fontSize: 13,
    minWidth: 90,
  },
  filaValor: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
})