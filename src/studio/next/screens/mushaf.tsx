// المصحف الرقمي — the approved Phase 1 Mushaf design, hosted as a first-class
// screen of the Next-generation preview. It reuses the Phase 1 reader
// components as they are (src/studio/mushaf); only the host wiring lives here.
// Design only: no app store, no production Reader, no saved progress.
import { createContext, useContext } from 'react'
import '../../mushaf/mushaf-preview.css'
import { DesktopReader, type Tone } from '../../mushaf/desktop'
import { MobileReader, type MobileView } from '../../mushaf/mobile'
import { Chrome, useDevice, useProto } from '../core'

export type MushafState = { pg: number; view: MobileView; tone: Tone }
export const MUSHAF_DEFAULT: MushafState = { pg: 3, view: 'reading', tone: 'app' }
/** Shared by the desktop and mobile frames so both show the same page and paper. */
export const MushafCtx = createContext<{ s: MushafState; set: (p: Partial<MushafState>) => void }>({ s: MUSHAF_DEFAULT, set: () => {} })

export function DigitalMushaf() {
  const device = useDevice()
  const { go } = useProto()
  const { s, set } = useContext(MushafCtx)
  const setTone = (tone: Tone) => set({ tone })
  const back = () => go('home')

  if (device === 'desktop')
    return (
      <Chrome dock={false}>
        <div className="mp h-full" data-tone={s.tone}>
          <DesktopReader pg={s.pg} setPg={(pg) => set({ pg })} tone={s.tone} setTone={setTone} auto onBack={back} />
        </div>
      </Chrome>
    )
  // Mobile reader is full-screen (no app dock), like the production Reader.
  return (
    <div className="mp absolute inset-0" data-tone={s.tone}>
      <MobileReader bare auto label="" pg={s.pg} view={s.view} tone={s.tone} setTone={setTone} onView={(view) => set({ view })} onPg={(pg) => set({ pg })} onBack={back} />
    </div>
  )
}
