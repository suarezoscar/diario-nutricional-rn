import { Stack } from 'expo-router'

/**
 * Layout raíz de la aplicación.
 *
 * En fases posteriores este layout se envolverá con los proveedores de
 * tema, toasts y autenticación, y añadirá el gate de sesión. De momento es
 * una pila de rutas mínima con las cabeceras ocultas (cada pantalla dibuja
 * la suya propia).
 */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}