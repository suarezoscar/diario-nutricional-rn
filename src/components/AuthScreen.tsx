import { useEffect, useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { CheckCircle, Envelope, Leaf, Lock, UserPlus } from 'phosphor-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const CLAVE_EMAIL_RECORDADO = 'rememberedEmail'

/**
 * Traduce los códigos de error de Firebase a mensajes legibles en español.
 * @param code Código de error devuelto por Firebase (`err.code`).
 */
function traducirError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/invalid-email': 'El email no es válido',
    'auth/user-not-found': 'No existe una cuenta con ese email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/too-many-requests': 'Demasiados intentos. Espera un momento',
    'auth/network-request-failed': 'Error de conexión. Comprueba tu internet',
  }
  return map[code] || `Error: ${code}`
}

/**
 * Pantalla de inicio de sesión, registro y recuperación de contraseña.
 * Alterna entre las tres vistas mediante estado local.
 */
export default function AuthScreen() {
  const { login, signup, resetPassword } = useAuth()
  const { colores } = useTheme()

  const [isLogin, setIsLogin] = useState(true)
  const [isReset, setIsReset] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Rellenar el email recordado de la sesión anterior.
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_EMAIL_RECORDADO)
      .then(valor => {
        if (valor) setEmail(valor)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Introduce tu email')
      return
    }
    if (!isLogin && !name.trim()) {
      setError('Introduce tu nombre')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setSubmitting(true)
    try {
      if (isLogin) {
        if (remember) await AsyncStorage.setItem(CLAVE_EMAIL_RECORDADO, email).catch(() => {})
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
    } catch (err) {
      setError(traducirError((err as { code?: string }).code || 'unknown'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Introduce tu email')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(email)
      setSuccess(
        'Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada (y el spam).',
      )
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === 'auth/user-not-found') {
        // No revelamos si el email existe o no por seguridad.
        setSuccess('Si el email está registrado, recibirás un enlace para restablecer tu contraseña.')
      } else {
        setError(traducirError(code || 'unknown'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colores.bgStart }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colores.card, borderColor: colores.border }]}>
          <View style={styles.header}>
            <Leaf size={30} weight="duotone" color={colores.primary} />
            <Text style={[styles.titulo, { color: colores.primaryDark }]}>Diario Nutricional</Text>
            <Text style={[styles.subtitulo, { color: colores.textLight }]}>
              {isReset
                ? 'Recuperar contraseña'
                : isLogin
                  ? 'Inicia sesión para ver tus registros'
                  : 'Crea una cuenta para empezar'}
            </Text>
          </View>

          {isReset ? (
            <View style={styles.form}>
              <CampoEtiqueta etiqueta="Email de tu cuenta">
                <TextInput
                  style={[styles.input, { backgroundColor: colores.input, color: colores.text, borderColor: colores.border }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colores.textSoft}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </CampoEtiqueta>

              {error ? <Text style={[styles.error, { color: colores.error, backgroundColor: colores.accentSoft }]}>{error}</Text> : null}
              {success ? (
                <View style={styles.success}>
                  <CheckCircle size={32} weight="fill" color={colores.success} />
                  <Text style={[styles.successTexto, { color: colores.text }]}>{success}</Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.boton, { backgroundColor: colores.primary }]}
                onPress={handleReset}
                disabled={submitting}
                accessibilityRole="button"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.botonContenido}>
                    <Envelope size={16} weight="bold" color="#fff" />
                    <Text style={styles.botonTexto}>Enviar enlace</Text>
                  </View>
                )}
              </Pressable>

              <Enlace onPress={() => { setIsReset(false); setError(''); setSuccess('') }}>
                ← Volver al inicio de sesión
              </Enlace>
            </View>
          ) : (
            <View style={styles.form}>
              {!isLogin && (
                <CampoEtiqueta etiqueta="Nombre">
                  <TextInput
                    style={[styles.input, { backgroundColor: colores.input, color: colores.text, borderColor: colores.border }]}
                    placeholder="Tu nombre"
                    placeholderTextColor={colores.textSoft}
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                  />
                </CampoEtiqueta>
              )}

              <CampoEtiqueta etiqueta="Email">
                <TextInput
                  style={[styles.input, { backgroundColor: colores.input, color: colores.text, borderColor: colores.border }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colores.textSoft}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </CampoEtiqueta>

              <CampoEtiqueta etiqueta="Contraseña">
                <TextInput
                  style={[styles.input, { backgroundColor: colores.input, color: colores.text, borderColor: colores.border }]}
                  placeholder="••••••••"
                  placeholderTextColor={colores.textSoft}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </CampoEtiqueta>

              {isLogin && (
                <Pressable style={styles.recuerdame} onPress={() => setRemember(prev => !prev)}>
                  <View style={[styles.checkbox, { borderColor: colores.primary, backgroundColor: remember ? colores.primary : 'transparent' }]}>
                    {remember ? <Text style={styles.check}>✓</Text> : null}
                  </View>
                  <Text style={[styles.recuerdameTexto, { color: colores.textLight }]}>Recuérdame</Text>
                </Pressable>
              )}

              {error ? <Text style={[styles.error, { color: colores.error, backgroundColor: colores.accentSoft }]}>{error}</Text> : null}

              <Pressable
                style={[styles.boton, { backgroundColor: colores.primary }]}
                onPress={handleSubmit}
                disabled={submitting}
                accessibilityRole="button"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.botonContenido}>
                    {isLogin ? <Lock size={16} weight="bold" color="#fff" /> : <UserPlus size={16} weight="bold" color="#fff" />}
                    <Text style={styles.botonTexto}>{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
                  </View>
                )}
              </Pressable>

              <View style={styles.enlaces}>
                {isLogin ? (
                  <>
                    <Text style={[styles.textoEnlace, { color: colores.textLight }]}>
                      ¿No tienes cuenta?{' '}
                      <Enlace onPress={() => { setIsLogin(false); setError('') }}>Crear una</Enlace>
                    </Text>
                    <Enlace onPress={() => { setIsReset(true); setError(''); setSuccess('') }}>
                      ¿Olvidaste tu contraseña?
                    </Enlace>
                  </>
                ) : (
                  <Text style={[styles.textoEnlace, { color: colores.textLight }]}>
                    ¿Ya tienes cuenta?{' '}
                    <Enlace onPress={() => { setIsLogin(true); setError('') }}>Iniciar sesión</Enlace>
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/** Etiqueta de campo con texto pequeño sobre el input. */
function CampoEtiqueta({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  const { colores } = useTheme()
  return (
    <View style={styles.campo}>
      <Text style={[styles.etiqueta, { color: colores.textLight }]}>{etiqueta}</Text>
      {children}
    </View>
  )
}

/** Enlace de texto con estilo del tema. */
function Enlace({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  const { colores } = useTheme()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6}>
      <Text style={[styles.enlace, { color: colores.primary }]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 32,
    paddingHorizontal: 22,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: { alignItems: 'center', marginBottom: 24, gap: 6 },
  titulo: { fontSize: 22, fontWeight: '700' },
  subtitulo: { fontSize: 13 },
  form: { gap: 14 },
  campo: { gap: 4 },
  etiqueta: { fontSize: 13, fontWeight: '500' },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  recuerdame: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#fff', fontSize: 12, fontWeight: '700' },
  recuerdameTexto: { fontSize: 13 },
  error: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, fontSize: 13 },
  success: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  successTexto: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  boton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  botonContenido: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: '700' },
  enlaces: { alignItems: 'center', gap: 10, marginTop: 12 },
  textoEnlace: { fontSize: 13 },
  enlace: { fontSize: 13, fontWeight: '700' },
})