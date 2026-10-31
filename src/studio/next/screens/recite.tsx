// رحلة التسميع — recitation workflow (design preview). The engine status is the
// REAL one (lib/useEngine polls the local Muaalem service). No analysis is run
// and no result is ever fabricated: the "completed" state is a display template.
import { useEffect, useState, type ReactNode } from 'react'
import { Chrome, Head, Icon, MoreTabs, toAr, useDevice } from '../core'
import { JOURNEY } from '../data'
import { useEngine } from '../../../lib/useEngine'
import { loadMushaf, surah, words } from '../../../lib/quran'

type St = 'ready' | 'recording' | 'uploading' | 'analyzing' | 'done' | 'teacher' | 'unavailable'
const STATES: { id: St; ar: string }[] = [
  { id: 'ready', ar: 'جاهز' },
  { id: 'recording', ar: 'جارٍ التسجيل' },
  { id: 'uploading', ar: 'جارٍ الإرسال' },
  { id: 'analyzing', ar: 'جارٍ التحليل' },
  { id: 'done', ar: 'اكتمل التحليل' },
  { id: 'teacher', ar: 'بانتظار المعلّم' },
  { id: 'unavailable', ar: 'التحليل غير متاح' },
]
const STAGES = [
  { ar: 'التسجيل', icon: 'mic' },
  { ar: 'إرسال الصوت', icon: 'upload' },
  { ar: 'تحليل الكلام', icon: 'wave' },
  { ar: 'مطابقة النص القرآني', icon: 'book' },
  { ar: 'تحديد مواضع محتملة', icon: 'target' },
  { ar: 'المراجعة وملاحظات المعلّم', icon: 'users' },
]
type SS = 'done' | 'active' | 'todo' | 'off'
const stageStates = (s: St): SS[] => {
  const m: Record<St, SS[]> = {
    ready: ['active', 'todo', 'todo', 'todo', 'todo', 'todo'],
    recording: ['active', 'todo', 'todo', 'todo', 'todo', 'todo'],
    uploading: ['done', 'active', 'todo', 'todo', 'todo', 'todo'],
    analyzing: ['done', 'done', 'active', 'todo', 'todo', 'todo'],
    done: ['done', 'done', 'done', 'done', 'done', 'active'],
    teacher: ['done', 'done', 'done', 'done', 'done', 'active'],
    unavailable: ['done', 'off', 'off', 'off', 'off', 'active'],
  }
  return m[s]
}

export function ReciteJourney() {
  const device = useDevice()
  const eng = useEngine()
  const offline = eng.status === 'offline'
  const [st, setSt] = useState<St>('ready')
  useEffect(() => {
    if (offline) setSt('unavailable')
  }, [offline])
  const real = (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${eng.status === 'online' ? 'bg-leaf/10 text-leaf' : eng.status === 'checking' ? 'bg-night/[.05] text-muted' : 'bg-clay/10 text-clay'}`}>
      <span className={`h-2 w-2 rounded-full ${eng.status === 'online' ? 'bg-leaf' : eng.status === 'checking' ? 'animate-pulse bg-muted' : 'bg-clay'}`} />
      المحرك الفعلي: {eng.status === 'online' ? 'متصل' : eng.status === 'starting' ? 'يبدأ…' : eng.status === 'checking' ? 'يتحقّق…' : 'غير متصل'}
    </div>
  )
  const picker = (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1" role="radiogroup" aria-label="حالات الواجهة">
      {STATES.map((x) => (
        <button key={x.id} type="button" role="radio" aria-checked={st === x.id} onClick={() => setSt(x.id)} className={`press shrink-0 rounded-full px-3 py-1.5 text-[12px] ${st === x.id ? 'bg-night text-parchment' : 'bg-card ring-1 ring-line text-night/75'}`}>{x.ar}</button>
      ))}
    </div>
  )
  const simulated = st !== 'unavailable' && st !== 'ready' && eng.status !== 'online'
  const card = (
    <div>
      {simulated && (
        <p className="mb-3 flex items-start gap-2 rounded-[16px] bg-sky/10 p-3 text-[12.5px] leading-relaxed text-night/80">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-sky" />
          معاينة لشكل هذه الحالة فقط. المحرك غير متصل، فلا يُرسل أي صوت ولا يُجرى أي تحليل.
        </p>
      )}
      <StateCard st={st} recheck={eng.recheck} />
    </div>
  )
  if (device === 'desktop')
    return (
      <Chrome>
        <div className="no-scrollbar h-full overflow-y-auto px-10 py-9">
          <Head title="رحلة التسميع" sub={`سورة ${surah(JOURNEY.s).ar} · الآيات ${toAr(JOURNEY.from)}–${toAr(JOURNEY.to)} · من التسجيل إلى ملاحظات المعلّم`} action={real} />
          <div className="mb-6">{picker}</div>
          <div className="grid grid-cols-[300px_1fr] gap-8">
            <Pipeline st={st} />
            {card}
          </div>
        </div>
      </Chrome>
    )
  return (
    <Chrome>
      <div className="px-5 pb-8 pt-4">
        <MoreTabs />
        <Head title="رحلة التسميع" sub={`سورة ${surah(JOURNEY.s).ar} ${toAr(JOURNEY.from)}–${toAr(JOURNEY.to)}`} />
        <div className="mb-3 flex">{real}</div>
        <div className="mb-4">{picker}</div>
        <Pipeline st={st} compact />
        <div className="mt-4">{card}</div>
      </div>
    </Chrome>
  )
}

function Pipeline({ st, compact = false }: { st: St; compact?: boolean }) {
  const ss = stageStates(st)
  if (compact)
    return (
      <ol className="flex items-center" aria-label="مراحل التسميع">
        {STAGES.map((g, i) => (
          <li key={g.ar} className="flex flex-1 items-center">
            <Dot s={ss[i]} icon={g.icon} label={g.ar} />
            {i < STAGES.length - 1 && <span className={`h-0.5 flex-1 ${ss[i] === 'done' ? 'bg-leaf' : 'bg-line'}`} />}
          </li>
        ))}
      </ol>
    )
  return (
    <ol className="relative space-y-1" aria-label="مراحل التسميع">
      {STAGES.map((g, i) => (
        <li key={g.ar} className="relative flex items-center gap-3 rounded-[18px] p-2.5">
          {i < STAGES.length - 1 && <span className={`absolute start-[30px] top-[52px] h-[calc(100%-36px)] w-0.5 ${ss[i] === 'done' ? 'bg-leaf' : 'bg-line'}`} />}
          <Dot s={ss[i]} icon={g.icon} label={g.ar} />
          <div>
            <p className={`text-[14px] ${ss[i] === 'active' ? 'font-semibold' : ss[i] === 'off' ? 'text-muted line-through decoration-muted/50' : ''}`}>{toAr(i + 1)}. {g.ar}</p>
            <p className="text-[11.5px] text-muted">{ss[i] === 'done' ? 'تمّت' : ss[i] === 'active' ? 'الآن' : ss[i] === 'off' ? 'غير متاحة' : 'لاحقًا'}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Dot({ s, icon, label }: { s: SS; icon: string; label: string }) {
  const c = s === 'done' ? 'bg-leaf text-white' : s === 'active' ? 'bg-gold text-white ring-4 ring-gold/20' : s === 'off' ? 'bg-night/[.04] text-muted/60 ring-1 ring-dashed ring-line' : 'bg-card text-muted ring-1 ring-line'
  return <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${c}`} title={label}><Icon name={s === 'done' ? 'check' : s === 'off' ? 'x' : icon} size={17} /></span>
}

function Shell({ children, tone = 'card' }: { children: ReactNode; tone?: 'card' | 'quiet' }) {
  return <div className={`rounded-[28px] p-6 ${tone === 'card' ? 'bg-card ring-1 ring-line' : 'bg-night/[.03] ring-1 ring-line'}`}>{children}</div>
}

function StateCard({ st, recheck }: { st: St; recheck: () => void }) {
  const [t, setT] = useState(0)
  const [ayat, setAyat] = useState<string[]>([])
  useEffect(() => {
    loadMushaf(JOURNEY.s).then((r) => setAyat(r.ayat.slice(JOURNEY.from - 1, JOURNEY.to)))
  }, [])
  useEffect(() => {
    if (st !== 'recording' && st !== 'uploading') return setT(0)
    const id = setInterval(() => setT((x) => x + 1), st === 'recording' ? 1000 : 120)
    return () => clearInterval(id)
  }, [st])
  const mm = `${toAr(Math.floor(t / 60))}:${toAr(String(t % 60).padStart(2, '0'))}`
  if (st === 'ready' || st === 'recording')
    return (
      <Shell>
        <div className="flex flex-col items-center py-4 text-center">
          <p className="text-[13px] text-muted">{st === 'ready' ? 'عندما تكون مستعدًا، اضغط وابدأ التلاوة من الذاكرة' : 'نستمع إليك… تلُ بتأنٍّ'}</p>
          <div className="my-6 flex h-16 items-end gap-1" aria-hidden>
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} className={`w-1.5 rounded-full ${st === 'recording' ? 'bg-gold' : 'bg-night/15'}`} style={{ height: st === 'recording' ? `${20 + ((i * 37 + t * 13) % 60)}%` : '18%', transition: 'height 300ms ease' }} />
            ))}
          </div>
          <button type="button" className={`press flex h-20 w-20 items-center justify-center rounded-full text-white ${st === 'recording' ? 'bg-clay ring-8 ring-clay/15' : 'bg-night'}`} aria-label={st === 'recording' ? 'إيقاف التسجيل' : 'ابدأ التسجيل'}>
            <Icon name={st === 'recording' ? 'stop' : 'mic'} size={30} fill={st === 'recording'} />
          </button>
          <p className="mt-4 text-[15px] font-semibold tabular-nums">{st === 'recording' ? mm : 'جاهز'}</p>
          <p className="mt-1 text-[12px] text-muted">الحد الأقصى ٢ دقيقة · يُحفظ التسجيل على جهازك</p>
        </div>
      </Shell>
    )
  if (st === 'uploading' || st === 'analyzing')
    return (
      <Shell>
        <div className="py-6 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft text-gold"><Icon name={st === 'uploading' ? 'upload' : 'wave'} size={28} /></span>
          <p className="mt-4 font-semibold">{st === 'uploading' ? 'يُرسل التسجيل إلى المحرك…' : 'يحلّل المحرك التلاوة ويطابقها مع النص…'}</p>
          <div className="mx-auto mt-5 h-2 w-64 overflow-hidden rounded-full bg-night/10">
            <span className={`block h-full rounded-full bg-gold ${st === 'analyzing' ? 'w-1/3 animate-pulse' : ''}`} style={st === 'uploading' ? { width: `${Math.min(100, t * 4)}%` } : undefined} />
          </div>
          <p className="mt-3 text-[12px] text-muted">يمكنك مغادرة الشاشة؛ ستصلك النتيجة هنا.</p>
        </div>
      </Shell>
    )
  if (st === 'done')
    return (
      <Shell>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">قالب عرض النتيجة</p>
            <p className="text-[12.5px] text-muted">تظهر الملاحظات على الكلمات بعد تحليل حقيقي فقط.</p>
          </div>
          <span className="shrink-0 rounded-full bg-clay/10 px-2.5 py-1 text-[11px] font-semibold text-clay">لا توجد نتيجة حقيقية</span>
        </div>
        <div className="mf-paper rounded-[20px] p-5">
          <p className="mf-text text-[22px]" style={{ lineHeight: 2.1 }}>
            {ayat.slice(0, 2).map((a, i) => (
              <span key={i}>
                {words(a).map((w, k) => <span key={k} className="mx-0.5 rounded-md px-0.5 ring-1 ring-[var(--mf-frame-soft)]">{w}</span>)} <span className="mf-num">{toAr(JOURNEY.from + i)}</span>{' '}
              </span>
            ))}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
          {[['bg-leaf', 'مطابق'], ['bg-gold', 'موضع للمراجعة'], ['bg-sky', 'لم يُلتقط بوضوح']].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5 rounded-full bg-night/[.04] px-3 py-1.5"><span className={`h-2.5 w-2.5 rounded-full ${c}`} />{l}</span>
          ))}
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-muted">نتائج المحرك التجريبي «مواضع محتملة» وليست حكمًا على التلاوة؛ المرجع هو المعلّم.</p>
        <button type="button" className="press mt-4 h-11 w-full rounded-full bg-night text-[13.5px] font-semibold text-parchment">أرسل للمعلّم للمراجعة</button>
      </Shell>
    )
  if (st === 'teacher')
    return (
      <Shell>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky/12 text-sky"><Icon name="users" size={22} /></span>
          <div className="flex-1">
            <p className="font-semibold">بانتظار مراجعة المعلّم</p>
            <p className="text-[12.5px] text-muted">أُرسل التسجيل إلى ملف المشرف على هذا الجهاز</p>
          </div>
        </div>
        <ol className="mt-5 space-y-3 border-s-2 border-line ps-4 text-[13px]">
          <li><b className="font-semibold">أُرسل التسجيل</b> <span className="text-muted">· الآن</span></li>
          <li className="text-muted">يستمع المعلّم ويكتب ملاحظته</li>
          <li className="text-muted">تصلك «أحسنت» أو «تحتاج مراجعة» مع الملاحظة</li>
        </ol>
        <button type="button" className="press mt-5 h-11 w-full rounded-full bg-night/[.05] text-[13.5px] font-medium">استمع لتسجيلك</button>
      </Shell>
    )
  return (
    <Shell tone="quiet">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-night/[.06] text-muted"><Icon name="wave" size={28} /></span>
        <p className="mt-4 text-[17px] font-semibold">التحليل الآلي غير متاح الآن</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted">محرك التسميع التجريبي غير متصل، لذلك لن يُحلَّل تسجيلك ولن تُعرض أي نتيجة. ما زال بإمكانك التسجيل والمتابعة بطرق أخرى:</p>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {[['mic', 'سجّل واحفظه', 'على جهازك'], ['users', 'أرسله لمعلّمك', 'لمراجعة بشرية'], ['eye', 'تحقّق بنفسك', 'قارن بالنص']].map(([i, a, b]) => (
          <button key={a} type="button" className="press rounded-[20px] bg-card p-4 text-center ring-1 ring-line hover:ring-gold/40">
            <Icon name={i} size={20} className="mx-auto text-gold" />
            <p className="mt-2 text-[13.5px] font-semibold">{a}</p>
            <p className="text-[11.5px] text-muted">{b}</p>
          </button>
        ))}
      </div>
      <button type="button" onClick={recheck} className="press mx-auto mt-4 flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] text-muted hover:bg-night/5"><Icon name="refresh" size={16} />أعد التحقّق من المحرك</button>
    </Shell>
  )
}
