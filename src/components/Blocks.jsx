import React from 'react'
import { useConfig } from '../config/ConfigContext.jsx'

function cssSize(v) {
  if (v === undefined || v === null || v === '') return undefined
  if (typeof v === 'number') return `${v}px`
  if (/^\d+$/.test(String(v))) return `${v}px`
  return String(v)
}

function overlayPositionStyle(pos) {
  switch (pos) {
    case 'top-left': return { top: 8, left: 8 }
    case 'top-right': return { top: 8, right: 8 }
    case 'bottom-left': return { bottom: 8, left: 8 }
    case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    case 'bottom-right':
    default: return { bottom: 8, right: 8 }
  }
}

function Block({ block, t }) {
  const { type, props = {}, enabled = true } = block || {}
  if (!enabled) return null
  const align = props.align || 'center'
  const style = { textAlign: align }
  switch (type) {
    case 'text': {
      return (
        <div className="custom-block block-text" style={style}>
          <p>{t(props.text)}</p>
        </div>
      )
    }
    case 'button': {
      const variant = props.variant || 'primary'
      const className = `btn ${variant === 'secondary' ? 'secondary' : ''}`
      const href = props.link || '#'
      return (
        <div className="custom-block block-button" style={style}>
          <a className={className} href={href}>{t(props.text)}</a>
        </div>
      )
    }
    case 'image': {
      const src = props.src || ''
      const alt = props.alt ? t(props.alt) : ''
      if (!src) return null
      const width = cssSize(props.width)
      const height = cssSize(props.height)
      const objectFit = props.objectFit || 'contain'
      const showOverlay = props.overlayText && t(props.overlayText)
      const overlayBg = props.overlayBg || 'rgba(0,0,0,0.35)'
      const overlayColor = props.overlayColor || '#fff'
      const overlayPadding = Number(props.overlayPadding ?? 8)
      const overlayRadius = Number(props.overlayRadius ?? 6)
      const overlayPos = props.overlayPosition || 'bottom-right'
      return (
        <div className="custom-block block-image" style={style}>
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{
              width: width,
              height: height,
              objectFit: objectFit,
              maxWidth: width ? undefined : '100%'
            }}
          />
          {showOverlay && (
            <div
              className="overlay"
              style={{
                position: 'absolute',
                padding: overlayPadding,
                borderRadius: overlayRadius,
                background: overlayBg,
                color: overlayColor,
                ...overlayPositionStyle(overlayPos)
              }}
            >
              {t(props.overlayText)}
            </div>
          )}
        </div>
      )
    }
    case 'spacer': {
      const height = Math.max(0, Number(props.height || 24))
      return <div className="custom-block block-spacer" style={{ height }} />
    }
    default:
      return null
  }
}

export default function BlocksAt({ position }) {
  const { config, t } = useConfig()
  const blocks = (config?.customBlocks || []).filter(b => b.position === position)
  if (!blocks.length) return null
  return (
    <section className="section">
      <div className="container">
        {blocks.map((b, i) => <Block key={i} block={b} t={t} />)}
      </div>
    </section>
  )
}