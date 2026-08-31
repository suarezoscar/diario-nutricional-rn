import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Sharing from 'expo-sharing'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { useRegistros } from '../hooks/useRegistros'
import { useMetasAgua } from '../hooks/useMetasAgua'
import { usePeso } from '../hooks/usePeso'
import { useFiltroFechas } from '../hooks/useFiltroFechas'
import { desplazarDia, generarDiasRango, hoy } from '../lib/fechas'
import { generarPdf } from '../lib/pdf'
import Header from './Header'
import DateNav from './DateNav'
import DailyForm from './DailyForm'
import WaterGoals from './WaterGoals'
import WeightTracker from './WeightTracker'
import ResumenRango from './ResumenRango'
import type { ClaveDatosRegistro, UsuarioAutenticado } from '../types'

/** Fecha de hoy, calculada una sola vez al cargar la app. */
const FECHA_HOY = hoy()

interface PantallaPrincipalProps {
  user: UsuarioAutenticado
}

/**
 * Pantalla principal del diario: cabecera, navegación de día, formulario con
 * guardado automático, metas de agua, peso y resumen por fechas con PDF.
 */
export default function PantallaPrincipal({ user }: PantallaPrincipalProps) {
  const { logout } = useAuth()
  const { colores, alternar } = useTheme()
  const toast = useToast()

  const [diaSel, setDiaSel] = useState(FECHA_HOY)
  const scrollRef = useRef<ScrollView>(null)
  /** Posición vertical de la tarjeta del formulario para hacer scroll al editar. */
  const formY = useRef(0)

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

  const onRangoGuardado = useCallback(() => toast.exito('Rango de fechas guardado'), [toast])
  const { fechaDesde, fechaHasta, setFechaDesde, setFechaHasta } = useFiltroFechas(
    user.uid,
    FECHA_HOY,
    onRangoGuardado,
  )

  const diasRango = useMemo(
    () => generarDiasRango(fechaDesde, fechaHasta, registros),
    [fechaDesde, fechaHasta, registros],
  )

  const diaAnterior = desplazarDia(diaSel, -1)
  const datos = registros[diaSel] || {}
  const datosAnterior = registros[diaAnterior] || {}

  /** Estable: evita re-renderizar todos los campos al escribir en uno. */
  const actualizar = useCallback(
    (campo: ClaveDatosRegistro, valor: string | boolean) => actualizarCampo(diaSel, campo, valor),
    [diaSel, actualizarCampo],
  )

  /** Selecciona un día y desplaza la vista hasta el formulario. */
  const editarDia = useCallback((fecha: string) => {
    setDiaSel(fecha)
    scrollRef.current?.scrollTo({ y: formY.current, animated: true })
  }, [])

  /** Genera el PDF del rango y lo abre en el share-sheet. */
  const exportar = useCallback(async () => {
    if (diasRango.length === 0) {
      toast.aviso('No hay días en el rango seleccionado')
      return
    }
    try {
      const filePath = await generarPdf(
        diasRango,
        user.displayName || user.email || 'Usuario',
      )
      if (!filePath) {
        toast.error('No se pudo generar el PDF')
        return
      }
      if (!(await Sharing.isAvailableAsync())) {
        toast.aviso('Compartir no está disponible en este dispositivo')
        return
      }
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Resumen nutricional',
      })
    } catch (err) {
      console.error('Error generando el PDF:', err)
      toast.error('Error al generar el PDF')
    }
  }, [diasRango, user.displayName, user.email, toast])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colores.bgStart }]} edges={['top']}>
      <Header user={user} onAlternarTema={alternar} onLogout={() => void logout()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
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
              <View
                onLayout={e => {
                  formY.current = e.nativeEvent.layout.y
                }}
              >
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
              </View>
              <WaterGoals metas={metas} onGuardar={guardarMeta} onBorrar={borrarMeta} />
              <WeightTracker chartData={chartData} onGuardar={guardarPeso} onBorrar={borrarPeso} />
              <ResumenRango
                desde={fechaDesde}
                hasta={fechaHasta}
                dias={diasRango}
                hoy={FECHA_HOY}
                onCambiarDesde={setFechaDesde}
                onCambiarHasta={setFechaHasta}
                onExportar={() => void exportar()}
                onEditarDia={editarDia}
              />
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