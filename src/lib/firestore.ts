import {
  collection,
  query,
  where,
  limit,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from '@react-native-firebase/firestore'
import { db } from './firebase'
import type {
  AjustesUsuario,
  DatosRegistro,
  MetaAgua,
  PesosPorFecha,
  Registro,
  RegistrosPorFecha,
  RegistroPeso,
} from '../types'

/**
 * Construye el ID de un documento a partir del usuario y la fecha. Patrón usado
 * en toda la base de datos (mismo esquema que la versión web) para que cada
 * usuario tenga IDs deterministas y `setDoc` actúe como upsert.
 */
export function idDocumento(userId: string, fecha: string): string {
  return `${userId}_${fecha}`
}

/**
 * Carga hasta 500 registros del usuario indexados por fecha.
 * @param userId ID del usuario autenticado.
 */
export async function cargarRegistros(userId: string): Promise<RegistrosPorFecha> {
  const q = query(collection(db, 'registros'), where('userId', '==', userId), limit(500))
  const snapshot = await getDocs(q)
  const mapa: RegistrosPorFecha = {}
  snapshot.forEach(docSnap => {
    const { fecha, ...rest } = docSnap.data()
    mapa[fecha as string] = rest as unknown as DatosRegistro
  })
  return mapa
}

/**
 * Persiste un registro diario completo. `setDoc` sobreescribe si existe o crea
 * si no, de modo que la operación es un upsert natural.
 */
export async function guardarRegistro(registro: Registro): Promise<void> {
  await setDoc(doc(db, 'registros', idDocumento(registro.userId, registro.fecha)), registro)
}

/** Carga hasta 500 pesos del usuario indexados por fecha. */
export async function cargarPesos(userId: string): Promise<PesosPorFecha> {
  const snap = await getDocs(query(collection(db, 'peso'), where('userId', '==', userId), limit(500)))
  const mapa: PesosPorFecha = {}
  snap.forEach(d => {
    const { fecha, peso } = d.data()
    mapa[fecha as string] = peso as number
  })
  return mapa
}

/** Persiste un registro de peso (upsert sobre `peso/{userId}_{fecha}`). */
export async function guardarPeso(peso: RegistroPeso): Promise<void> {
  await setDoc(doc(db, 'peso', idDocumento(peso.userId, peso.fecha)), peso)
}

/** Elimina el peso de una fecha concreta. */
export async function borrarPeso(userId: string, fecha: string): Promise<void> {
  await deleteDoc(doc(db, 'peso', idDocumento(userId, fecha)))
}

/**
 * Carga las metas de agua del usuario ordenadas por fecha de inicio.
 * @param userId ID del usuario autenticado.
 */
export async function cargarMetasAgua(userId: string): Promise<MetaAgua[]> {
  const q = query(collection(db, 'waterGoals'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const metas: MetaAgua[] = []
  snap.forEach(g => {
    metas.push(g.data() as unknown as MetaAgua)
  })
  return metas.sort((a, b) => a.startDate.localeCompare(b.startDate))
}

/** Persiste una meta de agua (upsert sobre `waterGoals/{userId}_{startDate}`). */
export async function guardarMetaAgua(userId: string, meta: MetaAgua): Promise<void> {
  await setDoc(doc(db, 'waterGoals', `${userId}_${meta.startDate}`), { userId, ...meta })
}

/** Elimina la meta de agua cuyo rango empieza en `startDate`. */
export async function borrarMetaAgua(userId: string, startDate: string): Promise<void> {
  await deleteDoc(doc(db, 'waterGoals', `${userId}_${startDate}`))
}

/** Carga los ajustes del usuario (devuelve vacío si aún no existen). */
export async function cargarAjustes(userId: string): Promise<AjustesUsuario> {
  const snap = await getDoc(doc(db, 'userSettings', userId))
  return (snap.exists() ? snap.data() : {}) as unknown as AjustesUsuario
}

/** Persiste los ajustes del usuario haciendo merge sobre `userSettings/{userId}`. */
export async function guardarAjustes(userId: string, ajustes: AjustesUsuario): Promise<void> {
  await setDoc(doc(db, 'userSettings', userId), ajustes, { merge: true })
}