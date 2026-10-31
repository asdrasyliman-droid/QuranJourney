// Shared switcher between the two standalone design previews, so reviewers can
// move between them without returning to the Design Studio gallery.
// Navigation only: it changes the hash route and touches no app state.
export const NEXT_HREF = '#/design-studio/next'
export const MUSHAF_HREF = '#/design-studio/mushaf'

const ITEMS = [
  { id: 'next', href: NEXT_HREF, en: 'Next generation', ar: 'الجيل القادم' },
  { id: 'mushaf', href: MUSHAF_HREF, en: 'Digital Mushaf', ar: 'المصحف الرقمي' },
] as const

export const toTop = () => scrollTo({ top: 0 })

export function PreviewSwitch({ current }: { current: 'next' | 'mushaf' }) {
  return (
    <nav aria-label="Design previews" className="inline-flex rounded-full bg-black/[.06] p-1 text-[12.5px]">
      {ITEMS.map((it) => (
        <a
          key={it.id}
          href={it.href}
          onClick={toTop}
          aria-current={current === it.id ? 'page' : undefined}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition ${current === it.id ? 'bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,.12)]' : 'text-black/55 hover:text-black'}`}
        >
          {it.en}
          <span className="text-black/40" dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic'" }}>{it.ar}</span>
        </a>
      ))}
    </nav>
  )
}
