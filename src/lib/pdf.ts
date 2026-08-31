import { generatePDF } from 'react-native-html-to-pdf'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CLAVE_FUERA_POR_COMIDA } from '../config/campos'
import type { ClaveComida, DiaRango } from '../types'

/** Prefijo en mayúsculas de las comidas consumidas fuera de casa. */
const PREFIJO_FUERA = '[FUERA] '

/** Cabeceras base en el mismo orden que las celdas de cada fila. */
const HEADERS_BASE = [
  'Día',
  'Desayuno',
  'Media m.',
  'Comida',
  'Merienda',
  'Cena',
  'Agua',
  'Ejercicio',
  'Comentarios',
]

/** Escapa caracteres HTML para evitar celdas rotas. */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Devuelve el prefijo «[FUERA] » si la comida se consumió fuera de casa. */
function prefijoFuera(d: DiaRango, comida: ClaveComida): string {
  return d.datos[CLAVE_FUERA_POR_COMIDA[comida]] ? PREFIJO_FUERA : ''
}

/**
 * Genera un PDF del resumen nutricional del rango indicado (en cliente) y
 * devuelve la ruta del archivo generado.
 *
 * La columna «Comentarios» solo se incluye si hay comentarios en el rango.
 *
 * @param dias Días del rango con sus datos (ver `generarDiasRango`).
 * @param nombre Nombre mostrado en el título (displayName o email del usuario).
 */
export async function generarPdf(
  dias: DiaRango[],
  nombre: string,
): Promise<string> {
  if (dias.length === 0) return ''

  const tieneComentarios = dias.some(d => (d.datos.comentarios ?? '').trim().length > 0)
  const headers = tieneComentarios ? HEADERS_BASE : HEADERS_BASE.slice(0, 8)

  const filas = dias.map(d => {
    const celda = (valor: string) => escapar(valor || '-')
    const fila = [
      escapar(format(d.fecha, 'EEE dd/MM', { locale: es })),
      celda(d.datos.desayuno ? prefijoFuera(d, 'desayuno') + d.datos.desayuno : ''),
      celda(d.datos.mediaManana ? prefijoFuera(d, 'mediaManana') + d.datos.mediaManana : ''),
      celda(d.datos.comida ? prefijoFuera(d, 'comida') + d.datos.comida : ''),
      celda(d.datos.merienda ? prefijoFuera(d, 'merienda') + d.datos.merienda : ''),
      celda(d.datos.cena ? prefijoFuera(d, 'cena') + d.datos.cena : ''),
      celda(d.datos.agua ? `${d.datos.agua} L` : ''),
      celda(d.datos.ejercicio || ''),
    ]
    if (tieneComentarios) fila.push(celda(d.datos.comentarios || ''))
    return fila
  })

  const titulo = `Dieta ${escapar(nombre)} — ${format(dias[0].fecha, 'd MMM', { locale: es })} al ${format(
    dias[dias.length - 1].fecha,
    'd MMM yyyy',
    { locale: es },
  )}`

  const cuerpo = filas
    .map(fila => `      <tr><td>${fila.join('</td><td>')}</td></tr>`)
    .join('\n')
  const cabeceras = headers.map(h => `<th>${escapar(h)}</th>`).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Helvetica, Arial, sans-serif; color: #4a4a4a; padding: 24px; }
    h1 { color: #5c7a5e; font-size: 18px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #7a9e7e; color: #fff; padding: 8px 6px; text-align: center; font-size: 11px; }
    td { border-bottom: 1px solid #e8e6e1; padding: 7px 6px; vertical-align: top; }
    tr:nth-child(even) td { background: #f7fbf7; }
    td:first-child { font-weight: bold; white-space: nowrap; }
    td:last-child, th:last-child { text-align: center; }
  </style>
</head>
<body>
  <h1>${titulo}</h1>
  <table>
    <thead>
      <tr>${cabeceras}</tr>
    </thead>
    <tbody>
${cuerpo}
    </tbody>
  </table>
</body>
</html>`

  const archivo = await generatePDF({
    html,
    fileName: `resumen-nutricional`,
    directory: 'Documentos',
    base64: false,
  })
  return archivo.filePath ?? ''
}