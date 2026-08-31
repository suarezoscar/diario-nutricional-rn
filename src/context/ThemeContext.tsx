import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { coloresClaros, coloresOscuros, type Colores } from '../theme/colores'

const CLAVE_STORAGE = 'tema'

interface ContextoTema {
  /** true si el tema resuelto es oscuro. */
  oscuro: boolean
  /** Paleta de colores del tema resuelto. */
  colores: Colores
  /** Alterna claro/oscuro y persiste la elección. */
  alternar: () => void
}

const TemaContext = createContext<ContextoTema | null>(null)

/**
 * Provee el tema claro/oscuro. Arranca siguiendo la preferencia del sistema
 * (`useColorScheme`) y, si hay una elección manual persistida en AsyncStorage,
 * la aplica por encima. `alternar` guarda la elección explícita.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme()
  const [oscuro, setOscuro] = useState(() => sistema === 'dark')
  /** Evita sobrescribir la preferencia persistida con la del sistema en el arranque. */
  const cargado = useRef(false)

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_STORAGE)
      .then(valor => {
        if (valor === 'claro' || valor === 'oscuro') setOscuro(valor === 'oscuro')
      })
      .catch(() => {
        /* sin preferencia previa: se sigue el sistema */
      })
      .finally(() => {
        cargado.current = true
      })
  }, [])

  const alternar = useCallback(() => {
    setOscuro(prev => {
      const nuevo = !prev
      AsyncStorage.setItem(CLAVE_STORAGE, nuevo ? 'oscuro' : 'claro').catch(() => {})
      return nuevo
    })
  }, [])

  const colores = oscuro ? coloresOscuros : coloresClaros
  const value = useMemo(() => ({ oscuro, colores, alternar }), [oscuro, colores, alternar])

  return <TemaContext.Provider value={value}>{children}</TemaContext.Provider>
}

/** Hook de acceso al tema. */
export function useTheme(): ContextoTema {
  const ctx = useContext(TemaContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}