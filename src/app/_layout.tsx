import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'

/**
 * Layout raíz de la aplicación. Envuelve la pila de rutas con los proveedores
 * globales: área segura, tema (claro/oscuro) y toasts. El gate de sesión se
 * añadirá cuando esté disponible la autenticación.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}