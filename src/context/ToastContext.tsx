import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CheckCircle, Info, WarningCircle, XCircle, type Icon } from 'phosphor-react-native'
import { useTheme } from './ThemeContext'
import type { Colores } from '../theme/colores'

/** Tipo visual de un toast. */
export type TipoToast = 'exito' | 'error' | 'info' | 'aviso'

/** Acción opcional del toast (p. ej. «Reintentar»). */
export interface AccionToast {
  label: string
  onClick: () => void
}

/** Opciones al publicar un toast. */
interface OpcionesToast {
  accion?: AccionToast
  /** Duración en ms; por defecto 3000 (6000 si lleva acción). */
  duracion?: number
}

/** API expuesta por el contexto de toasts. */
export interface ContextoToast {
  exito: (mensaje: string, opciones?: OpcionesToast) => void
  error: (mensaje: string, opciones?: OpcionesToast) => void
  info: (mensaje: string, opciones?: OpcionesToast) => void
  aviso: (mensaje: string, opciones?: OpcionesToast) => void
}

/** Número máximo de toasts visibles a la vez. */
const MAX_TOASTS = 5

const ToastContext = createContext<ContextoToast | null>(null)

const ICONO_POR_TIPO: Record<TipoToast, Icon> = {
  exito: CheckCircle,
  error: XCircle,
  info: Info,
  aviso: WarningCircle,
}

/** Color de acento de cada tipo (icono, borde izquierdo y texto de acción). */
function colorDeTipo(tipo: TipoToast, colores: Colores): string {
  switch (tipo) {
    case 'exito':
      return colores.success
    case 'error':
      return colores.error
    case 'info':
      return colores.primary
    case 'aviso':
      return colores.warning
  }
}

/** Fondo tintado de cada tipo. */
function fondoDeTipo(tipo: TipoToast, colores: Colores): string {
  switch (tipo) {
    case 'exito':
      return colores.primarySoft
    case 'error':
      return colores.errorSoft
    case 'info':
      return colores.card
    case 'aviso':
      return colores.accentSoft
  }
}

/**
 * Provee el sistema de toasts en-app. Los toasts se muestran como una capa
 * superpuesta fija en la parte superior (overlay, sin bloquear la interacción).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<
    { id: number; tipo: TipoToast; mensaje: string; accion?: AccionToast; duracion: number }[]
  >([])
  const nextId = useRef(1)

  const despedir = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const mostrar = useCallback(
    (tipo: TipoToast, mensaje: string, opciones?: OpcionesToast) => {
      const id = nextId.current++
      const duracion = opciones?.duracion ?? (opciones?.accion ? 6000 : 3000)
      setToasts(prev => [
        ...prev.slice(-(MAX_TOASTS - 1)),
        { id, tipo, mensaje, duracion, accion: opciones?.accion },
      ])
      if (duracion > 0) setTimeout(() => despedir(id), duracion)
    },
    [despedir],
  )

  const api = useMemo<ContextoToast>(
    () => ({
      exito: (mensaje, opciones) => mostrar('exito', mensaje, opciones),
      error: (mensaje, opciones) => mostrar('error', mensaje, opciones),
      info: (mensaje, opciones) => mostrar('info', mensaje, opciones),
      aviso: (mensaje, opciones) => mostrar('aviso', mensaje, opciones),
    }),
    [mostrar],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDespedir={despedir} />
    </ToastContext.Provider>
  )
}

/** Hook de acceso a la API de toasts. */
export function useToast(): ContextoToast {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

interface ToastViewportProps {
  toasts: { id: number; tipo: TipoToast; mensaje: string; accion?: AccionToast; duracion: number }[]
  onDespedir: (id: number) => void
}

/** Capa superpuesta que apila los toasts visibles. */
function ToastViewport({ toasts, onDespedir }: ToastViewportProps) {
  const { colores } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      pointerEvents="box-none"
      style={[styles.viewport, { top: insets.top + 12 }]}
      accessibilityLiveRegion="polite"
    >
      {toasts.map(toast => (
        <ToastCard key={toast.id} toast={toast} colores={colores} onDespedir={onDespedir} />
      ))}
    </View>
  )
}

interface ToastCardProps {
  toast: { id: number; tipo: TipoToast; mensaje: string; accion?: AccionToast; duracion: number }
  colores: Colores
  onDespedir: (id: number) => void
}

/** Tarjeta individual de un toast. */
function ToastCard({ toast, colores, onDespedir }: ToastCardProps) {
  const Icono = ICONO_POR_TIPO[toast.tipo]
  const acento = colorDeTipo(toast.tipo, colores)

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: fondoDeTipo(toast.tipo, colores),
          borderColor: colores.border,
          borderLeftColor: acento,
        },
      ]}
    >
      <Icono size={20} weight="fill" color={acento} />
      <Text style={[styles.mensaje, { color: colores.text }]}>{toast.mensaje}</Text>
      {toast.accion && (
        <Pressable
          onPress={() => {
            toast.accion?.onClick()
            onDespedir(toast.id)
          }}
          style={[styles.accion, { borderColor: acento }]}
        >
          <Text style={[styles.accionTexto, { color: acento }]}>{toast.accion.label}</Text>
        </Pressable>
      )}
      <Pressable
        onPress={() => onDespedir(toast.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Cerrar notificación"
      >
        <Text style={[styles.cerrar, { color: colores.textLight }]}>×</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 1000,
    gap: 8,
    alignItems: 'stretch',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  mensaje: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  accion: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  accionTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  cerrar: {
    fontSize: 18,
    lineHeight: 20,
    paddingHorizontal: 2,
  },
})