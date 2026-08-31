import { memo } from 'react'
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import { ArrowBendLeftUp, CheckCircle, Spinner, XCircle } from 'phosphor-react-native'
import { CLAVE_FUERA_POR_COMIDA } from '../config/campos'
import { useTheme } from '../context/ThemeContext'
import type { ClaveComida, ClaveDatosRegistro, CampoConfig, EstadoCampo } from '../types'

interface CampoFormProps {
  /** Configuración del campo a renderizar. */
  campo: CampoConfig
  /** Valor actual del campo. */
  valor: string
  /** Valor del campo en el día anterior (para el botón «copiar»). */
  valorAnterior: string
  /** Marcador «fuera de casa» (solo comidas). */
  valorFuera?: boolean
  /** Estado del guardado de este campo (badge junto a la etiqueta). */
  estado?: EstadoCampo | null
  /** Litros objetivo del día activo (solo para el campo agua). */
  metaAgua: number
  /** Reintenta el guardado (se usa cuando `estado === 'error'`). */
  onReintentar?: () => void
  onActualizar: (campo: ClaveDatosRegistro, valor: string | boolean) => void
}

/**
 * Campo del formulario diario. Memoizado para que editar un campo no
 * re-renderice los demás (evita lag y pérdida de foco en React Native).
 */
const CampoForm = memo(function CampoForm({
  campo,
  valor,
  valorAnterior,
  valorFuera,
  estado,
  metaAgua,
  onReintentar,
  onActualizar,
}: CampoFormProps) {
  const { colores } = useTheme()
  const esNumero = campo.tipo === 'numero'
  const len = valor.length
  const near = campo.maxLen !== undefined && len > campo.maxLen * 0.85
  const over = campo.maxLen !== undefined && len > campo.maxLen
  // Solo las comidas admiten el marcador «fuera de casa»
  const fueraKey =
    campo.tipo !== 'numero' && campo.isMeal
      ? CLAVE_FUERA_POR_COMIDA[campo.key as ClaveComida]
      : null

  const estiloInput = [
    styles.input,
    {
      backgroundColor: colores.input,
      color: colores.text,
      borderColor: colores.border,
    },
  ]

  return (
    <View style={styles.grupo}>
      <View style={styles.etiquetaFila}>
        <campo.icono size={18} weight="duotone" color={campo.colorIcono} />
        <Text style={[styles.etiqueta, { color: colores.text }]}>{campo.label}</Text>

        {valorAnterior.trim().length > 0 && (
          <Pressable
            onPress={() => onActualizar(campo.key, valorAnterior)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Copiar del día anterior"
          >
            <ArrowBendLeftUp size={14} weight="bold" color={colores.primary} />
          </Pressable>
        )}

        {estado === 'saving' && (
          <View style={styles.badge}>
            <Spinner size={12} weight="bold" color={colores.primary} />
            <Text style={[styles.badgeTexto, { color: colores.primary }]}>Guardando</Text>
          </View>
        )}
        {estado === 'saved' && (
          <View style={styles.badge}>
            <CheckCircle size={12} weight="bold" color={colores.success} />
            <Text style={[styles.badgeTexto, { color: colores.success }]}>Guardado</Text>
          </View>
        )}
        {estado === 'error' && (
          <Pressable onPress={onReintentar} hitSlop={8} accessibilityRole="button" accessibilityLabel="Reintentar guardado">
            <View style={styles.badge}>
              <XCircle size={12} weight="bold" color={colores.error} />
              <Text style={[styles.badgeTexto, { color: colores.error }]}>Reintentar</Text>
            </View>
          </Pressable>
        )}

        {campo.maxLen !== undefined && (
          <Text
            style={[
              styles.contador,
              { color: over ? colores.error : near ? colores.warning : colores.textLight },
            ]}
          >
            {len}/{campo.maxLen}
          </Text>
        )}
      </View>

      {esNumero ? (
        <>
          <TextInput
            style={estiloInput}
            keyboardType="decimal-pad"
            placeholder={campo.ejemplo}
            placeholderTextColor={colores.textSoft}
            value={valor}
            onChangeText={texto => onActualizar(campo.key, texto)}
            maxLength={campo.maxLen}
          />
          {campo.key === 'agua' && metaAgua > 0 && (
            <BarraAgua consumido={parseFloat(valor) || 0} meta={metaAgua} />
          )}
        </>
      ) : (
        <TextInput
          style={[...estiloInput, styles.multilinea]}
          multiline
          placeholder={`Ej: ${campo.ejemplo}`}
          placeholderTextColor={colores.textSoft}
          value={valor}
          onChangeText={texto => onActualizar(campo.key, texto)}
          maxLength={campo.maxLen}
        />
      )}

      {fueraKey && (
        <View style={styles.fueraFila}>
          <Switch
            value={!!valorFuera}
            onValueChange={activo => onActualizar(fueraKey, activo)}
            trackColor={{ false: colores.border, true: colores.primary }}
            thumbColor="#fff"
          />
          <Text style={[styles.fueraTexto, { color: colores.textLight }]}>Fuera de casa</Text>
        </View>
      )}
    </View>
  )
})

/** Barra de progreso del agua respecto a la meta del día. */
function BarraAgua({ consumido, meta }: { consumido: number; meta: number }) {
  const { colores } = useTheme()
  const porcentaje = Math.min(100, (consumido / meta) * 100)
  return (
    <View style={styles.aguaFila}>
      <View style={[styles.aguaTrack, { backgroundColor: colores.border }]}>
        <View style={[styles.aguaFill, { width: `${porcentaje}%`, backgroundColor: colores.primary }]} />
      </View>
      <Text style={[styles.aguaLabel, { color: colores.textLight }]}>
        {consumido || '0'} de {meta}L
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  grupo: {
    gap: 6,
  },
  etiquetaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  contador: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilinea: {
    minHeight: 52,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  fueraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  fueraTexto: {
    fontSize: 13,
  },
  aguaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  aguaTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  aguaFill: {
    height: '100%',
    borderRadius: 4,
  },
  aguaLabel: {
    fontSize: 12,
    minWidth: 70,
    textAlign: 'right',
  },
})

export default CampoForm