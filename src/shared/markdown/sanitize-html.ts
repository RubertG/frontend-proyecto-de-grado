// Sanitización mínima placeholder.
// TODO: Reemplazar por rehype-sanitize o DOMPurify SSR cuando se habilite JSDOM/light DOM.
// Por ahora: remueve <script>, on* handlers, iframes y javascript: URIs.

const EVENT_HANDLER_ATTR = / on[a-z]+="[^"]*"/gi
const SCRIPT_TAG = /<script[\s\S]*?>[\s\S]*?<\/script>/gi
const IFRAME_TAG = /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi
const JS_HREF = /href="javascript:[^"]*"/gi

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''
  let out = html
  out = out.replace(SCRIPT_TAG, '')
  out = out.replace(IFRAME_TAG, '')
  out = out.replace(JS_HREF, 'href="#"')
  out = out.replace(EVENT_HANDLER_ATTR, '')
  return out
}
