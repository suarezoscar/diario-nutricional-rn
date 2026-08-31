import '@react-native-firebase/app'
import { getAuth } from '@react-native-firebase/auth'
import { getFirestore } from '@react-native-firebase/firestore'

/**
 * Instancias de Firebase (módulos nativos), con la API modular equivalente al
 * SDK web. Comparten proyecto con la versión web (`diario-nutricional-9105b`),
 * por lo que los datos son totalmente compatibles.
 */
export const auth = getAuth()
export const db = getFirestore()