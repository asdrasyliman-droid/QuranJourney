// Desktop Mushaf reader mock (design preview only; local UI state, no app logic).
import { useRef, useState, type ReactNode } from 'react'
import { I } from '../kit'
import { MushafPage, PageNumber, PageSkeleton, PageText, SAMPLE_PAGES, SurahBanner, juzName, surahName, toAr, usePage, type PageData } from './page'
import { BISMILLAH_HAFS } from '../../lib/quran'

export type Mode = 'mushaf' | 'ayah' | 'flow'
/** 'app' derives every paper/chrome token from the active palette + appearance (used inside the Next-generation preview). */
export type Tone = 'ivory' | 'sand' | 'night' | 'app'
export const MODES: { id: Mode; l: string; icon: string }[] = [
  { id: 'mushaf', l: 'مصحف', icon: 'book' },
  { id: 'ayah', l: 'آية بآية', icon: 'layers' },
  { id: 'flow', l: 'قراءة متصلة', icon: 'note' },
]

export function ModeSwitch({ mode, onChange, compact = false }: { mode: Mode; onChange: (m: Mode) => void; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label="وضع القراءة" className="inline-flex rounded-full bg-(--ui-ink)/[.06] p-1">
      {MODES.map((m) => {
        const on = m.id === mode
        return (
          <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => onChange(m.id)} className={`mp-press flex items-center gap-1.5 rounded-full ${compact ? 'h-8 px-3 text-[12.5px]' : 'h-9 px-4 text-[13.5px]'} ${on ? 'bg-(--ui-card) font-semibold text-(--ui-ink) shadow-[0_1px_3px_rgba(0,0,0,.12)]' : 'text-(--ui-muted) hover:text-(--ui-ink)'}`}>
            <I n={m.icon} s={compact ? 14 : 15} />
            {m.l}
          </button>
        )
      })}
    </div>
  )
}

export function IconBtn({ n, label, onClick, on = false, size = 40, className = '' }: { n: string; label: string; onClick?: () => void; on?: boolean; size?: number; className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={on || undefined} onClick={onClick} className={`mp-press flex items-center justify-center rounded-full ${on ? 'bg-(--accent-soft) text-(--accent)' : 'text-(--ui-ink)/75 hover:bg-(--ui-ink)/[.06]'} ${className}`} style={{ width: size, height: size }}>
      <I n={n} s={19} fill={on && n === 'bookmark'} />
    </button>
  )
}

/** Large side arrow for turning the page. RTL: the next page sits on the left. */
export function TurnBtn({ dir, onClick, disabled, label }: { dir: 'next' | 'prev'; onClick?: () => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={dir === 'next' ? 'الصفحة التالية' : 'الصفحة السابقة'} className="mp-press mp-glass group flex h-14 w-14 flex-col items-center justify-center rounded-full text-(--ui-ink) hover:text-(--accent) disabled:opacity-35">
      <I n="chevron" s={22} className={dir === 'next' ? 'rotate-180' : ''} />
      {label && <span className="sr-only">{label}</span>}
    </button>
  )
}

export function JumpControl({ pg, onGo }: { pg: number; onGo: (n: number) => void }) {
  const [v, setV] = useState('')
  const [hint, setHint] = useState(false)
  const go = () => {
    const n = Number(v.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))))
    if (SAMPLE_PAGES.includes(n)) (onGo(n), setV(''), setHint(false))
    else setHint(true)
  }
  return (
    <form onSubmit={(e) => (e.preventDefault(), go())} className="relative flex items-center gap-1 rounded-full bg-(--ui-ink)/[.05] p-1 ps-4">
      <label className="text-[12.5px] text-(--ui-muted)" htmlFor="mp-jump">انتقال إلى</label>
      <input id="mp-jump" inputMode="numeric" value={v} onChange={(e) => setV(e.target.value)} placeholder={toAr(pg)} className="h-8 w-14 rounded-full bg-(--ui-card) text-center text-[14px] font-semibold text-(--ui-ink) outline-none ring-1 ring-(--ui-line) placeholder:text-(--ui-muted)/60 focus:ring-2 focus:ring-(--accent)" />
      <button type="submit" className="mp-press h-8 rounded-full bg-(--ui-ink) px-3.5 text-[12.5px] font-semibold text-(--ui-bg)">اذهب</button>
      {hint && <span className="absolute -top-8 start-0 whitespace-nowrap rounded-full bg-(--ui-ink) px-3 py-1 text-[11.5px] text-(--ui-bg)">المعاينة: {SAMPLE_PAGES.map(toAr).join('، ')}</span>}
    </form>
  )
}

/** Thin progress track: position in the 604-page mushaf. */
export function Progress({ pg, w = 160 }: { pg: number; w?: number }) {
  return (
    <span className="relative block h-1 overflow-hidden rounded-full bg-(--ui-ink)/10" style={{ width: w }}>
      <span className="absolute inset-y-0 start-0 rounded-full bg-(--accent)" style={{ width: `${Math.max(2, (pg / 604) * 100)}%` }} />
    </span>
  )
}

export const ACTIONS: { n: string; l: string }[] = [
  { n: 'play', l: 'استماع' },
  { n: 'tafsir', l: 'التفسير' },
  { n: 'bookmark', l: 'علامة' },
  { n: 'mic', l: 'تسميع' },
  { n: 'copy', l: 'نسخ' },
  { n: 'share', l: 'مشاركة' },
]

/** Floating ayah action menu, anchored to the ayah that opened it. */
export function AyahMenu({ s, a, style, caret = 'bottom', onClose }: { s: number; a: number; style?: React.CSSProperties; caret?: 'bottom' | 'top'; onClose?: () => void }) {
  return (
    <div className="mp-glass absolute z-20 w-[330px] rounded-[22px] p-2.5 text-(--ui-ink)" style={style} role="menu" aria-label={`خيارات الآية ${a}`}>
      <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
        <span className="text-[13px] font-semibold">{surahName(s)} · الآية {toAr(a)}</span>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="إغلاق" className="mp-press -me-1 flex h-7 w-7 items-center justify-center rounded-full text-(--ui-muted) hover:bg-(--ui-ink)/[.06]">
            <I n="x" s={15} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-1">
        {ACTIONS.map((x) => (
          <button key={x.l} type="button" role="menuitem" className="mp-press flex flex-col items-center gap-1 rounded-[14px] py-2 text-[11.5px] text-(--ui-ink)/80 hover:bg-(--ui-ink)/[.06]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--ui-ink)/[.05]">
              <I n={x.n} s={17} />
            </span>
            {x.l}
          </button>
        ))}
      </div>
      <span className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-(--ui-card) ${caret === 'bottom' ? '-bottom-1.5' : '-top-1.5'}`} aria-hidden />
    </div>
  )
}

function Toolbar({ d, mode, setMode, bookmarked, setBookmarked, settings, setSettings, onBack }: { d: PageData | null; mode: Mode; setMode: (m: Mode) => void; bookmarked: boolean; setBookmarked: (b: boolean) => void; settings: boolean; setSettings: (b: boolean) => void; onBack?: () => void }) {
  return (
    <header className="mp-glass relative z-30 flex h-16 shrink-0 items-center gap-4 px-5" style={{ borderRadius: 0 }}>
      <div className="flex min-w-[260px] items-center gap-2">
        <IconBtn n="chevron" label="رجوع" onClick={onBack} />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold">{d ? surahName(d.surahs[0]) : '—'}</p>
          <p className="text-[12px] text-(--ui-muted)">{d ? `${juzName(d.juz)} · الحزب ${toAr(d.hizb)}` : ''}</p>
        </div>
      </div>
      <div className="flex flex-1 justify-center">
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>
      <div className="flex min-w-[260px] items-center justify-end gap-1">
        <IconBtn n="search" label="بحث" />
        <IconBtn n="volume" label="استماع" />
        <IconBtn n="bookmark" label="علامة مرجعية" on={bookmarked} onClick={() => setBookmarked(!bookmarked)} />
        <IconBtn n="type" label="إعدادات القراءة" on={settings} onClick={() => setSettings(!settings)} />
      </div>
    </header>
  )
}

export function SettingsPanel({ tone, setTone, size, setSize, mode, setMode, auto = false, className = '' }: { tone: Tone; setTone: (t: Tone) => void; size: number; setSize: (n: number) => void; mode: Mode; setMode: (m: Mode) => void; auto?: boolean; className?: string }) {
  const tones: { id: Tone; l: string; bg: string; ink: string }[] = [
    ...(auto ? [{ id: 'app' as const, l: 'تلقائي', bg: 'var(--mf-paper)', ink: 'var(--mf-ink)' }] : []),
    { id: 'ivory', l: 'عاجي', bg: '#fbf7ec', ink: '#1d1913' },
    { id: 'sand', l: 'رملي', bg: '#f4e8cf', ink: '#241b10' },
    { id: 'night', l: 'ليلي', bg: '#161d19', ink: '#ede4cf' },
  ]
  return (
    <div className={`space-y-5 ${className}`}>
      <div>
        <p className="mb-2.5 text-[12.5px] font-semibold text-(--ui-muted)">حجم خط المصحف</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setSize(Math.max(0.85, +(size - 0.05).toFixed(2)))} aria-label="تصغير الخط" className="mp-press mp-serif flex h-9 w-9 items-center justify-center rounded-full bg-(--ui-ink)/[.06] text-[14px]">ا</button>
          <span className="relative h-1.5 flex-1 rounded-full bg-(--ui-ink)/10">
            <span className="absolute inset-y-0 start-0 rounded-full bg-(--accent)" style={{ width: `${((size - 0.85) / 0.4) * 100}%` }} />
            <span className="absolute top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.3)]" style={{ insetInlineStart: `${((size - 0.85) / 0.4) * 100}%` }} />
          </span>
          <button type="button" onClick={() => setSize(Math.min(1.25, +(size + 0.05).toFixed(2)))} aria-label="تكبير الخط" className="mp-press mp-serif flex h-9 w-9 items-center justify-center rounded-full bg-(--ui-ink)/[.06] text-[20px]">ا</button>
        </div>
      </div>
      <div>
        <p className="mb-2.5 text-[12.5px] font-semibold text-(--ui-muted)">لون الورق</p>
        <div className={`grid gap-2 ${auto ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {tones.map((t) => (
            <button key={t.id} type="button" onClick={() => setTone(t.id)} aria-pressed={tone === t.id} className={`mp-press rounded-[16px] p-1 ring-2 ${tone === t.id ? 'ring-(--accent)' : 'ring-transparent hover:ring-(--ui-line)'}`}>
              <span className="mp-text flex h-14 items-center justify-center rounded-[12px] text-[20px] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]" style={{ background: t.bg, color: t.ink, textAlignLast: 'center' }}>
                ٱلۡحَمۡدُ
              </span>
              <span className={`mt-1.5 block text-[12.5px] ${tone === t.id ? 'font-semibold' : 'text-(--ui-muted)'}`}>{t.l}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2.5 text-[12.5px] font-semibold text-(--ui-muted)">وضع القراءة</p>
        <ModeSwitch mode={mode} onChange={setMode} compact />
      </div>
      <div className="divide-y divide-(--ui-line) rounded-[16px] bg-(--ui-ink)/[.03] ring-1 ring-(--ui-line)">
        <Toggle l="تظليل الآية أثناء التلاوة" on />
        <Toggle l="إبقاء الشاشة مضاءة" on />
        <Toggle l="إظهار رأس الصفحة (السورة والجزء)" on />
      </div>
    </div>
  )
}

function Toggle({ l, on: init = false }: { l: string; on?: boolean }) {
  const [on, setOn] = useState(init)
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => setOn(!on)} className="flex w-full items-center justify-between px-4 py-3 text-start text-[13.5px]">
      {l}
      <span className={`relative h-[26px] w-[44px] rounded-full transition-colors duration-200 ${on ? 'bg-(--accent)' : 'bg-(--ui-ink)/15'}`}>
        <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200 ${on ? 'start-[21px]' : 'start-[3px]'}`} />
      </span>
    </button>
  )
}

export function DesktopReader({ pg, setPg, tone, setTone, auto, onBack }: { pg: number; setPg: (n: number) => void; tone: Tone; setTone: (t: Tone) => void; auto?: boolean; onBack?: () => void }) {
  const d = usePage(pg)
  const next = usePage(Math.min(604, pg + 1))
  const [mode, setMode] = useState<Mode>('mushaf')
  const [size, setSize] = useState(1)
  const [bookmarked, setBookmarked] = useState(false)
  const [settings, setSettings] = useState(false)
  const [sel, setSel] = useState<{ s: number; a: number; x: number; y: number } | null>(null)
  const area = useRef<HTMLDivElement>(null)
  const i = SAMPLE_PAGES.indexOf(pg)
  const go = (n: number) => (setPg(n), setSel(null))

  const onAyah = (s: number, a: number, el: HTMLElement) => {
    const box = area.current!
    const k = box.getBoundingClientRect().width / box.offsetWidth || 1
    const r = el.getClientRects()[0] ?? el.getBoundingClientRect()
    const b = box.getBoundingClientRect()
    setSel({ s, a, x: (r.left + r.width / 2 - b.left) / k, y: (r.top - b.top) / k + box.scrollTop })
  }
  const marks = sel ? { state: { [`${sel.s}:${sel.a}`]: 'selected' as const } } : undefined

  return (
    <div className="mp-canvas relative flex h-full flex-col" dir="rtl">
      <Toolbar d={d} mode={mode} setMode={(m) => (setMode(m), setSel(null))} bookmarked={bookmarked} setBookmarked={setBookmarked} settings={settings} setSettings={setSettings} onBack={onBack} />
      <div ref={area} className="mp-scroll relative min-h-0 flex-1 overflow-y-auto" onClick={(e) => e.target === e.currentTarget && setSel(null)}>
        {mode === 'mushaf' && (
          <div className="flex items-center justify-center gap-10 px-10 py-7" onClick={(e) => e.target === e.currentTarget && setSel(null)}>
            <TurnBtn dir="prev" disabled={i <= 0} onClick={() => go(SAMPLE_PAGES[i - 1])} />
            <div className="w-[640px] shrink-0">
              {d ? <MushafPage d={d} size={22 * size} marks={marks} ribbon={bookmarked} onAyah={onAyah} /> : <PageSkeleton />}
            </div>
            <TurnBtn dir="next" disabled={i >= SAMPLE_PAGES.length - 1} onClick={() => go(SAMPLE_PAGES[i + 1])} />
          </div>
        )}
        {mode === 'ayah' && d && <AyahList d={d} size={size} sel={sel} onPick={(s, a) => setSel(sel?.a === a && sel.s === s ? null : { s, a, x: 0, y: 0 })} />}
        {mode === 'flow' && d && <Flow pages={[d, next]} size={size} marks={marks} onAyah={onAyah} />}

        {sel && mode !== 'ayah' && <AyahMenu s={sel.s} a={sel.a} onClose={() => setSel(null)} style={{ left: Math.max(12, Math.min(sel.x - 165, (area.current?.offsetWidth ?? 1200) - 342)), top: Math.max(8, sel.y - 128) }} />}
      </div>

      {settings && (
        <div className="mp-glass absolute end-5 top-[76px] z-40 w-[360px] rounded-[26px] p-5" style={{ transformOrigin: 'top left' }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[16px] font-semibold">إعدادات القراءة</h3>
            <IconBtn n="x" label="إغلاق" size={32} onClick={() => setSettings(false)} />
          </div>
          <SettingsPanel tone={tone} setTone={setTone} size={size} setSize={setSize} mode={mode} setMode={setMode} auto={auto} />
        </div>
      )}

      {/* Bottom navigation bar */}
      <footer className="mp-glass relative z-10 flex h-[76px] shrink-0 items-center justify-between gap-6 px-8" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-3">
          {d && <PageNumber pg={pg} />}
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tabular-nums">
              صفحة {toAr(pg)} <span className="font-normal text-(--ui-muted)">من ٦٠٤</span>
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[12px] text-(--ui-muted)">
              <Progress pg={pg} />
              {d && <span>{d.surahs.map(surahName).join('، ')}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" disabled={i <= 0} onClick={() => go(SAMPLE_PAGES[i - 1])} className="mp-press flex h-10 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium text-(--ui-ink) ring-1 ring-(--ui-line) hover:bg-(--ui-ink)/[.04] disabled:opacity-35">
            <I n="chevron" s={16} />
            السابقة
          </button>
          <button type="button" disabled={i >= SAMPLE_PAGES.length - 1} onClick={() => go(SAMPLE_PAGES[i + 1])} className="mp-press flex h-10 items-center gap-1.5 rounded-full bg-(--ui-ink) px-4 text-[13.5px] font-semibold text-(--ui-bg) disabled:opacity-35">
            التالية
            <I n="chevron" s={16} className="rotate-180" />
          </button>
        </div>
        <JumpControl pg={pg} onGo={go} />
      </footer>
    </div>
  )
}

function AyahList({ d, size, sel, onPick }: { d: PageData; size: number; sel: { s: number; a: number } | null; onPick: (s: number, a: number) => void }) {
  return (
    <div className="mx-auto max-w-[780px] space-y-3 px-6 py-7">
      {d.blocks.map((b) => (
        <div key={b.s} className="space-y-3">
          {b.header && (
            <div className="mp-paper rounded-[22px] px-8 py-4">
              <SurahBanner s={b.s} />
              {b.bism && <p className="mp-text text-center" style={{ fontSize: 24 * size }}>{BISMILLAH_HAFS}</p>}
            </div>
          )}
          {b.ayat.map(({ a, t }) => {
            const on = sel?.s === b.s && sel.a === a
            return (
              <article key={a} onClick={() => onPick(b.s, a)} className={`mp-paper cursor-pointer rounded-[22px] px-7 pb-3 pt-5 transition-shadow ${on ? 'ring-2 ring-(--accent)' : ''}`} style={{ boxShadow: on ? undefined : '0 1px 0 rgba(255,255,255,.6) inset, 0 10px 24px -18px rgba(60,45,15,.4)' }}>
                <p className="mp-text" style={{ fontSize: 25 * size, lineHeight: 2.05, textAlign: 'right', textAlignLast: 'right' }}>
                  {t} <span className="mp-num">{toAr(a)}</span>
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-(--frame-soft) pt-2.5">
                  <span className="text-[12px] text-(--ink-soft)">{surahName(b.s)} · {toAr(a)}</span>
                  <span className="flex items-center gap-0.5 text-(--ink-soft)">
                    {ACTIONS.slice(0, 4).map((x) => (
                      <span key={x.n} title={x.l} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-(--ui-ink)/[.06]">
                        <I n={x.n} s={16} />
                      </span>
                    ))}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Flow({ pages, size, marks, onAyah }: { pages: (PageData | null)[]; size: number; marks?: { state: Record<string, 'selected'> }; onAyah: (s: number, a: number, el: HTMLElement) => void }) {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-7">
      <div className="mp-paper rounded-[26px] px-14 py-10">
        {pages.map((p, k) =>
          p ? (
            <div key={p.pg}>
              {k > 0 && <PageDivider pg={p.pg} />}
              <PageText d={p} size={24 * size} marks={marks} onAyah={onAyah} />
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}

export function PageDivider({ pg }: { pg: number }): ReactNode {
  return (
    <div className="my-5 flex items-center gap-3 text-(--ink-soft)" aria-label={`صفحة ${pg}`}>
      <span className="h-px flex-1 bg-(--frame-soft)" />
      <PageNumber pg={pg} compact />
      <span className="h-px flex-1 bg-(--frame-soft)" />
    </div>
  )
}
