/**
 * Paleta de colores de la aplicación, portada del tema «Calma» de la versión web.
 * Se define un objeto por modo (claro/oscuro) consumido a través de `ThemeContext`.
 */

export interface Colores {
  bgStart: string
  bgEnd: string
  card: string
  primary: string
  primaryLight: string
  primarySoft: string
  primaryDark: string
  accent: string
  accentSoft: string
  text: string
  textLight: string
  textSoft: string
  border: string
  input: string
  error: string
  errorSoft: string
  warning: string
  success: string
}

export const coloresClaros: Colores = {
  bgStart: '#eaf4ea',
  bgEnd: '#f7f4ef',
  card: '#ffffff',
  primary: '#7a9e7e',
  primaryLight: '#d4e6d4',
  primarySoft: '#edf5ed',
  primaryDark: '#5c7a5e',
  accent: '#e8c4a2',
  accentSoft: '#fdf0e5',
  text: '#4a4a4a',
  textLight: '#999999',
  textSoft: '#b8b8b8',
  border: '#e8e6e1',
  input: '#f9faf8',
  error: '#c06050',
  errorSoft: '#fbeae7',
  warning: '#c88a4a',
  success: '#4a9e5c',
}

export const coloresOscuros: Colores = {
  bgStart: '#1a1f1a',
  bgEnd: '#1f241f',
  card: '#252925',
  primary: '#8aae8e',
  primaryLight: '#2a3a2e',
  primarySoft: '#1e2a20',
  primaryDark: '#a0c4a0',
  accent: '#c8a47a',
  accentSoft: '#2a2218',
  text: '#d4d4d4',
  textLight: '#888888',
  textSoft: '#555555',
  border: '#333333',
  input: '#1a1f1a',
  error: '#e07060',
  errorSoft: '#3a2320',
  warning: '#d0a050',
  success: '#5aae6c',
}