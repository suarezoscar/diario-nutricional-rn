# Diario Nutricional (React Native)

Aplicación nativa (Expo + React Native) del diario nutricional. Comparte el
mismo proyecto de Firebase y los mismos datos que la versión web.

## Funcionalidades

- Registro diario con **guardado automático** (debounce + flush al pasar la app
  a segundo plano) e indicador de estado por campo.
- Comidas con marcador «fuera de casa», copiar del día anterior, agua con
  barra de progreso y metas por rango de fechas.
- Ejercicio y comentarios con contador de caracteres.
- Seguimiento de peso con gráfico SVG (`react-native-svg`).
- Resumen por fechas con **exportación de PDF** (generado en cliente) y
  apertura en el share-sheet.
- Autenticación con email/contraseña (login, registro, recuperación y cambio de
  contraseña) y modo oscuro.

## Stack

Expo (SDK 57) · Expo Router · `@react-native-firebase` (auth + firestore) ·
AsyncStorage · phosphor-react-native · react-native-svg ·
`@react-native-community/datetimepicker` · react-native-html-to-pdf ·
expo-sharing · date-fns. Tests con Jest (`jest-expo`) + Testing Library RN.

## Requisitos para ejecutar

Los módulos nativos (Firebase, html-to-pdf) **no funcionan en Expo Go**; se
necesita un development build:

```bash
pnpm install
pnpm run android   # o pnpm run ios / pnpm start
```

### Firebase

La app usa el proyecto `diario-nutricional-9105b`. Para el build nativo coloca
en la raíz del proyecto (están en `.gitignore`, no se commitean):

- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

## Scripts

```bash
pnpm start        # servidor de desarrollo
pnpm android|ios  # build de desarrollo nativo
pnpm test         # tests unitarios (Jest)
pnpm lint         # ESLint de Expo
pnpm typecheck    # tsc --noEmit
```