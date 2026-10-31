// Mirrors the production appearance rules (every `:root…` rule in the app's
// stylesheets) onto `.pv-root` so preview frames can each carry their own
// data-theme / data-palette / data-kids. Nothing is redefined: the values are
// read from the real stylesheet at runtime, so the preview cannot drift.
import { useEffect } from 'react'

function collect(rules: CSSRuleList, out: string[]) {
  for (const r of Array.from(rules)) {
    if (r instanceof CSSStyleRule) {
      if (!r.selectorText.includes(':root')) continue
      const sel = r.selectorText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.startsWith(':root'))
        .map((s) => s.replace(/^:root/, '.pv-root'))
      if (sel.length) out.push(`${sel.join(', ')} { ${r.style.cssText} }`)
    } else if ('cssRules' in r && !(r instanceof CSSMediaRule)) {
      collect((r as CSSGroupingRule).cssRules, out)
    }
  }
}

export function useScopedThemes() {
  useEffect(() => {
    const el = document.createElement('style')
    el.dataset.pvTheme = ''
    const build = () => {
      const out: string[] = []
      for (const sh of Array.from(document.styleSheets)) {
        if (sh.ownerNode === el) continue
        try {
          collect(sh.cssRules, out)
        } catch {
          /* cross-origin sheet (Google Fonts) */
        }
      }
      el.textContent = out.join('\n')
    }
    build()
    document.head.appendChild(el)
    // Dev server may inject styles later (HMR); rebuild once things settle.
    const t = setTimeout(build, 600)
    return () => (clearTimeout(t), el.remove())
  }, [])
}
