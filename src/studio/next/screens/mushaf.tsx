// المصحف الرقمي — the approved Phase 1 Mushaf design, hosted as a first-class
// screen of the Next-generation preview. It reuses the Phase 1 reader
// components as they are (src/studio/mushaf); only the host wiring lives here.
// Design only: no app store, no production Reader, no saved progress.
import { createContext, useContext } from 'react'
import '../../mushaf/mushaf-preview.css'
import { DesktopReader, type Tone } from '../../mushaf/desktop'
import { MobileReader, type MobileView } from '../../mushaf/mobile'
import type { Focus } from '../../mushaf/page'
import { Chrome, useDevice } from '../core'
import { MushafIndex } from './mushafIndex'

/** `stage`: the surah / juz index first, then the reader (like opening a mushaf from its contents). */
export type MushafState = { pg: number; view: MobileView; tone: Tone; stage: 'index' | 'reader'; focus?: Focus }
export const MUSHAF_DEFAULT: MushafState = { pg: 3, view: 'reading', tone: 'app', stage: 'index' }
/** Shared by the desktop and mobile frames so both show the same page and paper. */
export const MushafCtx = createContext<{ s: MushafState; set: (p: Partial<MushafState>) => void }>({ s: MUSHAF_DEFAULT, set: () => {} })

export function DigitalMushaf() {
  const device = useDevice()
  const { s, set } = useContext(MushafCtx)
  const setTone = (tone: Tone) => set({ tone })
  const back = () => set({ stage: 'index', view: 'reading' })
  // A fresh object each time, so re-opening the same surah scrolls to it again.
  const open = (pg: number, focus?: Focus) => set({ pg, stage: 'reader', view: 'reading', focus: focus && { ...focus } })

  if (s.stage === 'index') return <MushafIndex pg={s.pg} onOpen={open} />

  if (device === 'desktop')
    return (
      <Chrome dock={false}>
        <div className="mp h-full" data-tone={s.tone}>
          <DesktopReader pg={s.pg} setPg={(pg) => set({ pg })} tone={s.tone} setTone={setTone} auto onBack={back} focus={s.focus} />
        </div>
      </Chrome>
    )
  // Mobile reader is full-screen (no app dock), like the production Reader.
  return (
    <div className="mp absolute inset-0" data-tone={s.tone}>
      <MobileReader bare auto label="" pg={s.pg} view={s.view} tone={s.tone} setTone={setTone} onView={(view) => set({ view })} onPg={(pg) => set({ pg })} onBack={back} focus={s.focus} />
    </div>
  )
}
