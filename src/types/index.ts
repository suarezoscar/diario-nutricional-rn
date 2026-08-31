import type { Icon } from 'phosphor-react-native'

/** Clave de una comida del formulario diario (admite el marcador «fuera de casa»). */
export type ClaveComida = 'desayuno' | 'mediaManana' | 'comida' | 'merienda' | 'cena'

/** Clave de un checkbox «fuera de casa» ligado a una comida. */
export type ClaveCampoFuera =
  | 'desayunoFuera'
  | 'mediaMananaFuera'
  | 'comidaFuera'
  | 'meriendaFuera'
  | 'cenaFuera'

/** Clave de los campos de texto del formulario diario. */
export type ClaveCampoTexto = ClaveComida | 'ejercicio' | 'comentarios'

/** Clave del campo numérico del formulario diario (agua, en litros). */
export type ClaveCampoNumero = 'agua'

/** Clave de cualquier campo editable del formulario. */
export type ClaveCampo = ClaveCampoTexto | ClaveCampoNumero

/** Todas las claves editables de un registro diario (campos + marcadores). */
export type ClaveDatosRegistro = keyof DatosRegistro

/**
 * Datos editables de un registro diario (sin metadatos). Los valores de texto
 * se guardan tal cual los introduce el usuario; `agua` se conserva como string
 * porque viene directamente del input numérico.
 */
export interface DatosRegistro {
  desayuno?: string
  desayunoFuera?: boolean
  mediaManana?: string
  mediaMananaFuera?: boolean
  comida?: string
  comidaFuera?: boolean
  merienda?: string
  meriendaFuera?: boolean
  cena?: string
  cenaFuera?: boolean
  agua?: string
  ejercicio?: string
  comentarios?: string
}

/**
 * Documento completo de la colección Firestore `registros`. Se persiste con
 * `set` de Firestore, que actúa como upsert (crea o sobreescribe).
 */
export interface Registro extends DatosRegistro {
  userId: string
  /** Fecha en formato `yyyy-MM-dd`, parte del ID del documento. */
  fecha: string
}

/** Mapa `fecha (yyyy-MM-dd) → datos` mantenido en memoria. */
export type RegistrosPorFecha = Record<string, DatosRegistro>

/** Documento de la colección Firestore `peso`. */
export interface RegistroPeso {
  userId: string
  /** Fecha en formato `yyyy-MM-dd`, parte del ID del documento. */
  fecha: string
  /** Peso en kilogramos. */
  peso: number
}

/** Mapa `fecha (yyyy-MM-dd) → peso en kg`. */
export type PesosPorFecha = Record<string, number>

/** Punto del gráfico de peso (datos ordenados por fecha). */
export interface PuntoPeso {
  fecha: string
  peso: number
}

/** Documento de la colección Firestore `waterGoals`. */
export interface MetaAgua {
  /** Fecha inicial del rango (`yyyy-MM-dd`), parte del ID del documento. */
  startDate: string
  /** Fecha final del rango (`yyyy-MM-dd`). */
  endDate: string
  /** Litros diarios objetivo dentro del rango. */
  litersPerDay: number
}

/** Ajustes persistentes del usuario en Firestore (`userSettings`). */
export interface AjustesUsuario {
  /** Extremo inferior del filtro de fechas (`yyyy-MM-dd`). */
  filterStart?: string
  /** Extremo superior del filtro de fechas (`yyyy-MM-dd`). */
  filterEnd?: string
}

/** Día dentro del rango seleccionado, listo para renderizar o exportar. */
export interface DiaRango {
  /** Clave `yyyy-MM-dd` del día. */
  key: string
  /** Objeto Date (a medianoche local) del día. */
  fecha: Date
  /** Datos del registro del día (vacío si no hay). */
  datos: DatosRegistro
}

/** Estado visual del guardado de un campo individual. */
export type EstadoCampo = 'saving' | 'saved' | 'error'

/** Datos mínimos del usuario autenticado que consume la aplicación. */
export interface UsuarioAutenticado {
  uid: string
  email: string | null
  displayName: string | null
}

/** Base común de la configuración de un campo del formulario. */
interface BaseCampoConfig {
  key: ClaveCampo
  /** Etiqueta mostrada en la UI. */
  label: string
  /** Icono decorativo de la etiqueta (componente de phosphor-react-native). */
  icono: Icon
  /** Color del icono de la etiqueta. */
  colorIcono: string
  /** Texto de ejemplo usado como placeholder. */
  ejemplo: string
  /** Longitud máxima del valor (con contador de caracteres). */
  maxLen?: number
  /** Ocupa el ancho completo de la cuadrícula. */
  full?: boolean
}

/** Configuración de un campo de texto (TextInput multilinea). */
export interface CampoTextoConfig extends BaseCampoConfig {
  tipo?: 'texto'
  /** Si es una comida, muestra el marcador «fuera de casa». */
  isMeal?: boolean
}

/** Configuración de un campo numérico (TextInput con teclado decimal). */
export interface CampoNumeroConfig extends BaseCampoConfig {
  tipo: 'numero'
  step: string
  min: string
  max: string
}

/** Configuración de un campo del formulario (union discriminada por `tipo`). */
export type CampoConfig = CampoTextoConfig | CampoNumeroConfig