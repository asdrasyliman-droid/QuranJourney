// Mobile Mushaf reader mock (design preview only).
import { useState, type ReactNode } from 'react'
import { I } from '../kit'
import { SURAHS } from '../../lib/quran'
import { ACTIONS, IconBtn, ModeSwitch, SettingsPanel, type Mode, type Tone } from './desktop'
import { MushafPage, PageSkeleton, SAMPLE_PAGES, juzName, surahName, toAr, usePage, type Marks, type PageData } from './page'

export type MobileView = 'reading' | 'immersive' | 'playing' | 'ayah' | 'nav' | 'settings'

export function Phone({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <figure className="shrink-0">
      <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[54px] bg-(--ui-bg) shadow-[0_0_0_10px_#15181c,0_0_0_11px_#2a2e34,0_40px_80px_-30px_rgba(0,0,0,.55)]">
        <div className="absolute inset-x-0 top-0 z-50 flex h-12 items-center justify-between px-8 pt-1 text-[14px] font-semibold text-(--ui-ink)" dir="ltr">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-[30px] w-[118px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1.5">
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x=".5" y=".5" width="21" height="10" rx="3" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="7" rx="1.6" fill="currentColor" /></svg>
          </span>
        </div>
        {children}
        <span className="absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-(--ui-ink)/80" />
      </div>
      {label && <figcaption className="mt-5 text-center text-[13px] font-medium text-black/60" dir="rtl">{label}</figcaption>}
    </figure>
  )
}

function TopBar({ d, bookmarked, onBack }: { d: PageData; bookmarked?: boolean; onBack?: () => void }) {
  return (
    <div className="mp-glass absolute inset-x-0 top-0 z-30 flex h-[100px] items-end gap-1 px-3 pb-2" style={{ borderRadius: 0 }}>
      <IconBtn n="chevron" label="رجوع" size={44} onClick={onBack} />
      <div className="min-w-0 flex-1 pb-0.5 text-center leading-tight">
        <p className="truncate text-[15px] font-semibold">{surahName(d.surahs[0])}</p>
        <p className="text-[11.5px] text-(--ui-muted)">{juzName(d.juz)} · الحزب {toAr(d.hizb)}</p>
      </div>
      <IconBtn n="bookmark" label="علامة" size={44} on={bookmarked} />
    </div>
  )
}

/** Bottom reading dock: thumb-reachable page turn + page pill + audio + text settings. */
function Dock({ pg, onPill, playing, onPg, onPlay, onSettings }: { pg: number; onPill?: () => void; playing?: string; onPg?: (n: number) => void; onPlay?: () => void; onSettings?: () => void }) {
  const i = SAMPLE_PAGES.indexOf(pg)
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-7">
      {playing && <MiniPlayer at={playing} />}
      <div className="mp-glass flex h-[64px] items-center gap-1 rounded-full px-2">
        <button type="button" aria-label="الصفحة السابقة" disabled={i <= 0} onClick={() => onPg?.(SAMPLE_PAGES[i - 1])} className="mp-press flex h-12 w-12 items-center justify-center rounded-full text-(--ui-ink) hover:bg-(--ui-ink)/[.06] disabled:opacity-30">
          <I n="chevron" s={22} />
        </button>
        <button type="button" onClick={onPill} className="mp-press flex h-12 flex-1 flex-col items-center justify-center rounded-full bg-(--ui-ink)/[.05] leading-tight">
          <span className="text-[15px] font-semibold tabular-nums">{toAr(pg)} <span className="font-normal text-(--ui-muted)">/ ٦٠٤</span></span>
          <span className="text-[10.5px] text-(--ui-muted)">اضغط للانتقال</span>
        </button>
        <button type="button" aria-label="الصفحة التالية" disabled={!!onPg && i >= SAMPLE_PAGES.length - 1} onClick={() => onPg?.(SAMPLE_PAGES[i + 1])} className="mp-press flex h-12 w-12 items-center justify-center rounded-full text-(--ui-ink) hover:bg-(--ui-ink)/[.06] disabled:opacity-30">
          <I n="chevron" s={22} className="rotate-180" />
        </button>
        <span className="mx-0.5 h-7 w-px bg-(--ui-line)" />
        <IconBtn n={playing ? 'pause' : 'play'} label="استماع" size={48} on={!!playing} onClick={onPlay} />
        <IconBtn n="type" label="إعدادات القراءة" size={48} onClick={onSettings} />
      </div>
    </div>
  )
}

function MiniPlayer({ at }: { at: string }) {
  return (
    <div className="mp-glass mb-2 flex items-center gap-3 rounded-[22px] px-4 py-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--play-line) text-white">
        <I n="volume" s={17} />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[13px] font-semibold">الحصري · {at}</p>
        <span className="relative mt-1.5 block h-1 rounded-full bg-(--ui-ink)/10">
          <span className="absolute inset-y-0 start-0 w-[42%] rounded-full bg-(--play-line)" />
        </span>
      </div>
      <span className="text-[11.5px] tabular-nums text-(--ui-muted)">٠:٠٨</span>
      <IconBtn n="repeat" label="تكرار" size={34} />
    </div>
  )
}

export function Sheet({ title, children, h, onClose }: { title: string; children: ReactNode; h?: number; onClose?: () => void }) {
  return (
    <>
      <div className="absolute inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-40 rounded-t-[30px] bg-(--ui-card) px-5 pb-10 pt-2.5 shadow-[0_-20px_50px_-20px_rgba(0,0,0,.4)]" style={{ height: h }}>
        <span className="mx-auto mb-3 block h-[5px] w-10 rounded-full bg-(--ui-ink)/15" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-semibold">{title}</h3>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="flex h-8 w-8 items-center justify-center rounded-full bg-(--ui-ink)/[.06] text-(--ui-muted)">
            <I n="x" s={15} />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

export function NavSheet({ pg, onClose }: { pg: number; onClose?: () => void }) {
  const [tab, setTab] = useState<'page' | 'surah' | 'juz'>('page')
  return (
    <Sheet title="الانتقال في المصحف" h={560} onClose={onClose}>
      <div role="tablist" className="mb-5 grid grid-cols-3 rounded-full bg-(--ui-ink)/[.06] p-1 text-[13.5px]">
        {([['page', 'صفحة'], ['surah', 'سورة'], ['juz', 'جزء']] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`mp-press h-9 rounded-full ${tab === k ? 'bg-(--ui-card) font-semibold shadow-[0_1px_3px_rgba(0,0,0,.12)]' : 'text-(--ui-muted)'}`}>{l}</button>
        ))}
      </div>
      {tab === 'page' && (
        <div>
          <div className="flex items-center justify-center gap-6">
            <span className="mp-press flex h-12 w-12 items-center justify-center rounded-full bg-(--ui-ink)/[.06]"><I n="minus" s={20} /></span>
            <div className="text-center">
              <p className="mp-serif text-[56px] font-bold leading-none tabular-nums">{toAr(pg)}</p>
              <p className="mt-1 text-[12px] text-(--ui-muted)">من ٦٠٤ صفحة</p>
            </div>
            <span className="mp-press flex h-12 w-12 items-center justify-center rounded-full bg-(--ui-ink)/[.06]"><I n="plus" s={20} /></span>
          </div>
          <div className="relative mx-1 mt-8 h-1.5 rounded-full bg-(--ui-ink)/10">
            <span className="absolute inset-y-0 start-0 rounded-full bg-(--accent)" style={{ width: `${(pg / 604) * 100}%` }} />
            <span className="absolute top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_1px_5px_rgba(0,0,0,.3)]" style={{ insetInlineStart: `${(pg / 604) * 100}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-(--ui-muted)"><span>١</span><span>٣٠٢</span><span>٦٠٤</span></div>
          <p className="mb-2 mt-6 text-[12.5px] font-semibold text-(--ui-muted)">متابعة القراءة</p>
          <div className="space-y-2">
            {[['آخر قراءة', 'سورة البقرة · صفحة ٣'], ['العلامة المرجعية', 'سورة الكهف · صفحة ٢٩٣']].map(([a, b]) => (
              <div key={a} className="flex items-center gap-3 rounded-[16px] bg-(--ui-ink)/[.04] px-4 py-3">
                <I n={a === 'آخر قراءة' ? 'clock' : 'bookmark'} s={18} className="text-(--accent)" />
                <span className="flex-1 text-[13.5px]"><b className="font-semibold">{a}</b> <span className="text-(--ui-muted)">· {b}</span></span>
                <I n="chevron" s={16} className="rotate-180 text-(--ui-muted)" />
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'surah' && (
        <div className="-mx-1 space-y-1">
          <div className="mb-3 flex h-11 items-center gap-2 rounded-full bg-(--ui-ink)/[.05] px-4 text-[13.5px] text-(--ui-muted)"><I n="search" s={17} />ابحث عن سورة</div>
          {SURAHS.slice(0, 6).map((s) => (
            <div key={s.n} className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${s.n === 2 ? 'bg-(--accent-soft)' : ''}`}>
              <span className="mp-serif flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-(--frame) text-[13px]">{toAr(s.n)}</span>
              <span className="flex-1 text-[14px] font-medium">{surahName(s.n)}</span>
              <span className="text-[12px] text-(--ui-muted)">ص {toAr(s.pages[0])}</span>
            </div>
          ))}
        </div>
      )}
      {tab === 'juz' && (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 30 }, (_, k) => k + 1).map((j) => (
            <span key={j} className={`mp-serif flex h-12 items-center justify-center rounded-[14px] text-[17px] ${j === 1 ? 'bg-(--ui-ink) text-(--ui-bg)' : 'bg-(--ui-ink)/[.05]'}`}>{toAr(j)}</span>
          ))}
        </div>
      )}
    </Sheet>
  )
}

export function AyahSheet({ s, a, text, onClose }: { s: number; a: number; text: string; onClose?: () => void }) {
  return (
    <Sheet title={`${surahName(s)} · الآية ${toAr(a)}`} onClose={onClose}>
      <p className="mp-paper mp-text rounded-[18px] px-5 py-4 text-[21px]" style={{ lineHeight: 2, textAlignLast: 'center' }}>
        {text} <span className="mp-num">{toAr(a)}</span>
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {ACTIONS.map((x) => (
          <span key={x.l} className="mp-press flex flex-col items-center gap-1.5 rounded-[18px] bg-(--ui-ink)/[.04] py-3.5 text-[12.5px]">
            <I n={x.n} s={20} className="text-(--accent)" />
            {x.l}
          </span>
        ))}
      </div>
    </Sheet>
  )
}

type Drive = {
  /** Render without the standalone phone frame (the host supplies its own device shell). */
  bare?: boolean
  auto?: boolean
  onView?: (v: MobileView) => void
  onPg?: (n: number) => void
  onBack?: () => void
}

export function MobileReader({ pg, view, tone, setTone, label, bare, auto, onView, onPg, onBack }: { pg: number; view: MobileView; tone: Tone; setTone: (t: Tone) => void; label: string } & Drive) {
  const d = usePage(pg)
  const [mode, setMode] = useState<Mode>('mushaf')
  const [size, setSize] = useState(1)
  const [tap, setTap] = useState<{ s: number; a: number } | null>(null)
  const first = d?.blocks[0]
  const tapped = tap && d?.blocks.find((b) => b.s === tap.s)?.ayat.find((x) => x.a === tap.a)
  const pickS = tapped ? tap.s : first?.s
  const pick = tapped || first?.ayat[Math.min(1, first.ayat.length - 1)]
  const marks: Marks | undefined =
    d && pickS && pick && (view === 'ayah' || view === 'playing') ? { state: { [`${pickS}:${pick.a}`]: view === 'ayah' ? 'selected' : 'playing' } } : undefined
  const chrome = view !== 'immersive'
  const close = onView && (() => onView('reading'))
  // Interactive only when a host drives it; the standalone preview stays a static state board.
  const onAyah = onView && ((s: number, a: number) => (setTap({ s, a }), onView('ayah')))
  // Tapping the page (not an ayah) shows / hides the reading chrome.
  const toggleChrome = onView && ((e: React.MouseEvent) => !(e.target as HTMLElement).closest('.mp-ayah') && onView(chrome ? 'immersive' : 'reading'))
  const body = (
    <div className="mp-canvas absolute inset-0" dir="rtl">
      {d && chrome && <TopBar d={d} onBack={onBack} />}
      <div className={`mp-scroll absolute inset-0 overflow-y-auto px-2.5 ${chrome ? 'pb-[120px] pt-[108px]' : 'pb-10 pt-[52px]'}`} onClick={toggleChrome}>
        {d ? <MushafPage d={d} size={17 * size} compact marks={marks} onAyah={onAyah} /> : <PageSkeleton compact />}
      </div>
      {chrome && view !== 'nav' && view !== 'ayah' && view !== 'settings' && (
        <Dock
          pg={pg}
          playing={view === 'playing' && pickS && pick ? `${SURAHS[pickS - 1].ar} ${toAr(pick.a)}` : undefined}
          onPg={onPg && ((n) => (setTap(null), onPg(n)))}
          onPill={onView && (() => onView('nav'))}
          onPlay={onView && (() => onView(view === 'playing' ? 'reading' : 'playing'))}
          onSettings={onView && (() => onView('settings'))}
        />
      )}
      {view === 'immersive' && <span className="mp-glass pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-[11.5px] text-(--ui-muted)">اضغط على الصفحة لإظهار الأدوات</span>}
      {view === 'nav' && <NavSheet pg={pg} onClose={close} />}
      {view === 'ayah' && pickS && pick && <AyahSheet s={pickS} a={pick.a} text={pick.t} onClose={close} />}
      {view === 'settings' && (
        <Sheet title="إعدادات القراءة" onClose={close}>
          <SettingsPanel tone={tone} setTone={setTone} size={size} setSize={setSize} mode={mode} setMode={setMode} auto={auto} />
        </Sheet>
      )}
    </div>
  )
  return bare ? body : <Phone label={label}>{body}</Phone>
}

export { ModeSwitch }
