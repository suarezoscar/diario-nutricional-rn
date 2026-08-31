import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

/**
 * Pantalla principal. Por ahora es un marcador con el usuario y la opción de
 * cerrar sesión; en la siguiente fase se construye el diario completo.
 */
export default function PantallaPrincipal() {
  const { user, logout } = useAuth()
  const { colores } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colores.bgStart }]}>
      <Text style={[styles.titulo, { color: colores.primaryDark }]}>Diario Nutricional</Text>
      <Text style={[styles.subtitulo, { color: colores.textLight }]}>
        Sesión iniciada: {user?.displayName || user?.email}
      </Text>
      <Pressable
        style={[styles.boton, { backgroundColor: colores.primary }]}
        onPress={() => void logout()}
        accessibilityRole="button"
      >
        <Text style={styles.botonTexto}>Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  titulo: { fontSize: 22, fontWeight: '700' },
  subtitulo: { fontSize: 14 },
  boton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
})