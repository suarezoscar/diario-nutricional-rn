import { useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { CheckCircle, Lock } from 'phosphor-react-native'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface ChangePasswordModalProps {
  visible: boolean
  onClose: () => void
}

/**
 * Modal para cambiar la contraseña. Reautentica con la contraseña actual
 * (Firebase requiere login reciente) antes de actualizarla.
 */
export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { changePassword } = useAuth()
  const { colores } = useTheme()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    setActual('')
    setNueva('')
    setConfirmar('')
    setError('')
    setExito(false)
    onClose()
  }

  const enviar = async () => {
    setError('')
    if (nueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (actual === nueva) {
      setError('La nueva contraseña debe ser diferente de la actual')
      return
    }
    setEnviando(true)
    try {
      await changePassword(actual, nueva)
      setExito(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/wrong-password') {
        setError('La contraseña actual es incorrecta')
      } else if (code === 'auth/requires-recent-login') {
        setError('Por seguridad, cierra sesión y vuelve a entrar para cambiar la contraseña')
      } else {
        setError((err as Error).message || 'Error al cambiar la contraseña')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colores.card, borderColor: colores.border }]}>
          <Text style={[styles.titulo, { color: colores.text }]}>
            <Lock size={20} weight="duotone" color={colores.primary} />  Cambiar contraseña
          </Text>

          {exito ? (
            <View style={styles.exito}>
              <CheckCircle size={34} weight="fill" color={colores.success} />
              <Text style={[styles.exitoTexto, { color: colores.text }]}>
                ¡Contraseña cambiada con éxito!
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <CampoPassword
                etiqueta="Contraseña actual"
                valor={actual}
                onChange={setActual}
                placeholder="••••••••"
              />
              <CampoPassword
                etiqueta="Nueva contraseña"
                valor={nueva}
                onChange={setNueva}
                placeholder="Mínimo 6 caracteres"
              />
              <CampoPassword
                etiqueta="Confirmar nueva contraseña"
                valor={confirmar}
                onChange={setConfirmar}
                placeholder="Repite la nueva contraseña"
              />

              {error ? (
                <Text style={[styles.error, { color: colores.error, backgroundColor: colores.accentSoft }]}>
                  {error}
                </Text>
              ) : null}

              <View style={styles.botones}>
                <Pressable
                  style={[styles.botonSecundario, { backgroundColor: colores.primarySoft }]}
                  onPress={cerrar}
                  accessibilityRole="button"
                >
                  <Text style={[styles.botonSecundarioTexto, { color: colores.primaryDark }]}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.botonPrimario, { backgroundColor: colores.primary }]}
                  onPress={() => void enviar()}
                  disabled={enviando}
                  accessibilityRole="button"
                >
                  {enviando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.botonPrimarioTexto}>Cambiar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

/** Campo de contraseña con etiqueta. */
function CampoPassword({
  etiqueta,
  valor,
  onChange,
  placeholder,
}: {
  etiqueta: string
  valor: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const { colores } = useTheme()
  return (
    <View style={styles.campo}>
      <Text style={[styles.etiqueta, { color: colores.textLight }]}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colores.input, color: colores.text, borderColor: colores.border }]}
        placeholder={placeholder}
        placeholderTextColor={colores.textSoft}
        value={valor}
        onChangeText={onChange}
        secureTextEntry
        autoCapitalize="none"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
  },
  form: {
    gap: 12,
  },
  campo: {
    gap: 4,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 13,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botonSecundario: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPrimarioTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  exito: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  exitoTexto: {
    fontSize: 15,
    fontWeight: '500',
  },
})