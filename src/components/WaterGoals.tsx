import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { format } from 'date-fns'
import { Drop, Plus, Trash } from 'phosphor-react-native'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { hoy } from '../lib/fechas'
import CampoFecha from './CampoFecha'
import type { MetaAgua } from '../types'

interface WaterGoalsProps {
  metas: MetaAgua[]
  onGuardar: (meta: MetaAgua) => Promise<void>
  onBorrar: (startDate: string) => Promise<void>
}

/** Sección de metas de agua por rango de fechas, con formulario de alta. */
export default function WaterGoals({ metas, onGuardar, onBorrar }: WaterGoalsProps) {
  const { colores } = useTheme()
  const toast = useToast()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [inicio, setInicio] = useState(hoy())
  const [fin, setFin] = useState(hoy())
  const [litros, setLitros] = useState('2')

  const guardar = async () => {
    if (!litros || parseFloat(litros) <= 0) return
    await onGuardar({ startDate: inicio, endDate: fin, litersPerDay: parseFloat(litros) })
    setMostrarFormulario(false)
    toast.exito('Meta de agua añadida')
  }

  const borrar = async (startDate: string) => {
    await onBorrar(startDate)
    toast.exito('Meta de agua eliminada')
  }

  return (
    <View style={[styles.card, { backgroundColor: colores.card, borderColor: colores.border }]}>
      <Text style={[styles.titulo, { color: colores.primaryDark }]}>
        <Drop size={18} weight="duotone" color="#5a9cc8" />  Metas de agua
      </Text>

      {metas.length === 0 && !mostrarFormulario && (
        <Text style={[styles.vacio, { color: colores.textLight }]}>
          Sin metas configuradas. Añade rangos de fechas con litros diarios objetivo.
        </Text>
      )}

      {metas.map(meta => (
        <View key={meta.startDate} style={styles.fila}>
          <Text style={[styles.rango, { color: colores.text }]}>
            📅 {format(new Date(meta.startDate + 'T00:00:00'), 'dd/MM/yyyy')} →{' '}
            {format(new Date(meta.endDate + 'T00:00:00'), 'dd/MM/yyyy')}
          </Text>
          <Text style={[styles.litros, { color: colores.primaryDark }]}>{meta.litersPerDay} L/día</Text>
          <Pressable
            onPress={() => void borrar(meta.startDate)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Eliminar meta"
          >
            <Trash size={14} weight="bold" color={colores.textLight} />
          </Pressable>
        </View>
      ))}

      {mostrarFormulario && (
        <View style={[styles.formulario, { backgroundColor: colores.primarySoft }]}>
          <CampoFecha etiqueta="Inicio" valor={inicio} onCambio={setInicio} />
          <CampoFecha etiqueta="Fin" valor={fin} onCambio={setFin} minimo={inicio} />
          <View style={styles.campoLitros}>
            <Text style={[styles.etiqueta, { color: colores.textLight }]}>Litros/día</Text>
            <TextInput
              style={[styles.inputLitros, { backgroundColor: colores.card, color: colores.text, borderColor: colores.border }]}
              keyboardType="decimal-pad"
              value={litros}
              onChangeText={setLitros}
              placeholder="L/día"
              placeholderTextColor={colores.textSoft}
            />
          </View>
          <Pressable
            style={[styles.boton, { backgroundColor: colores.primary }]}
            onPress={() => void guardar()}
            accessibilityRole="button"
          >
            <Text style={styles.botonTexto}>Guardar</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => setMostrarFormulario(prev => !prev)}
        style={[styles.add, { borderColor: colores.primary }]}
        accessibilityRole="button"
      >
        <Plus size={14} weight="bold" color={colores.primaryDark} />
        <Text style={[styles.addTexto, { color: colores.primaryDark }]}>
          {mostrarFormulario ? 'Cancelar' : 'Añadir meta'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    gap: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
  },
  vacio: {
    fontSize: 13,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
  },
  rango: {
    fontSize: 13,
    flex: 1,
    minWidth: 180,
  },
  litros: {
    fontSize: 13,
    fontWeight: '700',
  },
  formulario: {
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 4,
  },
  campoLitros: {
    gap: 4,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputLitros: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    maxWidth: 120,
  },
  boton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  addTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
})