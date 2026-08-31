import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import AuthScreen from '@/components/AuthScreen'
import PantallaPrincipal from '@/components/PantallaPrincipal'

/**
 * Pantalla inicial: actúa de gate de sesión. Mientras Firebase restaura la
 * sesión se muestra un indicador; si no hay usuario se renderiza el login y,
 * si lo hay, la pantalla principal.
 */
export default function IndexScreen() {
  const { user, loading } = useAuth()
  const { colores } = useTheme()

  if (loading) {
    return (
      <View style={[styles.centro, { backgroundColor: colores.bgStart }]}>
        <ActivityIndicator size="large" color={colores.primary} />
      </View>
    )
  }

  return user ? <PantallaPrincipal user={user} /> : <AuthScreen />
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})