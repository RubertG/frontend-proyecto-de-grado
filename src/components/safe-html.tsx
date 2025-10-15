"use client"
import * as React from 'react'
import { sanitizeHtml, sanitizeHtmlStrict } from '@/lib/sanitize-html'

import type { ElementType } from 'react'

type SafeHtmlProps<T extends ElementType = 'div'> = {
  html: string | null | undefined
  variant?: 'default' | 'strict'
  className?: string
  as?: T
  dangerouslyDisableSanitization?: boolean // sólo para debugging puntual
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'dangerouslySetInnerHTML'>

export function SafeHtml<T extends ElementType = 'div'>({ html, variant = 'default', className, as, dangerouslyDisableSanitization, ...rest }: SafeHtmlProps<T>) {
  const Tag = (as || 'div') as ElementType
  const [sanitized, setSanitized] = React.useState('')

  React.useEffect(() => {
    let active = true
    async function run() {
      if (!html) { if (active) setSanitized(''); return }
      if (dangerouslyDisableSanitization) { if (active) setSanitized(html); return }
      const result = variant === 'strict' ? await Promise.resolve(sanitizeHtmlStrict(html)) : await Promise.resolve(sanitizeHtml(html))
      if (active) setSanitized(result || '')
    }
    run()
    return () => { active = false }
  }, [html, variant, dangerouslyDisableSanitization])

  // Mientras se resuelve en cliente, renderizamos cadena vacía para evitar mismatch.
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitized }} {...rest} />
}
