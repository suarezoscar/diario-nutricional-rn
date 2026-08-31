import { Pressable, StyleSheet, Text, View } from 'react-native'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChartBar, FilePdf, NotePencil, Storefront } from 'phosphor-react-native'
import { CLAVE_FUERA_POR_COMIDA } from '../config/campos'
import { useTheme } from '../context/ThemeContext'
import CampoFecha from './CampoFecha'
import type { ClaveComida, DatosRegistro, DiaRango } from '../types'

interface ResumenRangoProps {
  desde: string
  hasta: string
  dias: DiaRango[]
  hoy: string
  onCambiarDesde: (v: string) => void
  onCambiarHasta: (v: string) => void
  onExportar: () => void
  onEditarDia: (fecha: string) => void
}

/** Campos de comida que se muestran en cada fila del resumen. */
const COMIDAS: ClaveComida[] = ['desayuno', 'mediaManana', 'comida', 'merienda', 'cena']

/**
 * Sección de resumen por fechas: selector de rango, botón de PDF y listado por
 * día. Los días se pintan con `map` (rangos acotados) dentro del ScrollView
 * principal, evitando el anidamiento de VirtualizedList.
 */
export default function ResumenRango({
  desde,
  hasta,
  dias,
  hoy,
  onCambiarDesde,
  onCambiarHasta,
  onExportar,
  onEditarDia,
}: ResumenRangoProps) {
  const { colores } = useTheme()

  return (
    <View style={[styles.card, { backgroundColor: colores.card, borderColor: colores.border }]}>
      <Text style={[styles.titulo, { color: colores.primaryDark }]}>
        <ChartBar size={20} weight="duotone" color={colores.primary} />  Resumen por fechas
      </Text>

      <View style={styles.rango}>
        <View style={styles.campoFecha}>
          <CampoFecha etiqueta="Desde" valor={desde} onCambio={onCambiarDesde} maximo={hasta} />
        </View>
        <View style={styles.campoFecha}>
          <CampoFecha etiqueta="Hasta" valor={hasta} onCambio={onCambiarHasta} minimo={desde} />
        </View>
        <Pressable
          onPress={onExportar}
          style={[styles.botonPdf, { backgroundColor: colores.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Exportar PDF"
        >
          <FilePdf size={18} weight="bold" color="#fff" />
        </Pressable>
      </View>

      {dias.length === 0 ? (
        <Text style={[styles.vacio, { color: colores.textLight }]}>
          La fecha «desde» no puede ser posterior a «hasta»
        </Text>
      ) : (
        dias.map(d => (
          <FilaDia key={d.key} d={d} hoy={hoy} colores={colores} onEditarDia={onEditarDia} />
        ))
      )}
    </View>
  )
}

interface FilaDiaProps {
  d: DiaRango
  hoy: string
  colores: ReturnType<typeof useTheme>['colores']
  onEditarDia: (fecha: string) => void
}

/** Fila de un día del resumen con sus campos no vacíos. */
function FilaDia({ d, hoy, colores, onEditarDia }: FilaDiaProps) {
  const esHoy = d.key === hoy
  const campos = COMIDAS.filter(comida => d.datos[comida]).map(comida => ({ comida, datos: d.datos }))
  const extras: { etiqueta: string; valor: string }[] = []
  if (d.datos.agua) extras.push({ etiqueta: 'Agua', valor: `${d.datos.agua} L` })
  if (d.datos.ejercicio) extras.push({ etiqueta: 'Ejercicio', valor: d.datos.ejercicio })
  if (d.datos.comentarios) extras.push({ etiqueta: 'Comentarios', valor: d.datos.comentarios })

  return (
    <View style={[styles.fila, esHoy && { backgroundColor: colores.primarySoft }]}>
      <View style={styles.filaFechaCol}>
        <Text style={[styles.filaFecha, { color: esHoy ? colores.primaryDark : colores.text }]}>
          {format(d.fecha, 'EEE dd/MM', { locale: es })}
          {esHoy ? ' ●' : ''}
        </Text>
      </View>
      <View style={styles.filaContenido}>
        {campos.map(({ comida, datos }) => (
          <TextoComida key={comida} comida={comida} datos={datos} colores={colores} />
        ))}
        {extras.map(extra => (
          <Text key={extra.etiqueta} style={[styles.campo, { color: colores.text }]}>
            <Text style={[styles.campoEtiqueta, { color: colores.textLight }]}>{extra.etiqueta}: </Text>
            {extra.valor}
          </Text>
        ))}
        {campos.length === 0 && extras.length === 0 && (
          <Text style={[styles.vacio, { color: colores.textSoft }]}>—</Text>
        )}
      </View>
      <Pressable
        onPress={() => onEditarDia(d.key)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Editar día"
      >
        <NotePencil size={16} weight="bold" color={colores.textLight} />
      </Pressable>
    </View>
  )
}

/** Línea de una comida dentro de la fila, con el marcador «fuera de casa». */
function TextoComida({
  comida,
  datos,
  colores,
}: {
  comida: ClaveComida
  datos: DatosRegistro
  colores: ReturnType<typeof useTheme>['colores']
}) {
  const fuera = datos[CLAVE_FUERA_POR_COMIDA[comida]]
  return (
    <Text style={[styles.campo, { color: colores.text }]} numberOfLines={2}>
      <Text style={[styles.campoEtiqueta, { color: colores.textLight }]}>{comida}: </Text>
      {fuera && <Storefront size={12} weight="fill" color={colores.primary} />}
      {datos[comida]}
    </Text>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    gap: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
  },
  rango: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  campoFecha: {
    flex: 1,
    minWidth: 130,
  },
  botonPdf: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacio: {
    fontSize: 13,
    paddingVertical: 12,
    textAlign: 'center',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  filaFechaCol: {
    minWidth: 78,
  },
  filaFecha: {
    fontSize: 12,
    fontWeight: '700',
  },
  filaContenido: {
    flex: 1,
    gap: 2,
  },
  campo: {
    fontSize: 13,
    lineHeight: 18,
  },
  campoEtiqueta: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
})