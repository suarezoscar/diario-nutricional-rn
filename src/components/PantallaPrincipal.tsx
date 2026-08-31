import { useCallback, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useRegistros } from '../hooks/useRegistros'
import { useMetasAgua } from '../hooks/useMetasAgua'
import { usePeso } from '../hooks/usePeso'
import { desplazarDia, hoy } from '../lib/fechas'
import Header from './Header'
import DateNav from './DateNav'
import DailyForm from './DailyForm'
import WaterGoals from './WaterGoals'
import WeightTracker from './WeightTracker'
import type { ClaveDatosRegistro, UsuarioAutenticado } from '../types'

/** Fecha de hoy, calculada una sola vez al cargar la app. */
const FECHA_HOY = hoy()

interface PantallaPrincipalProps {
  user: UsuarioAutenticado
}

/**
 * Pantalla principal del diario: cabecera, navegación de día y formulario de
 * registro con guardado automático. Las secciones de metas de agua, peso y
 * resumen se añaden en fases posteriores.
 */
export default function PantallaPrincipal({ user }: PantallaPrincipalProps) {
  const { logout } = useAuth()
  const { colores, alternar } = useTheme()

  const [diaSel, setDiaSel] = useState(FECHA_HOY)
  const {
    registros,
    cargando,
    pendiente,
    guardando,
    errorGuardado,
    camposPendientes,
    ultimoGuardado,
    actualizarCampo,
    guardarDia,
  } = useRegistros(user.uid, diaSel)
  const { metas, metaDelDia, guardar: guardarMeta, borrar: borrarMeta } = useMetasAgua(user.uid)
  const { chartData, guardar: guardarPeso, borrar: borrarPeso } = usePeso(user.uid)

  const diaAnterior = desplazarDia(diaSel, -1)
  const datos = registros[diaSel] || {}
  const datosAnterior = registros[diaAnterior] || {}

  /** Estable: evita re-renderizar todos los campos al escribir en uno. */
  const actualizar = useCallback(
    (campo: ClaveDatosRegistro, valor: string | boolean) => actualizarCampo(diaSel, campo, valor),
    [diaSel, actualizarCampo],
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colores.bgStart }]} edges={['top']}>
      <Header
        user={user}
        onAlternarTema={alternar}
        onLogout={() => void logout()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
        >
          {cargando ? (
            <View style={styles.cargando}>
              <ActivityIndicator size="large" color={colores.primary} />
            </View>
          ) : (
            <>
              <DateNav
                fecha={diaSel}
                onCambiarDia={delta => setDiaSel(prev => desplazarDia(prev, delta))}
                onHoy={() => setDiaSel(FECHA_HOY)}
              />
              <DailyForm
                fecha={diaSel}
                esHoy={diaSel === FECHA_HOY}
                datos={datos}
                datosAnterior={datosAnterior}
                fechaAnterior={diaAnterior}
                metaAgua={metaDelDia(diaSel)}
                pendiente={pendiente}
                guardando={guardando}
                errorGuardado={errorGuardado}
                camposPendientes={camposPendientes}
                ultimoGuardado={ultimoGuardado}
                onActualizar={actualizar}
                onReintentar={() => void guardarDia(diaSel)}
              />
              <WaterGoals metas={metas} onGuardar={guardarMeta} onBorrar={borrarMeta} />
              <WeightTracker chartData={chartData} onGuardar={guardarPeso} onBorrar={borrarPeso} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: 14,
    paddingBottom: 48,
  },
  cargando: {
    paddingVertical: 60,
    alignItems: 'center',
  },
})