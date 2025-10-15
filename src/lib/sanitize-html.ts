// NOTA: Usamos import dinámico de 'dompurify' sólo en cliente para evitar que Turbopack
// intente incluir jsdom (dependency de isomorphic-dompurify). Así eliminamos la advertencia
// "Package jsdom can't be external".

type SanitizeOptions = {
  strict?: boolean
  allowIframes?: boolean
}

const ALLOWED_TAGS_BASE = new Set([
  'a','p','br','strong','em','u','s','code','pre','blockquote',
  'ul','ol','li','img','h1','h2','h3','h4','span','div','hr'
])

// Iframes sólo si se explicitó.
const ALLOWED_IFRAME_ATTR = ['src','width','height','allow','allowfullscreen','loading']

const ALLOWED_ATTR = new Set([
  'href','src','alt','title','target','rel','class','data-align','data-type','data-id','aria-label'
])

const URI_ATTR = new Set(['href','src'])
const SAFE_URI_REGEX = /^(https?:|mailto:|tel:|ftp:|data:image\/(?:png|jpeg|gif|webp);base64,|\/|#)/i

function basicServerSanitize(html: string, { strict, allowIframes }: SanitizeOptions = {}): string {
  if (!html) return ''
  let out = html
  // Elimina comentarios HTML
  out = out.replace(/<!--([\s\S]*?)-->/g, '')
  // Elimina scripts y estilos completos
  out = out.replace(/<\/(?:script|style)>/gi, '')
  out = out.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
  // Quita on* handlers y javascript: URIs
  out = out.replace(/\son[a-z]+="[^"]*"/gi, '')
           .replace(/\son[a-z]+=\'[^\']*\'/gi, '')
           .replace(/\son[a-z]+=([^"'\s>]+)/gi, '')
           .replace(/javascript:/gi, '')
  if (strict) {
    // Quita estilos inline en modo estricto
    out = out.replace(/\sstyle="[^"]*"/gi, '')
             .replace(/\sstyle=\'[^\']*\'/gi, '')
  }

  // Filtrado de tags y atributos
  out = out.replace(/<([^>]+)>/g, (full, inner) => {
    const match = /^(\/)?\s*([a-z0-9-]+)([\s\S]*)$/i.exec(inner)
    if (!match) return ''
    const closing = !!match[1]
    const tag = match[2].toLowerCase()
    if (closing) {
      return ALLOWED_TAGS_BASE.has(tag) || (allowIframes && tag === 'iframe') ? `</${tag}>` : ''
    }
    if (!ALLOWED_TAGS_BASE.has(tag)) {
      if (!(allowIframes && tag === 'iframe')) return ''
    }
  const attrsPart = match[3] || ''
    const attrs: string[] = []
    attrsPart.replace(/([a-z0-9-:]+)(=)("[^"]*"|'[^']*'|[^\s"'>]+)?/gi, (_, name: string, _eq: string, valRaw: string) => {
      const attrName = name.toLowerCase()
      const value = (valRaw || '').trim()
      if (allowIframes && tag === 'iframe' && ALLOWED_IFRAME_ATTR.includes(attrName)) {
        attrs.push(`${attrName}=${value}`)
        return ''
      }
      if (!ALLOWED_ATTR.has(attrName)) return ''
      if (URI_ATTR.has(attrName)) {
        const cleanValue = value.replace(/["']/g, '')
        if (!SAFE_URI_REGEX.test(cleanValue)) return ''
      }
      if (strict && attrName === 'class') return ''
      attrs.push(`${attrName}=${value}`)
      return ''
    })
    return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`
  })
  return out
}

async function clientSanitize(html: string, opts: SanitizeOptions = {}) {
  const DOMPurify = (await import('dompurify')).default
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP: SAFE_URI_REGEX,
    ADD_ATTR: ['target','rel','class','style','data-type','data-align','data-id','aria-label'],
    ADD_TAGS: opts.allowIframes ? ['iframe'] : [],
    FORBID_TAGS: opts.strict ? ['script','form','object','embed','iframe','style'] : ['script','form','object','embed'],
    FORBID_ATTR: opts.strict ? ['onerror','onclick','onload','style'] : ['onerror','onclick','onload'],
  })
}

export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string | Promise<string> {
  if (!html) return ''
  if (typeof window === 'undefined') {
    return basicServerSanitize(html, options)
  }
  return clientSanitize(html, { allowIframes: true, ...options })
}

export function sanitizeHtmlStrict(html: string): string | Promise<string> {
  return sanitizeHtml(html, { strict: true, allowIframes: false })
}
