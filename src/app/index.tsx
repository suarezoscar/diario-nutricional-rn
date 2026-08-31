import { StyleSheet, Text, View } from 'react-native'

/**
 * Pantalla inicial provisional. En fases posteriores el index mostrará el
 * login o la pantalla principal según el estado de sesión.
 */
export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Diario Nutricional</Text>
      <Text style={styles.subtitulo}>Aplicación nativa — en construcción</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitulo: {
    fontSize: 14,
    opacity: 0.7,
  },
})