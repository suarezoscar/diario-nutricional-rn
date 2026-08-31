import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Leaf, LockKey, Moon, SignOut, Sun, User } from 'phosphor-react-native'
import { useTheme } from '../context/ThemeContext'
import type { UsuarioAutenticado } from '../types'

interface HeaderProps {
  user: UsuarioAutenticado
  /** Alterna el modo oscuro. */
  onAlternarTema: () => void
  onLogout: () => void
  /** Si se proporciona, muestra el botón de cambiar contraseña. */
  onCambiarPassword?: () => void
}

/** Cabecera de la aplicación: nombre, modo oscuro, cambio de contraseña y salida. */
export default function Header({ user, onAlternarTema, onLogout, onCambiarPassword }: HeaderProps) {
  const { colores, oscuro } = useTheme()

  return (
    <View style={styles.header}>
      <View style={styles.tituloFila}>
        <Leaf size={24} weight="duotone" color={colores.primary} />
        <Text style={[styles.titulo, { color: colores.primaryDark }]}>Diario Nutricional</Text>
      </View>
      <View style={styles.usuarioFila}>
        <User size={14} weight="bold" color={colores.textLight} />
        <Text style={[styles.usuario, { color: colores.textLight }]}>{user.displayName || user.email}</Text>
        <Pressable onPress={onAlternarTema} hitSlop={8} accessibilityRole="button" accessibilityLabel="Alternar modo oscuro">
          {oscuro ? <Sun size={18} weight="bold" color={colores.textLight} /> : <Moon size={18} weight="bold" color={colores.textLight} />}
        </Pressable>
        {onCambiarPassword && (
          <Pressable onPress={onCambiarPassword} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cambiar contraseña">
            <LockKey size={18} weight="bold" color={colores.textLight} />
          </Pressable>
        )}
        <Pressable onPress={onLogout} hitSlop={8} accessibilityRole="button" accessibilityLabel="Cerrar sesión">
          <SignOut size={18} weight="bold" color={colores.textLight} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 4,
  },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  usuarioFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  usuario: {
    fontSize: 13,
  },
})