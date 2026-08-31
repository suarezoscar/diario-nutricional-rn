import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { cargarRegistros, guardarRegistro } from '../lib/firestore'
import { CAMPOS, CLAVE_FUERA_POR_COMIDA } from '../config/campos'
import type {
  ClaveCampo,
  ClaveCampoFuera,
  ClaveComida,
  ClaveDatosRegistro,
  DatosRegistro,
  RegistrosPorFecha,
} from '../types'

/** Retardo del guardado automático tras la última edición. */
const DEBOUNCE_MS = 1500

/** Tiempo que se muestra el estado «Guardado» en cada campo tras autoguardarse. */
const GUARDADO_MS = 2500

/** Inverso de `CLAVE_FUERA_POR_COMIDA`: clave «Fuera» → comida. */
const CLAVE_COMIDA_POR_FUERA: Record<ClaveCampoFuera, ClaveComida> = {
  desayunoFuera: 'desayuno',
  mediaMananaFuera: 'mediaManana',
  comidaFuera: 'comida',
  meriendaFuera: 'merienda',
  cenaFuera: 'cena',
}

/** Campos guardados en el último autosave con su hora. */
export interface UltimoGuardado {
  hora: Date
  campos: ClaveCampo[]
}

/**
 * Compara el estado persistido (`prev`) con el actual y devuelve qué campos
 * cambiaron. Para las comidas, un cambio en el marcador «fuera de casa» cuenta
 * como cambio de ese campo.
 */
export function camposCambiados(prev: DatosRegistro | undefined, actual: DatosRegistro): ClaveCampo[] {
  const cambiados: ClaveCampo[] = []
  for (const campo of CAMPOS) {
    if (campo.tipo !== 'numero' && campo.isMeal) {
      const fueraKey = CLAVE_FUERA_POR_COMIDA[campo.key as ClaveComida]
      const cambioTexto = (prev?.[campo.key] ?? '') !== (actual[campo.key] ?? '')
      const cambioFuera = (prev?.[fueraKey] ?? false) !== (actual[fueraKey] ?? false)
      if (cambioTexto || cambioFuera) cambiados.push(campo.key)
    } else if ((prev?.[campo.key] ?? '') !== (actual[campo.key] ?? '')) {
      cambiados.push(campo.key)
    }
  }
  return cambiados
}

/**
 * Devuelve la clave de campo base de una clave editable. Las claves «Fuera»
 * (`desayunoFuera`, …) se resuelven a su comida para el indicador por campo.
 */
function claveCampoBase(campo: ClaveDatosRegistro): ClaveCampo {
  return (CLAVE_COMIDA_POR_FUERA as Record<string, ClaveCampo>)[campo] ?? (campo as ClaveCampo)
}

/**
 * Hook de los registros diarios con guardado automático.
 *
 * Persiste el día activo por debounce (`DEBOUNCE_MS`) tras la última edición y
 * de forma inmediata al cambiar de día, al pasar la app a segundo plano
 * (`AppState`) o al desmontar. Expone el estado visual del guardado y, por
 * campo, qué campos están sin guardar y cuáles se guardaron en el último
 * autosave (indicador por campo).
 */
export function useRegistros(
  userId: string,
  diaActivo: string,
): {
  registros: RegistrosPorFecha
  cargando: boolean
  /** Hay cambios sin persistir (debounce en curso). */
  pendiente: boolean
  guardando: boolean
  /** El último guardado falló (para mostrar «Reintentar»). */
  errorGuardado: boolean
  /** Campos modificados desde el último guardado (para el indicador por campo). */
  camposPendientes: ClaveCampo[]
  /** Último autosave con éxito: hora y campos modificados (transitorio). */
  ultimoGuardado: UltimoGuardado | null
  actualizarCampo: (fecha: string, campo: ClaveDatosRegistro, valor: string | boolean) => void
  guardarDia: (fecha: string) => Promise<void>
} {
  const [registros, setRegistros] = useState<RegistrosPorFecha>({})
  const [cargando, setCargando] = useState(true)
  const [pendiente, setPendiente] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState(false)
  const [camposPendientes, setCamposPendientes] = useState<ClaveCampo[]>([])
  const [ultimoGuardado, setUltimoGuardado] = useState<UltimoGuardado | null>(null)

  const registrosRef = useRef(registros)
  const guardandoRef = useRef(false)
  const pendienteFechaRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Timer que oculta el estado «Guardado» tras `GUARDADO_MS`. */
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Campos modificados sin persistir (espejo de `camposPendientes`). */
  const pendientesRef = useRef<Set<ClaveCampo>>(new Set())
  /** Último estado persistido por día, para detectar los campos cambiados. */
  const snapshotRef = useRef<RegistrosPorFecha>({})
  const guardarDiaRef = useRef<(fecha: string) => Promise<void>>(async () => {})

  useEffect(() => {
    registrosRef.current = registros
  }, [registros])

  // ─── Carga inicial ───
  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        setCargando(true)
        const mapa = await cargarRegistros(userId)
        if (activo) {
          setRegistros(mapa)
          snapshotRef.current = mapa
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargar()
    return () => {
      activo = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [userId])

  /**
   * Persiste el día indicado en Firestore (upsert), detecta los campos
   * modificados desde el último guardado y actualiza el estado visual.
   */
  const guardarDia = useCallback(
    async (fecha: string) => {
      if (guardandoRef.current) return
      guardandoRef.current = true
      setGuardando(true)
      setPendiente(false)
      try {
        const actual = registrosRef.current[fecha] || {}
        await guardarRegistro({ userId, fecha, ...actual })
        const cambiados = camposCambiados(snapshotRef.current[fecha], actual)
        snapshotRef.current = { ...snapshotRef.current, [fecha]: actual }
        setErrorGuardado(false)
        // Limpiar pendientes y mostrar el «Guardado» de forma transitoria.
        pendientesRef.current.clear()
        setCamposPendientes([])
        setUltimoGuardado({ hora: new Date(), campos: cambiados })
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setUltimoGuardado(null), GUARDADO_MS)
      } catch (err) {
        console.error('Error guardando:', err)
        // Los campos pendientes se mantienen para mostrar el error por campo.
        setErrorGuardado(true)
      } finally {
        guardandoRef.current = false
        setGuardando(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    guardarDiaRef.current = guardarDia
  }, [guardarDia])

  /** Programa el guardado del día tras el debounce. */
  const programarGuardado = useCallback((fecha: string) => {
    pendienteFechaRef.current = fecha
    setPendiente(true)
    setErrorGuardado(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const f = pendienteFechaRef.current
      pendienteFechaRef.current = null
      if (f) void guardarDiaRef.current(f)
    }, DEBOUNCE_MS)
  }, [])

  /** Ejecuta de inmediato el guardado pendiente (cancela el debounce). */
  const flushGuardado = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const f = pendienteFechaRef.current
    if (f) {
      pendienteFechaRef.current = null
      setPendiente(false)
      void guardarDiaRef.current(f)
    }
  }, [])

  /** Actualiza un campo del día en memoria y programa el autosave. */
  const actualizarCampo = useCallback(
    (fecha: string, campo: ClaveDatosRegistro, valor: string | boolean) => {
      setRegistros(prev => ({
        ...prev,
        [fecha]: { ...(prev[fecha] || {}), [campo]: valor },
      }))
      const base = claveCampoBase(campo)
      if (!pendientesRef.current.has(base)) {
        pendientesRef.current.add(base)
        setCamposPendientes([...pendientesRef.current])
      }
      programarGuardado(fecha)
    },
    [programarGuardado],
  )

  // Guardar lo pendiente al cambiar de día.
  useEffect(() => {
    flushGuardado()
  }, [diaActivo, flushGuardado])

  // Guardar lo pendiente al pasar la app a segundo plano y al desmontar.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', estado => {
      if (estado !== 'active') flushGuardado()
    })
    return () => {
      subscription.remove()
      flushGuardado()
    }
  }, [flushGuardado])

  return {
    registros,
    cargando,
    pendiente,
    guardando,
    errorGuardado,
    camposPendientes,
    ultimoGuardado,
    actualizarCampo,
    guardarDia,
  }
}