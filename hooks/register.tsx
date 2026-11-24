import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Lluvia de codigo en tres capas: atras chica, lenta y tenue; adelante grande,
// rapida y brillante. La diferencia de velocidad entre capas da el parallax.

const W = 1600
const H = 1000
const GLYPHS =
  'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z:=*+-<>{}[]|'

// Generador con semilla: la escena sale igual en cada carga.
let seed = 20261124
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296

  return seed / 4294967296
}
const pick = (): string => GLYPHS[Math.floor(rand() * GLYPHS.length)] ?? '0'
const between = (a: number, b: number) => a + rand() * (b - a)

type Layer = {
  name: string
  count: number
  size: number
  length: number
  color: string
  head: string
  opacity: number
  minDur: number
  maxDur: number
  blur: number
}

const LAYERS: Layer[] = [
  { name: 'far', count: 34, size: 11, length: 22, color: '#16913f', head: '#7fe39a', opacity: 0.7, minDur: 50, maxDur: 66, blur: 3.4 },
  { name: 'mid', count: 24, size: 17, length: 20, color: '#2bd065', head: '#c4ffd2', opacity: 0.85, minDur: 34, maxDur: 44, blur: 4 },
  { name: 'near', count: 13, size: 28, length: 17, color: '#5cff95', head: '#f0fff3', opacity: 1, minDur: 22, maxDur: 30, blur: 4.6 },
]

const escape = (c: string) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c)

function layerMarkup(layer: Layer): { css: string; body: string } {
  const step = layer.size * 1.15
  const strip = step * layer.length
  const css =
    `@keyframes f-${layer.name}{from{transform:translate3d(0,-${Math.ceil(strip)}px,0)}to{transform:translate3d(0,${H}px,0)}}` +
    `.${layer.name}{animation:f-${layer.name} linear infinite;font-size:${layer.size}px;will-change:transform;filter:url(#b-${layer.name})}`
  let body = `<g opacity="${layer.opacity}" fill="url(#g-${layer.name})">`

  for (let i = 0; i < layer.count; i++) {
    const x = Math.round(((i + between(0.1, 0.9)) / layer.count) * W)
    const dur = between(layer.minDur, layer.maxDur).toFixed(1)
    const delay = (-rand() * Number(dur)).toFixed(1)
    // Lugar de reposo (sin animacion): repartidas a lo alto.
    const rest = Math.round(between(-strip, H - strip / 2))
    let spans = ''

    for (let k = 0; k < layer.length - 1; k++) {
      spans += `<tspan x="0" dy="${k === 0 ? 0 : step.toFixed(1)}">${escape(pick())}</tspan>`
    }
    spans += `<tspan x="0" dy="${step.toFixed(1)}" fill="${layer.head}">${escape(pick())}</tspan>`
    body +=
      `<g transform="translate(${x} 0)"><text class="${layer.name}" transform="translate(0 ${rest})" ` +
      `style="animation-duration:${dur}s;animation-delay:${delay}s">${spans}</text></g>`
  }

  return { css, body: body + '</g>' }
}

function buildScene(): string {
  const parts = LAYERS.map(layerMarkup)
  const grads = LAYERS.map(
    l =>
      `<linearGradient id="g-${l.name}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${l.color}" stop-opacity="0"/>` +
      `<stop offset="0.7" stop-color="${l.color}" stop-opacity="0.8"/>` +
      `<stop offset="1" stop-color="${l.color}"/></linearGradient>`,
  ).join('')
  // Desenfoque propio de la escena: se ve igual en la sesion seleccionada y en la otra.
  const blurs = LAYERS.map(
    l => `<filter id="b-${l.name}" x="-50%" y="-5%" width="200%" height="110%"><feGaussianBlur stdDeviation="${l.blur}"/></filter>`,
  ).join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<style>text{font-family:monospace;font-weight:bold}${parts.map(p => p.css).join('')}</style>` +
    `<defs>${grads}${blurs}` +
    `<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">` +
    `<stop offset="0" stop-color="#000" stop-opacity="0.3"/>` +
    `<stop offset="0.6" stop-color="#000" stop-opacity="0.08"/>` +
    `<stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="#000000"/>` +
    parts.map(p => p.body).join('') +
    `<rect width="${W}" height="${H}" fill="url(#vig)"/>` +
    `</svg>`
  )
}

const SCENE = buildScene()

const { theme, problems } = makeColors({
  label: 'Matrix',
  only: 'dark',
  roles: { accent: '#3ddc84', danger: '#ff5c5c', success: '#5ef08f', warning: '#e8c547', pro: '#7fd6c2' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#000000',
        'surface-1': '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#171717',
        'text-primary': '#a6ffb8',
        'text-secondary': '#7ee896',
        'text-muted': '#5cc476',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'matrix', glass: { blur: 0, tint: '#000000', opacity: 0.45 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.log(unpainted)
    }
    await $.theme.set(LOOK)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Lluvia de codigo verde cayendo en tres capas de profundidad" isInteractive />
  })
}
