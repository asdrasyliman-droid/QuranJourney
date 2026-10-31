// Design-only Mushaf page for the Phase 1 preview. Reads the verified KFGQPC
// Hafs text and Tanzil page metadata through the existing public helpers in
// lib/quran (read-only); nothing here is used by the production reader.
import { useEffect, useState, type ReactNode } from 'react'
import { BISMILLAH_HAFS, PAGES, hasBismillahHeader, hizbOf, juzOf, loadHafs, pageEnd, surah, toAr } from '../../lib/quran'

export type Block = { s: number; header: boolean; bism: boolean; ayat: { a: number; t: string }[] }
export type PageData = { pg: number; blocks: Block[]; juz: number; hizb: number; quarter: number; surahs: number[] }

/** Curated real pages for the preview (not the production 604-page navigator). */
export const SAMPLE_PAGES = [1, 2, 3, 50, 262, 582, 604]

export function usePage(pg: number): PageData | null {
  const [d, setD] = useState<PageData | null>(null)
  useEffect(() => {
    let live = true
    const [s0, a0] = PAGES[pg - 1]
    const [s1, a1] = pageEnd(pg)
    const ss = Array.from({ length: s1 - s0 + 1 }, (_, i) => s0 + i)
    Promise.all(ss.map((s) => loadHafs(s))).then((all) => {
      if (!live) return
      const blocks = ss.map((s, i) => {
        const from = s === s0 ? a0 : 1
        const to = s === s1 ? a1 : surah(s).ayat
        return { s, header: from === 1, bism: from === 1 && hasBismillahHeader(s), ayat: all[i].slice(from - 1, to).map((t, k) => ({ a: from + k, t })) }
      })
      const h = hizbOf(s0, a0)
      setD({ pg, blocks, juz: juzOf(s0, a0), hizb: h.hizb, quarter: h.quarter, surahs: ss })
    })
    return () => {
      live = false
    }
  }, [pg])
  return d
}

const JUZ_AR = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون', 'الحادي والعشرون', 'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون', 'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون']
export const juzName = (j: number) => `الجزء ${JUZ_AR[j - 1]}`
export const surahName = (s: number) => `سورة ${surah(s).ar}`
export { toAr }

export type AyahState = 'selected' | 'playing'
export type Marks = { state?: Record<string, AyahState>; bookmark?: string }
const key = (s: number, a: number) => `${s}:${a}`

/** Eight-point rosette used at frame corners and in the page medallion. */
export function Rosette({ className = '', size = 18 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="0.9" aria-hidden>
      <rect x="5" y="5" width="10" height="10" rx="0.6" />
      <rect x="5" y="5" width="10" height="10" rx="0.6" transform="rotate(45 10 10)" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Surah title cartouche: a fine framed band with rosettes, name centred. */
export function SurahBanner({ s, compact = false }: { s: number; compact?: boolean }) {
  return (
    <div className={`relative mx-auto flex w-full items-center justify-center ${compact ? 'my-2 h-9' : 'my-3 h-12'}`}>
      <svg viewBox="0 0 400 48" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-(--frame)" fill="none" stroke="currentColor" aria-hidden>
        <path d="M18 4H382L396 24L382 44H18L4 24Z" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M24 8.5H376L387 24L376 39.5H24L13 24Z" strokeWidth="0.6" opacity="0.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <Rosette className="absolute start-[7%] text-(--frame)" size={compact ? 14 : 18} />
      <Rosette className="absolute end-[7%] text-(--frame)" size={compact ? 14 : 18} />
      <span className={`mp-surah-name relative text-(--ink) ${compact ? 'text-[17px]' : 'text-[22px]'}`}>{surahName(s)}</span>
    </div>
  )
}

/** Page number in a small framed medallion. */
export function PageNumber({ pg, compact = false }: { pg: number; compact?: boolean }) {
  const d = compact ? 30 : 38
  return (
    <span className="relative inline-flex items-center justify-center text-(--frame)" style={{ width: d, height: d }}>
      <svg viewBox="0 0 40 40" className="absolute inset-0" fill="none" stroke="currentColor" strokeWidth="0.9" aria-hidden>
        <rect x="9" y="9" width="22" height="22" rx="2" />
        <rect x="9" y="9" width="22" height="22" rx="2" transform="rotate(45 20 20)" />
        <circle cx="20" cy="20" r="9.2" fill="var(--paper)" />
      </svg>
      <span className={`mp-serif relative leading-none text-(--ink) ${compact ? 'text-[12px]' : 'text-[14px]'}`}>{toAr(pg)}</span>
    </span>
  )
}

export function Bookmark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 40" width="22" height="40" className={className} aria-hidden>
      <path d="M0 0h22v40l-11-8-11 8z" fill="var(--accent)" />
      <path d="M3 0v33" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
    </svg>
  )
}

/** Verified Quran text block for one page (no line-level layout data exists, so lines flow and justify). */
export function PageText({ d, size, marks = {}, onAyah }: { d: PageData; size: number; marks?: Marks; onAyah?: (s: number, a: number, el: HTMLElement) => void }) {
  return (
    <div className="flex flex-col">
      {d.blocks.map((b) => (
        <div key={b.s}>
          {b.header && <SurahBanner s={b.s} compact={size < 22} />}
          {b.bism && (
            <p className="mp-text mb-1 text-center" style={{ fontSize: size, lineHeight: 2 }}>
              {BISMILLAH_HAFS}
            </p>
          )}
          <p className="mp-text" style={{ fontSize: size, lineHeight: size < 22 ? 2.05 : 2 }}>
            {b.ayat.map(({ a, t }) => (
              <Ayah key={a} state={marks.state?.[key(b.s, a)]} onClick={onAyah && ((el) => onAyah(b.s, a, el))}>
                {t} <span className="mp-num">{toAr(a)}</span>
                {marks.bookmark === key(b.s, a) && <BookmarkDot />}
              </Ayah>
            ))}
          </p>
        </div>
      ))}
    </div>
  )
}

function Ayah({ state, children, onClick }: { state?: AyahState; children: ReactNode; onClick?: (el: HTMLElement) => void }) {
  return (
    <>
      <span className="mp-ayah" data-state={state} onClick={onClick && ((e) => onClick(e.currentTarget))}>
        {children}
      </span>{' '}
    </>
  )
}

function BookmarkDot() {
  return (
    <svg viewBox="0 0 10 14" width="9" height="13" className="mx-0.5 inline-block -translate-y-[0.6em]" aria-label="علامة مرجعية">
      <path d="M0 0h10v14l-5-3.6L0 14z" fill="var(--accent)" />
    </svg>
  )
}

/** Running header above the frame (surah on the right, juz on the left), like the printed Madinah mushaf. */
export function RunningHead({ d, compact = false }: { d: PageData; compact?: boolean }) {
  return (
    <div className={`mp-serif flex items-center justify-between text-(--ink-soft) ${compact ? 'px-1 text-[12px]' : 'px-2 text-[14px]'}`}>
      <span>{surahName(d.surahs[d.surahs.length - 1])}</span>
      <span>{juzName(d.juz)}</span>
    </div>
  )
}

/** A full physical-style page: running head, framed text block, page medallion. */
export function MushafPage({ d, size, compact = false, marks, onAyah, ribbon = false, className = '' }: { d: PageData; size: number; compact?: boolean; marks?: Marks; onAyah?: (s: number, a: number, el: HTMLElement) => void; ribbon?: boolean; className?: string }) {
  const side = d.pg % 2 ? 'right' : 'left'
  const short = d.blocks.reduce((n, b) => n + b.ayat.length, 0) < 9 && d.pg <= 2
  return (
    <div className={`mp-paper ${compact ? 'rounded-[10px] px-3.5 pb-3 pt-3' : 'rounded-[6px] px-9 pb-6 pt-6'} ${className}`} data-side={side}>
      {ribbon && <Bookmark className="absolute -top-1 end-10 drop-shadow-sm" />}
      <RunningHead d={d} compact={compact} />
      <div className={`mp-frame ${compact ? 'mt-2 rounded-[3px] px-4 py-4' : 'mt-3 rounded-[2px] px-10 py-8'} ${short ? 'flex min-h-[60%] flex-col justify-center' : ''}`}>
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <Rosette key={c} className={`mp-corner ${c}`} />
        ))}
        <PageText d={d} size={size} marks={marks} onAyah={onAyah} />
      </div>
      <div className={`flex justify-center ${compact ? 'mt-2' : 'mt-4'}`}>
        <PageNumber pg={d.pg} compact={compact} />
      </div>
    </div>
  )
}

export function PageSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mp-paper ${compact ? 'rounded-[10px] p-4' : 'rounded-[6px] p-10'}`}>
      <div className="space-y-4 py-6">
        {Array.from({ length: compact ? 12 : 14 }, (_, i) => (
          <div key={i} className="h-3 rounded-full bg-(--frame-soft) opacity-40" style={{ width: `${88 - (i % 3) * 6}%`, marginInline: 'auto' }} />
        ))}
      </div>
    </div>
  )
}
